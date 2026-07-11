package com.example.product.controller;

import com.example.product.helper.ProductHelper;
import com.example.product.mapper.ProductMapper;
import com.example.product.dto.ProductDTO;
import com.example.product.model.Product;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/secure-products")
public class SecureProductController {
    private final ProductHelper productHelper;

    @Autowired
    public SecureProductController(ProductHelper productHelper) {
        this.productHelper = productHelper;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Sécurité JWT appliquée à la méthode
    public ProductDTO createProduct(@RequestBody ProductDTO dto) {
        Product product = productHelper.createProductWithLogic(dto.getName(), dto.getPrice());
        return ProductMapper.toDTO(product);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public List<ProductDTO> getAllProducts() {
        return productHelper.getAllProducts().stream().map(ProductMapper::toDTO).collect(Collectors.toList());
    }
}
