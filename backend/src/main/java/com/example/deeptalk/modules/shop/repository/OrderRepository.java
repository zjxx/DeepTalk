package com.example.deeptalk.modules.shop.repository;

import com.example.deeptalk.modules.shop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(String userId);
} 