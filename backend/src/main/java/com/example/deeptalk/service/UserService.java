package com.example.deeptalk.service;

import com.example.deeptalk.modules.auth.entity.User;
import java.util.Optional;

public interface UserService {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    User save(User user);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
} 