package com.example.product;

import com.example.product.model.Product;
import com.example.product.service.ProductService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ProductServiceTest {
    @Test
    public void testSaveAndFind() {
        ProductService service = new ProductService();
        Product p = new Product();
        p.setName("Test");
        p.setPrice(10.0);
        Product saved = service.save(p);
        assertNotNull(saved.getId());
        Product found = service.findById(saved.getId());
        assertEquals("Test", found.getName());
    }
}
