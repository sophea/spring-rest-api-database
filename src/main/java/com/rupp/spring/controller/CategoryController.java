package com.rupp.spring.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rupp.spring.domain.DCategory;
import com.rupp.spring.service.CategoryService;

@Controller
@RequestMapping("categories")
public class CategoryController {
    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private CategoryService service;
    

    //@RequestMapping(value = "/v1", method = RequestMethod.GET)
    @GetMapping("/v1/all")
    @ResponseBody
    public List<DCategory> getDCategories() {
        logger.debug("====get all categories====");
        return service.list();
    }

    //@RequestMapping(value = "/v1/{id}", method = RequestMethod.GET)
    @GetMapping("/v1/{id}")
    public ResponseEntity<DCategory> getDCategory(@PathVariable("id") Long id) {

        logger.debug("====get category detail with id :[{}] ====", id);
        
        final DCategory category = service.get(id);
        if (category == null) {
            return new ResponseEntity("No DCategory found for ID " + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    //@RequestMapping(value = "/v1", method = RequestMethod.POST)
    @PostMapping(value = "/v1")
    public ResponseEntity<DCategory> createDCategory(@RequestBody DCategory category) {
        logger.debug("====create new category object ====");
        service.create(category);

        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    //@RequestMapping(value = "/v1/{id}", method = RequestMethod.DELETE)
    @DeleteMapping("/v1/{id}")
    public ResponseEntity deleteDCategory(@PathVariable Long id) {
        logger.debug("====delete category detail with id :[{}] ====", id);
        if (null == service.delete(id)) {
            return new ResponseEntity("No DCategory found for ID " + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(id, HttpStatus.OK);

    }
    //@RequestMapping(value = "/v1/{id}", method = RequestMethod.PUT)
    @PutMapping("/v1/{id}")
    public ResponseEntity updateDCategory(@PathVariable Long id, @RequestBody DCategory category) {
        logger.debug("====update category detail with id :[{}] ====", id);
        category = service.update(id, category);

        if (null == category) {
            return new ResponseEntity("No DCategory found for ID " + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity(category, HttpStatus.OK);
    }
}
