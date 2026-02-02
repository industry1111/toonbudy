package com.toonverti.service;

import com.toonverti.dto.user.*;
import com.toonverti.security.jwt.JwtToken;

public interface UserService {

    UserResponse signUp(SignUpRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse getUserById(Long userId);

    UserResponse getUserByEmail(String email);

    UserResponse updateUser(Long userId, UserUpdateRequest request);

    void completeOnboarding(Long userId);

    JwtToken refreshToken(String refreshToken);
}
