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
