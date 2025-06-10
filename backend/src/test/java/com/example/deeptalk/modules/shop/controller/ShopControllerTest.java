package com.example.deeptalk.modules.shop.controller;

import com.example.deeptalk.modules.shop.dto.*;
import com.example.deeptalk.modules.shop.entity.Order;
import com.example.deeptalk.modules.shop.entity.Product;
import com.example.deeptalk.modules.shop.entity.UserModel;
import com.example.deeptalk.modules.shop.repository.OrderRepository;
import com.example.deeptalk.modules.shop.repository.ProductRepository;
import com.example.deeptalk.modules.shop.repository.UserModelRepository;
import com.example.deeptalk.service.TokenBlacklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ShopController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ShopController.class)
public class ShopControllerTest {

    @Configuration
    static class TestConfig {
        @Bean
        public SecretKey jwtSecretKey() {
            return new javax.crypto.spec.SecretKeySpec("testSecretKey123456789012345678901234567890".getBytes(), "HmacSHA256");
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private UserModelRepository userModelRepository;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private SecretKey jwtSecretKey;

    private Product testProduct;
    private Order testOrder;
    private UserModel testUserModel;

    @BeforeEach
    void setUp() {
        // 创建测试商品
        testProduct = new Product();
        testProduct.setId("1");
        testProduct.setName("测试商品");
        testProduct.setPrice(99.99);
        testProduct.setDescription("这是一个测试商品");

        // 创建测试订单
        testOrder = new Order();
        testOrder.setId("1");
        testOrder.setUserId("1");
        testOrder.setProduct(testProduct);

        // 创建测试用户模型
        testUserModel = new UserModel();
        testUserModel.setId("1");
        testUserModel.setUserId("1");
        testUserModel.setModelId("1");

        // Mock TokenBlacklistService
        when(tokenBlacklistService.isBlacklisted(anyString())).thenReturn(false);
    }

    @Test
    void searchShopSuccess() throws Exception {
        // 准备测试数据
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.searchProducts(anyString())).thenReturn(products);

        // 准备请求数据
        SearchRequest request = new SearchRequest();
        request.setQuery("测试");

        // 执行测试
        mockMvc.perform(post("/api/shop/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products[0].name").value("测试商品"))
                .andExpect(jsonPath("$.products[0].price").value(99.99));
    }

    @Test
    void searchShopEmptyQuery() throws Exception {
        // 准备测试数据
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findAll()).thenReturn(products);

        // 准备请求数据
        SearchRequest request = new SearchRequest();
        request.setQuery("");

        // 执行测试
        mockMvc.perform(post("/api/shop/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products").isArray())
                .andExpect(jsonPath("$.products").isNotEmpty());
    }

    @Test
    void checkStockSuccess() throws Exception {
        // 准备测试数据
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findByUserId(anyString())).thenReturn(orders);

        // 准备请求数据
        CheckStockRequest request = new CheckStockRequest();
        request.setUserId("1");

        // 执行测试
        mockMvc.perform(post("/api/shop/check-stock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productList").isArray())
                .andExpect(jsonPath("$.productList[0].id").value("1"));
    }

    @Test
    void purchaseProductSuccess() throws Exception {
        // 准备测试数据
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // 准备请求数据
        PurchaseRequest request = new PurchaseRequest();
        request.setOrder(testOrder);

        // 执行测试
        mockMvc.perform(post("/api/shop/purchase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("completed"))
                .andExpect(jsonPath("$.userId").value("1"));
    }

    @Test
    void useProductSuccess() throws Exception {
        // 准备测试数据
        when(userModelRepository.findByUserId(anyString())).thenReturn(Arrays.asList(testUserModel));
        when(userModelRepository.save(any(UserModel.class))).thenReturn(testUserModel);

        // 准备请求数据
        UseRequest request = new UseRequest();
        request.setUserId("1");
        request.setProductId("1");

        // 执行测试
        mockMvc.perform(post("/api/shop/product/use")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void useProductNewUser() throws Exception {
        // 准备测试数据
        when(userModelRepository.findByUserId(anyString())).thenReturn(List.of());
        when(userModelRepository.save(any(UserModel.class))).thenReturn(testUserModel);

        // 准备请求数据
        UseRequest request = new UseRequest();
        request.setUserId("2");
        request.setProductId("1");

        // 执行测试
        mockMvc.perform(post("/api/shop/product/use")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void getUserModelsSuccess() throws Exception {
        // 准备测试数据
        when(userModelRepository.findByUserId(anyString())).thenReturn(Arrays.asList(testUserModel));

        // 准备请求数据
        GetUsedRequest request = new GetUsedRequest();
        request.setUserId("1");

        // 执行测试
        mockMvc.perform(post("/api/shop/product/getused")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("获取成功"))
                .andExpect(jsonPath("$.productId").value("1"));
    }

    @Test
    void getUserModelsEmpty() throws Exception {
        // 准备测试数据
        when(userModelRepository.findByUserId(anyString())).thenReturn(List.of());

        // 准备请求数据
        GetUsedRequest request = new GetUsedRequest();
        request.setUserId("2");

        // 执行测试
        mockMvc.perform(post("/api/shop/product/getused")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("用户暂无使用记录"));
    }
} 