var apiUrl = "/api/categories/";
var cursor = "";
var pageSize = 10;
var isChange = false;
var hasNext = false;
var isSort = true;


$( document ).ready(function(){
	// onload
	crudLoadSchema();
	crudLoadMore();
	
	// initial date time picker
	$('.form_datetime').datetimepicker({
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		forceParse: 0,
		format: "mm/dd/yyyy, H:ii:ss P",
        showMeridian: 1
    });
	
	// delete button click
	$('#btnDelete').on('click', function(){
		var itemsToDelete = [];
		$("input.checkBox:checked").each (function () {
			itemsToDelete.push($(this).val());
		});

		if(itemsToDelete.length > 0) {
			$('#confirmModal').modal('show');
			$('#deleteAPI').on('click', function(){
				for(i in itemsToDelete) {
					crudDelete(itemsToDelete[i], function(){});
				}
				window.location.reload();
			})
		}
	});

    $("#checkAll").change(function(){
    	$(".checkBox").prop('checked', $(this).prop("checked"));
    });

    $(document).on('click', '.endLoadMore', function(){
    	$('#infoMessage').html("No more data to load");
		$('#infoModal').modal('show');
    });
    
    $('#perPage').on('change', function(){
    	pageSize = $(this).val();
    	cursor = "";
    	$("#tableBody").empty();
    	crudLoadMore();
    })

    
    // search button click
    $('#btnSearch').on('click', function(){
    	var searchQuery = $('#searchBox').val();
    	if(searchQuery != "") {
    		$('#tab-update a[href="#update-entity"]').tab('show');
    		crudRead(searchQuery, function(data){
    			if(data) {
    				hideNoResultAlert();
    				crudPopulateReadData(data);
    			}
    		})
    	}
    });
    
    $('#btnSuccess').on('click', function(){
    	window.location.reload();
    });
    
    // add input to collection box
    $(document).on('click','.btnAddCollection',function(e){
    	key = $(this).val();
    	prefix = $(this).attr('prefix');
    	$('#' + prefix + key).append("<div class='col-xs-11'><input type='text' class='form-control margin-bottom-5 "+prefix+"collectionItem_" + key + "' placeholder='collection item'/>" +
    			"<button class='btn btn-default btnRemoveItem'><span class='glyphicon glyphicon-minus'></span></button></div>");
    	e.preventDefault();
    })
    
    // remove collection item
    $(document).on('click', '.btnRemoveItem', function(e){
    	var firstItem = $(this).prev().attr('class');
    	if(firstItem.indexOf("first") != -1) {
    		$(this).prev().val('');
    	}else{
    		$(this).parents('div.col-xs-11').remove();
    	}
    	e.preventDefault();
    })

})

/**
 * API for getting schema
 * Method: GET
 * */
function crudLoadSchema() {
    $.ajax(apiUrl + "v1/schema", {
        async: false
    })
    .success(function(data, statusText, jqXHR) {
        $("#create-entity").data("schema", data);
        $("title").text(data.tableName);
        $("#tableName").text(data.tableName);

        // All
        $("#tableHead").empty();
        $("#tableHead").append("<td><input type='checkbox' id='checkAll'></td>");
        $("#tableHead").append("<th>" + data.primaryKeyName + "</th>");

        // Create
        /*$("#createFieldset").append("<label for='create_" + data.primaryKeyName + "'>" + data.primaryKeyName + "</label>" +
            "<input id='create_" + data.primaryKeyName + "' name='" + data.primaryKeyName + "' type='" + data.primaryKeyType + 
            "' placeholder='primary key' class='form-control'/><br/>");*/
        if ("number" == data.primaryKeyType) {
            $("#create_" + data.primaryKeyName).attr("disabled", "disabled");
        }

        // Update
        $("#updateFieldset").append("<div class='control-group'>" + 
            "<label class='control-label' for='update_" + data.primaryKeyName + "'>" + data.primaryKeyName + "</label>" +
            "<div class='controls' >" +
            "<input id='update_" + data.primaryKeyName + "' name='" + data.primaryKeyName + "' type='" + data.primaryKeyType + 
            "' readonly='readonly' class='form-control' />" +
            "</div></div>");

        $.map(data.columns, function(item, key) {
        	if (!crudIsAuditField(key)) {
                $("#tableHead").append("<th>" + key + "</th>");
            }

            // generate Create form
            if (!crudIsAuditField(key)) {
            	if(item == "boolean") {
            		$("#createFieldset").append("<label for='create_" + key + "'>" + key + "</label><br/>" +
            		"<select class='form-control' id='create_" + key + "' name='" + key + "'><option value=''>please select</option><option value='true'>True</option><option value='false'>False</option></select><br/>");
            	}
            	else if (item == "long") {
            		$("#createFieldset").append("<label for='create_" + key + "'>" + key + "</label><br/>" +
                    		"<input type='text' id='create_" + key + "' name='" + key + "' class='longOnly form-control'/><br/>");
            	}
            	else if (item == "number") {
            		$("#createFieldset").append("<label for='create_" + key + "'>" + key + "</label><br/>" +
                    		"<input type='text' id='create_" + key + "' name='" + key + "' class='numberOnly form-control'/><br/>");
            	}
            	else if(item == "datetime") {
            		$("#createFieldset").append("<label for='create_" + key + "'>" + key + "</label><br/>" +
                    		"<div class='input-group date form_datetime col-md-12' data-date-format='dd/mm/yyyy, HH:ii:ss p'> "+
                    		"<input class='form-control' size='16' type='text' value='' id='create_" + key + "' name='" + key + "'>" +
                    		"<span class='input-group-addon'><span class='glyphicon glyphicon-calendar'></span></span></div><br/>");
            	}
            	else if(item == "Collection") {
            		$("#createFieldset").append("<label for='create_" + key + "'>" + key + "</label><br/>" +
                    		"<div class='row collectionBox_" + key + "' id='create_" + key + "' name='" + key + "'><div class='col-xs-11'><input type='text' class='form-control first margin-bottom-5 create_collectionItem_" + key + "' placeholder='collection item'/>" +
                    		"<button class='btn btn-default btnRemoveItem'><span class='glyphicon glyphicon-minus'></span></button></div>" +
                    		"<div class='col-xs-1'><button class='btn btn-default btnAddCollection' prefix='create_' value='" + key + "'><span class='glyphicon glyphicon-plus'></span></button></div></div><br/>");
            	}
            	else{
            		$("#createFieldset").append("<label for='create_" + key + "'>" + key + "</label>" +
                            ('text' == item ? 
                            "<textarea id='create_" + key + "' name='" + key + "' class='form-control'></textarea>" :
                            "<input id='create_" + key + "' name='" + key + "' type='" + item + "' class='form-control'/>" )
                            + "<br/>");
            	}
            }

            // generate Update form
            if (!crudIsAuditField(key)) {
	            if(item == "boolean") {
	            	$("#updateFieldset").append("<div class='control-group'>" +
	            	"<label class='control-label' for='update_" + key + "'>" + key + "</label><br/>" +
	            	"<select class='form-control' id='update_" + key + "' name='" + key + "'><option value=''>please select</option><option value='true'>True</option><option value='false'>False</option></select><br/>");
	        	}
	            else if (item == "long") {
            		$("#updateFieldset").append("<label for='update_" + key + "'>" + key + "</label><br/>" +
                    		"<input type='text' id='update_" + key + "' name='" + key + "' class='longOnly form-control'/><br/>");
            	}
            	else if (item == "number") {
            		$("#updateFieldset").append("<label for='update_" + key + "'>" + key + "</label><br/>" +
                    		"<input type='text' id='update_" + key + "' name='" + key + "' class='numberOnly form-control'/><br/>");
            	}
	            else if(item == "datetime") {
            		$("#updateFieldset").append("<label for='update_" + key + "'>" + key + "</label><br/>" +
                    		"<div class='input-group date form_datetime col-md-12' data-date-format='mm/dd/yyyy, H:ii:ss P'> "+
                    		"<input class='form-control' size='16' type='text' value='' id='update_" + key + "' name='" + key + "'>" +
                    		"<span class='input-group-addon'><span class='glyphicon glyphicon-calendar'></span></span></div><br/>");
            	}
	            else if(item == "Collection") {
	            	$("#updateFieldset").append("<label for='update_" + key + "'>" + key + "</label><br/>" +
	            			"<div class='row update_collectionBox_" + key + "' id='update_" + key + "' name='" + key + "'></div>");
	            }
	            else {
	            	$("#updateFieldset").append("<div class='control-group'>" +
	            	"<label class='control-label' for='update_" + key + "'>" + key + "</label>" +
		            "<div class='controls' >" +
		            ('text' == item ? 
				     "<textarea id='update_" + key + "' name='" + key + " ' class='form-control'></textarea>" :
					 "<input id='update_" + key + "' name='" + key + "' type='" + item + "' class='form-control'/>" ) + 
		            "</div></div>");
	            }
            }

            if (crudIsAuditField(key)) {
//                $("#update_" + key).attr("readonly", "readonly");
            }
        });
    })
}

function crudLoadMore() {
    if(cursor == "") {
    	$("#tableBody").empty();
    }

    var body = {};
    var schema = $("#create-entity").data("schema");
    crudGetPage(body, function(data, statusText, jqXHR) {
    	hasNext = data.hasNext;
    	if(hasNext) {
    		cursor = data.cursor;
    		$('#btnLoadMore').attr("class","btn btn-primary");
    		$('#btnLoadMore').html("Load more");
    		$('#btnLoadMore').attr('onclick','crudLoadMore();');
    	}else{
    		$('#btnLoadMore').attr('class','btn btn-default endLoadMore');
    		$('#btnLoadMore').attr('onclick','');
    		$('#btnLoadMore').html('End of data');
    	}

        $.map(data.items, function(item, index) {
            crudAddEntity(item, index, schema);
        });
        
        if(isSort) {
        	$("#sortTable").tablesorter();
        	isSort = false;
        }else{
        	$("#sortTable").trigger("update");
        }
    });
}

// add all data to table row
function crudAddEntity(item, index, schema) {
    var primaryKey = item[schema.primaryKeyName];
    $("#tableBody").append("<tr id='all_" + primaryKey + "' ><td>" +
        "<input type='checkbox' id='" + 
        primaryKey + "." + schema.primaryKeyName + "' class='checkBox' value='" + primaryKey + "'/>" +
        "</td><td><a href='#update-entity' onclick='crudPopulateUpdate(\"" + 
        primaryKey + "\");' data-toggle='tab'>"+primaryKey+"</a></td></tr>");
    var value;
    //var title = "";
    //var first = true;
    $.map(schema.columns, function(clazz, key) {
        value = item[key];
        if(value==null) {
        	value = "";
        }
        if ("datetime" == clazz) {
            value = crudFormatMillis(value);
        }
        if (crudIsAuditField(key)) {
            //title = title + key + " " + value + ", ";
            $("#all_" + primaryKey).append("<input type='hidden' id='" + primaryKey + "X" + key + "' value='" + value + "' />");
        }
        else {
        	$("#all_" + primaryKey).append("<td id='" + primaryKey + "X" + key + "'>" + value + "</td>");
        }
    });
    //$("#all_" + primaryKey).attr('title', title);
}

// populate update data to form
function crudPopulateUpdate(primaryKey) {
	$('#tab-update').addClass('active');
	$('#tab-home').removeClass('active');
	hideNoResultAlert();
	
	
    var schema = $("#create-entity").data("schema");
    var value = primaryKey;
    $("#update_" + schema.primaryKeyName).val(value);
    $.map(schema.columns, function(clazz, key) {
    	var first = true;
    	if (crudIsAuditField(key)) {
            value = $("#" + primaryKey + "X" + key).val();
        }
        else {
            value = $("#" + primaryKey + "X" + key).text();
        }

        if ("text" == clazz) {
            $("#update_" + key).text(value);
        }
        else if("Collection" == clazz) {
        	$('.update_collectionBox_'+key).html('');
        	collection = value.split(",");
        	for( item in collection ){
        		var button = "";
            	var firstClass = "";
        		if(first) {
            		button = "<div class='col-xs-1'><button class='btn btn-default btnAddCollection' prefix='update_' value='" + key + "'><span class='glyphicon glyphicon-plus'></span></button></div>";
            		firstClass = "first";
        		}
            	
        		$('.update_collectionBox_'+key).append("<div class='col-xs-11'><input type='text' class='form-control "+firstClass+" margin-bottom-5 update_collectionItem_" + key + "' value='" + collection[item] + "' placeholder='collection item'/>" +
        				"<button class='btn btn-default btnRemoveItem'><span class='glyphicon glyphicon-minus'></span></button></div>"+button);
        		first = false;
        	}
        }
        else {
            $("#update_" + key).val(value);
        }
    });

}

// format date time to [MM/DD/YYYY, H:mm:ss P]
function crudFormatMillis(millis) {
    var d = new Date(millis);
    //    return d.toUTCString();
    return d.toLocaleString();
}

// fields for skip
function crudIsAuditField(key) {
	//"createdDate" == key || "updatedDate" == key
   return "createdBy" == key ||  "updatedBy" == key  ||  "version" == key || "mainLocation" == key; 
}

// invoke update API
function crudUpdateEntity() {
    var body = crudUpsertEntity("#update_");
    delete body.createdDate;
    delete body.updatedDate;
    crudUpdate(body.id, body, function(data, statusText, jqXHR) {
    	$('#successText').html("Data update successfully.")
    	$('#successModal').modal('show');
    });
}

// collect data by id
function crudUpsertEntity(idPrefix) {
    var body = {};
    var schema = $("#create-entity").data("schema");
    var val;
    
    // add primary key?
    if ("#update_" == idPrefix || "text" == schema.primaryKeyType) {
        val = $(idPrefix + schema.primaryKeyName).val();
        if (val && 0 < val.length) {
            body[schema.primaryKeyName] = val;
        }
    }

    // map properties
    $.map(schema.columns, function(item, key) {
        if ("#create_" == idPrefix && crudIsAuditField(key)) {
            // do not map to body when creating
        }
        else {
        	if(item == "datetime") {
        		body[key] = new moment(new Date($(idPrefix + key).val())).format("YYYY-MM-DDTHH:mm:ssZZ");
        	}
        	else if(item == "Collection") {
        		body[key] = crudUpsertCollection(idPrefix, key);
        	}
        	else {
        		body[key] = $(idPrefix + key).val();
        	}
        }
    });
    return body;
}

// get all collection items
function crudUpsertCollection(idPrefix, key) {
	var collection = [];
	var prefix = "create_";
	if('#update_' == idPrefix) {
		var prefix = "update_";
	}
	$('div input.'+prefix+'collectionItem_'+key).each(function(){
		var item = $(this).val();
		if(item != "") {
			collection.push(item);
		}
	})
	return collection;
}

// populate data for search result to form
function crudPopulateReadData(data){
	var schema = $("#create-entity").data("schema");
    $("#update_" + schema.primaryKeyName).val(data[schema.primaryKeyName]);
    $.map(schema.columns, function(clazz, key) {
        if (!crudIsAuditField(key)) {
        	if ("text" == clazz) {
                $("#update_" + key).text(data[key]);
            }
        	else if("datetime" == clazz) {
        		$("#update_" + key).val(crudFormatMillis(data[key]));
        	}
            else {
                $("#update_" + key).val(data[key]);
            }
        }
    });
}

// invoke create API
function crudCreateEntity() {
    var body = crudUpsertEntity("#create_");
    
    crudCreate(body, function(data, statusText, jqXHR) {
    	$('#successText').html("Data create successfully.")
    	$('#successModal').modal('show');
        document.getElementById("createForm").reset();
    });
}


/**
 * API for load all with pagination
 * Method: GET
 * */
function crudGetPage(body, successFunction) {
	if(hasNext) {
		$.getJSON(apiUrl+"v1?pagesize="+pageSize+"&cursorkey="+cursor, body)
	    .success(successFunction);
    }
	else {
		$.getJSON(apiUrl+"v1?pagesize="+pageSize, body)
	    .success(successFunction);
    }
}


/**
 * API for create
 * Method: POST
 * Content-Type: application/json
 * */
function crudCreate(body, successFunction) {
	$.ajax({
		url: apiUrl + "v1/json",
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify(body),
		dataType: 'json',
		statusCode: {
			400: function(data){
				var responseObject = JSON.parse(data.responseText);
				$('#httpCode').html(responseObject.httpCode);
				$('#responseMessage').html(responseObject.message);
				$('#warningModal').modal('show');
			},
			500: function(data){
				$('#httpCode').html("500");
				$('#responseMessage').html("Something went wrong!");
				$('#warningModal').modal('show');
			}
		}
	}).success(successFunction);
}

/**
 * API for update
 * Method: POST
 * Content-Type: application/json
 * */
function crudUpdate(id, body, successFunction) {
	$.ajax({
		url: apiUrl + "v1/"+id+"/json",
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify(body),
		dataType: 'json',
		statusCode: {
			400: function(data){
				var responseObject = JSON.parse(data.responseText);
				$('#httpCode').html(responseObject.httpCode);
				$('#responseMessage').html(responseObject.message);
				$('#warningModal').modal('show');
			},
			500: function(data){
				$('#httpCode').html("500");
				$('#responseMessage').html("Something went wrong!");
				$('#warningModal').modal('show');
			}
		}
	}).success(successFunction);
}


/**
 * API for delete
 * Method: DELETE
 * path_variable: id
 * */
function crudDelete(id, successFunction) {
    $.ajax({
		url: apiUrl + "v1/"+id,
		type: 'DELETE',
		dataType: 'json'
	}).success(successFunction);
}

/**
 * API for read / search
 * Method: GET
 * path_variable: id
 * */
function crudRead(id, successFunction) {
    $.ajax({
		url: apiUrl + "v1/"+id,
		type: 'GET',
		dataType: 'json',
		statusCode: {
			400 : showNoResultAlert(),
			404 : showNoResultAlert()
		}
	}).success(successFunction);
}
function showNoResultAlert() {
	$('#noResult').removeClass('hide');
	$('#updateForm, #updateButton').addClass('hide');
}
function hideNoResultAlert() {
	$('#noResult').addClass('hide');
	$('#updateForm, #updateButton').removeClass('hide');
}

// allow only number
$(document).on('keypress', '.longOnly', function(event){
	var x = event.which || event.keyCode;
	if((x<48 || x>57) && x!=8 && x!=37 && x!=39){
		return false;		
	}
});

// allow decimal number
$(document).on('keypress', '.numberOnly', function(event){
	var x = event.which || event.keyCode;
	if((x<48 || x>57) && x!=8 && x!=37 && x!=39 && x!=46){
		return false;
	}
	if(x==46){
		var value = $(this).val();
		if(value.indexOf(".") != -1){
			return false;
		}
	}
});

// **** Sticky scroll
function sticky_relocate() {
    var window_top = $(window).scrollTop();
    if (window_top > 235) {
        $('#sticky').addClass('stick');
    } else {
        $('#sticky').removeClass('container stick');
    }
}
$(function() {
    $(window).scroll(sticky_relocate);
    sticky_relocate();
});


