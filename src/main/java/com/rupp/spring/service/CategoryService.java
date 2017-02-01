package com.rupp.spring.service;

import java.util.List;

import com.rupp.spring.domain.DCategory;
import com.rupp.spring.domain.ResponseList;

public interface CategoryService {
    List<DCategory> list();
    DCategory get(Long id);
    DCategory create(DCategory dCategory);
    Long delete(Long id);
    DCategory update(Long id, DCategory dCategory);
    ResponseList<DCategory> getPage(int pagesize, String cursorkey);
}
