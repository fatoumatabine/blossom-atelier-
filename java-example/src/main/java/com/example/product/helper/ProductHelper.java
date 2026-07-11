package com.example.product.helper;

import com.example.product.model.Product;
import com.example.product.service.ProductService;
import java.util.List;

public class ProductHelper {
    private final ProductService productService;

    public ProductHelper(ProductService productService) {
        this.productService = productService;
    }

    // Logique métier avancée
    public Product createProductWithLogic(String name, Double price) {
        // Exemple de logique métier
        if (price < 0) throw new IllegalArgumentException("Le prix doit être positif");
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        return productService.save(product);
    }

    public List<Product> getAllProducts() {
        return productService.findAll();
    }
}