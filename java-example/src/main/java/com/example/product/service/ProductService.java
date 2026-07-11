package com.example.product.service;

import com.example.product.model.Product;
import java.util.*;

public class ProductService {
    private final Map<Long, Product> db = new HashMap<>();
    private long idCounter = 1;

    public Product save(Product product) {
        product.setId(idCounter++);
        db.put(product.getId(), product);
        return product;
    }

    public Product findById(Long id) {
        return db.get(id);
    }

    public List<Product> findAll() {
        return new ArrayList<>(db.values());
    }
}