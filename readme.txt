Spring REST-API with Jdbc template :

-CRUD REST-APIs :

GET http://localhost:8080/api/categories/v1/all
GET http://localhost:8080/api/cagetoires/v1/{id}
POST http://localhost:8080/api/cagetoires/v1/{id}
DELETE http://localhost:8080/api/cagetoires/v1/{id}
PUT http://localhost:8080/api/cagetoires/v1/{id}


Maven spring-jdbc  

<dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>4.3.5.RELEAS</version>
</dependency>


 <!-- MySQL database driver -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.22</version>
    </dependency>
  <!-- common-dbcp2 -->
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-dbcp2</artifactId>
    <version>2.1.1</version>
    
=====initial sql schema.sql======== run it mysql console
DROP DATABASE IF EXISTS rupp_test;
CREATE DATABASE rupp_test;
USE rupp_test;
         
DROP TABLE IF EXISTS category;
CREATE TABLE category (
   id INT NOT NULL AUTO_INCREMENT,
   name VARCHAR(400) NOT NULL,
   createdDate timestamp DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (ID)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
 
INSERT INTO category (name) values ('Restaurant');
INSERT INTO category (name) values ('Food and Drink');
INSERT INTO category (name) values ('Entertainment');
INSERT INTO category (name) values ('Outdoor');
INSERT INTO category (name) values ('Days Out');
INSERT INTO category (name) values ('Life Style');
INSERT INTO category (name) values ('Shopping');
INSERT INTO category (name) values ('Service');
INSERT INTO category (name) values ('Sports and Fitness');
INSERT INTO category (name) values ('Health and Beauty');

==============================================


=============web.xml===============

<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
     
     
     <!-- Configure ContextLoaderListener to use AnnotationConfigWebApplicationContext
    instead of the default XmlWebApplicationContext -->
    <context-param>
        <param-name>contextClass</param-name>
        <param-value>org.springframework.web.context.support.AnnotationConfigWebApplicationContext</param-value>
    </context-param>

    <servlet>
        <servlet-name>spring-dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
        <init-param>
            <param-name>contextClass</param-name>
            <param-value>org.springframework.web.context.support.AnnotationConfigWebApplicationContext</param-value>
        </init-param>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>com.rupp.spring.config.MvcConfig</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>spring-dispatcher</servlet-name>
        <url-pattern>/api/*</url-pattern>
    </servlet-mapping>
     
   
    <!-- welcome file -->
   <welcome-file-list>  
   <welcome-file>index.jsp</welcome-file>  
   <welcome-file>index.html</welcome-file>  
  </welcome-file-list>  
</web-app>


====================Spring Java-based configuration============

package com.rupp.spring.config;

import java.text.SimpleDateFormat;
import java.util.List;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@EnableWebMvc //mvc:annotation-driven
@Configuration
@ComponentScan(value = {"com.rupp.spring.controller", "com.rupp.spring.service", "com.rupp.spring.dao"})
public class MvcConfig extends WebMvcConfigurerAdapter {
    
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {

        SkipNullObjectMapper skipNullMapper = new SkipNullObjectMapper();
        skipNullMapper.init();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(skipNullMapper);
        
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
        skipNullMapper.setDateFormat(formatter);
        
        converters.add(converter);
    }
}

package com.rupp.spring.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SkipNullObjectMapper extends ObjectMapper {

    //@SuppressWarnings("deprecation")
    public void init() {
        setSerializationInclusion(JsonInclude.Include.NON_NULL);

        disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }
}

============Create REST-APIs with Spring Controller==========

package com.rupp.spring.controller;

import java.util.List;

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
    @Autowired
    private CategoryService service;
    

    
    //@RequestMapping(value = "/v1", method = RequestMethod.GET)
    @GetMapping("/v1/all")
    @ResponseBody
    public List<DCategory> getDCategories() {
        return service.list();
    }

    //@RequestMapping(value = "/v1/{id}", method = RequestMethod.GET)
    @GetMapping("/v1/{id}")
    public ResponseEntity<DCategory> getDCategory(@PathVariable("id") Long id) {

        DCategory category = service.get(id);
        if (category == null) {
            return new ResponseEntity("No DCategory found for ID " + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    //@RequestMapping(value = "/v1", method = RequestMethod.POST)
    @PostMapping(value = "/v1")
    public ResponseEntity<DCategory> createDCategory(@RequestBody DCategory category) {

        service.create(category);

        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    //@RequestMapping(value = "/v1/{id}", method = RequestMethod.DELETE)
    @DeleteMapping("/v1/{id}")
    public ResponseEntity deleteDCategory(@PathVariable Long id) {

        if (null == service.delete(id)) {
            return new ResponseEntity("No DCategory found for ID " + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(id, HttpStatus.OK);

    }
    //@RequestMapping(value = "/v1/{id}", method = RequestMethod.PUT)
    @PutMapping("/v1/{id}")
    public ResponseEntity updateDCategory(@PathVariable Long id, @RequestBody DCategory category) {

        category = service.update(id, category);

        if (null == category) {
            return new ResponseEntity("No DCategory found for ID " + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity(category, HttpStatus.OK);
    }
}
====================

Service layer :
===================
package com.rupp.spring.service;

import java.util.List;

import com.rupp.spring.domain.DCategory;

public interface CategoryService {
    List<DCategory> list();
    DCategory get(Long id);
    DCategory create(DCategory dCategory);
    Long delete(Long id);
    DCategory update(Long id, DCategory dCategory);
}

package com.rupp.spring.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rupp.spring.dao.CategoryDao;
import com.rupp.spring.domain.DCategory;

@Service("categorySevice")
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryDao dao;
    
    @Override
    public List<DCategory> list() {
        return dao.list();
    }

    @Override
    public DCategory get(Long id) {
        return dao.get(id);
    }

    @Override
    public DCategory create(DCategory dCategory) {
        return dao.create(dCategory);
    }

    @Override
    public Long delete(Long id) {
        return dao.delete(id);
    }

    @Override
    public DCategory update(Long id, DCategory dCategory) {
        
        if (dao.get(id) == null) {
            return null;
        }
        dCategory.setId(id);
        return dao.update(dCategory);
    }
}

==================================dao Layer==========
 package com.rupp.spring.dao;

import java.util.List;

import com.rupp.spring.domain.DCategory;

public interface CategoryDao {
    List<DCategory> list();
    DCategory get(Long id);
    DCategory create(DCategory dCategory);    
    Long delete(Long id);
    DCategory update(DCategory dCategory);
}
 
package com.rupp.spring.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.rupp.spring.domain.DCategory;

@Repository
public class CategoryDaoImpl implements CategoryDao {
    
    private JdbcTemplate jdbcTemplate;
    
    public CategoryDaoImpl() {
        jdbcTemplate = new JdbcTemplate(DBCP2DataSourceUtils.getDataSource());
    }
    public List<DCategory> list() {
        final String sql = "select * from category";
        //List<DCategory> list = this.jdbcTemplate.queryForList(sql,DCategory.class);
        List<DCategory> list = this.jdbcTemplate.query(sql, new RowMapper<DCategory>() {

            @Override
            public DCategory mapRow(ResultSet rs, int paramInt) throws SQLException {
                final DCategory domain = new DCategory();
                domain.setId(rs.getLong("id"));
                domain.setName(rs.getString("name"));
                domain.setCreatedDate(new Date(rs.getTimestamp("createdDate").getTime()));
                return domain;
            }
            
        });
        return list;
    }

    public DCategory get(Long id) {
        final String sql = "select * from category where id = ?";
        
        try {
            //select for object
            final DCategory obj = jdbcTemplate.queryForObject(sql, new Object[] { id }, new RowMapper<DCategory>() {

                @Override
                public DCategory mapRow(ResultSet rs, int paramInt) throws SQLException {
                    final DCategory domain = new DCategory();
                    domain.setId(rs.getLong("id"));
                    domain.setName(rs.getString("name"));
                    domain.setCreatedDate(new Date(rs.getTimestamp("createdDate").getTime()));
                    return domain;
                }
            });
            return obj;
        } catch (EmptyResultDataAccessException e) {
            System.out.println("NOT FOUND " + id + " in Table" );
            return null;
        }
    }

    public DCategory create(DCategory dCategory) {
        final String sql = "INSERT INTO category (name) VALUES (?)";
        jdbcTemplate.update(sql, new Object[] { dCategory.getName() });
        return dCategory;
    }

    public Long delete(Long id) {
        final String sql = "Delete from category where id =?";
        int result = jdbcTemplate.update(sql, new Object[] { id });
        return result == 1 ? id : null;
    }

    public DCategory update(DCategory dCategory) {

        final String sql = "UPDATE category set name =? where id=?";
        int result = jdbcTemplate.update(sql, new Object[] { dCategory.getName() , dCategory.getId()});
        return result == 1 ? dCategory : null;
    }
}

=======================DBCP2 Datasource connection========
package com.rupp.spring.dao;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

import javax.sql.DataSource;

import org.apache.commons.dbcp2.BasicDataSource;
import org.apache.commons.dbcp2.BasicDataSourceFactory;
/**
 * @author Sophea <a href='mailto:smak@dminc.com'> sophea </a>
 * @version $id$ - $Revision$
 * @date 2017
 */
public class DBCP2DataSourceUtils {
    private static BasicDataSource ds = null;
    
    static {
        String propsFile = "db.properties";
        Properties props = new Properties();
        
        try {
            props.load(Thread.currentThread().getContextClassLoader().getResource(propsFile).openStream());
            ds = BasicDataSourceFactory.createDataSource(props);
        } catch (Exception e) {
            System.out.println("Error :" + e.getMessage());
            props = null;
        }
    }
    /**get connection from pool*/
    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }
    
    public static DataSource getDataSource() {
        return ds;
    }
    public static void printDataSourceState() {
        System.out.println("NumActive: " + ds.getNumActive());
        System.out.println("NumIdle: " + ds.getNumIdle());
    }
    }
==================================db.properties============
driverClassName=com.mysql.jdbc.Driver
url=${database.url}
username=${database.username}
password=${database.password}

=====Maven to replace these properties=======
<properties>
    <database.driver>com.mysql.jdbc.Driver</database.driver>
    <database.url>jdbc:mysql://localhost:3306/rupp_test?autoReconnect=true</database.url>
    <database.username>root</database.username>
    <database.password>root</database.password>    
  </properties>

