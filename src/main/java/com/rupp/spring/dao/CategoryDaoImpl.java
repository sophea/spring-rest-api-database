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
    /**
     * Returns list of categories from dummy database.
     * 
     * @return list of categories
     */
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

    /**
     * Return dCategory object for given id from dummy database. If dCategory is not found for id, returns null.
     * 
     * @param id
     *            dCategory id
     * @return dCategory object for given id
     */
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

    /**
     * Create new dCategory in dummy database. Updates the id and insert new dCategory in list.
     * 
     * @param dCategory
     *            DCategory object
     * @return dCategory object with updated id
     */
    public DCategory create(DCategory dCategory) {
        final String sql = "INSERT INTO category (name) VALUES (?)";
        jdbcTemplate.update(sql, new Object[] { dCategory.getName() });
        return dCategory;
    }

    /**
     * @param id
     *            the dCategory id
     * @return id of deleted dCategory object
     */
    public Long delete(Long id) {
        final String sql = "Delete from category where id =?";
        int result = jdbcTemplate.update(sql, new Object[] { id });
        return result == 1 ? id : null;
    }

    /**
     * Update the dCategory object for given id in dummy database. If dCategory not exists, returns null
     * 
     * @param id
     * @param dCategory
     * @return dCategory object with id
     */
    public DCategory update(DCategory dCategory) {

        final String sql = "UPDATE category set name =? where id=?";
        int result = jdbcTemplate.update(sql, new Object[] { dCategory.getName() , dCategory.getId()});
        return result == 1 ? dCategory : null;

    }

}
