package com.example.deeptalk.modules.shop.controller;

import com.example.deeptalk.modules.shop.dto.*;
import com.example.deeptalk.modules.shop.entity.Order;
import com.example.deeptalk.modules.shop.entity.Product;
import com.example.deeptalk.modules.shop.repository.OrderRepository;
import com.example.deeptalk.modules.shop.repository.ProductRepository;
import com.example.deeptalk.service.TokenBlacklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.example.deeptalk.config.TestConfig;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShopController.class)
@Import(TestConfig.class)
@ActiveProfiles("test")
public class ShopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private javax.crypto.SecretKey jwtSecretKey;

    private Product testProduct;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId("1");
        testProduct.setName("测试产品");
        testProduct.setDescription("这是一个测试产品");
        testProduct.setPrice(99.99);
        testProduct.setImageUrl("https://example.com/image.jpg");

        testOrder = new Order();
        testOrder.setId("1");
        testOrder.setProduct(testProduct);
        testOrder.setUserId("user123");
    }

    @Test
    void searchShopWithQuery() throws Exception {
        when(productRepository.searchProducts("测试")).thenReturn(Arrays.asList(testProduct));

        SearchRequest request = new SearchRequest();
        request.setQuery("测试");

        mockMvc.perform(post("/api/shop/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products[0].id").value("1"))
                .andExpect(jsonPath("$.products[0].name").value("测试产品"))
                .andExpect(jsonPath("$.products[0].description").value("这是一个测试产品"))
                .andExpect(jsonPath("$.products[0].price").value(99.99))
                .andExpect(jsonPath("$.products[0].imageUrl").value("https://example.com/image.jpg"));
    }

    @Test
    void searchShopWithoutQuery() throws Exception {
        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));

        SearchRequest request = new SearchRequest();
        request.setQuery("");

        mockMvc.perform(post("/api/shop/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products[0].id").value("1"))
                .andExpect(jsonPath("$.products[0].name").value("测试产品"))
                .andExpect(jsonPath("$.products[0].description").value("这是一个测试产品"))
                .andExpect(jsonPath("$.products[0].price").value(99.99))
                .andExpect(jsonPath("$.products[0].imageUrl").value("https://example.com/image.jpg"));
    }

    @Test
    void checkStock() throws Exception {
        when(orderRepository.findByUserId("user123")).thenReturn(Arrays.asList(testOrder));

        CheckStockRequest request = new CheckStockRequest();
        request.setUserId("user123");

        mockMvc.perform(post("/api/shop/check-stock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productList[0].id").value("1"))
                .andExpect(jsonPath("$.productList[0].name").value("测试产品"))
                .andExpect(jsonPath("$.productList[0].description").value("这是一个测试产品"))
                .andExpect(jsonPath("$.productList[0].price").value(99.99))
                .andExpect(jsonPath("$.productList[0].imageUrl").value("https://example.com/image.jpg"));
    }

    @Test
    void purchaseProduct() throws Exception {
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        PurchaseRequest request = new PurchaseRequest();
        request.setOrder(testOrder);

        mockMvc.perform(post("/api/shop/purchase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order.id").value("1"))
                .andExpect(jsonPath("$.order.userId").value("user123"))
                .andExpect(jsonPath("$.order.product.id").value("1"))
                .andExpect(jsonPath("$.order.product.name").value("测试产品"))
                .andExpect(jsonPath("$.order.product.description").value("这是一个测试产品"))
                .andExpect(jsonPath("$.order.product.price").value(99.99))
                .andExpect(jsonPath("$.order.product.imageUrl").value("https://example.com/image.jpg"))
                .andExpect(jsonPath("$.userId").value("user123"))
                .andExpect(jsonPath("$.product.id").value("1"))
                .andExpect(jsonPath("$.product.name").value("测试产品"))
                .andExpect(jsonPath("$.status").value("completed"));
    }
} 