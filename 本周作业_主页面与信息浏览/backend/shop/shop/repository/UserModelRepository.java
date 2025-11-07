package com.example.deeptalk.modules.shop.repository;

import com.example.deeptalk.modules.shop.entity.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserModelRepository extends JpaRepository<UserModel, String> {
    List<UserModel> findByUserId(String userId);
} 