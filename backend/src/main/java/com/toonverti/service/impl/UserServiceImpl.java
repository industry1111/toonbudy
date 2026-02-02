package com.toonverti.service.impl;

import com.toonverti.domain.user.Role;
import com.toonverti.domain.user.User;
import com.toonverti.domain.user.UserRepository;
import com.toonverti.dto.user.*;
import com.toonverti.exception.DuplicateEmailException;
import com.toonverti.exception.InvalidPasswordException;
import com.toonverti.exception.UserNotFoundException;
import com.toonverti.security.jwt.JwtToken;
import com.toonverti.security.jwt.JwtTokenProvider;
import com.toonverti.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException();
        }

        String authorities = "ROLE_" + user.getRole().name();
        JwtToken token = jwtTokenProvider.generateToken(user.getEmail(), authorities);

        return LoginResponse.of(token, UserResponse.from(user));
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return UserResponse.from(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (request.getNickname() != null) {
            user.updateNickname(request.getNickname());
        }
        if (request.getBio() != null) {
            user.updateBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.updateAvatarUrl(request.getAvatarUrl());
        }

        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public void completeOnboarding(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.completeOnboarding();
    }

    @Override
    public JwtToken refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidPasswordException("유효하지 않은 리프레시 토큰입니다.");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        String authorities = "ROLE_" + user.getRole().name();
        return jwtTokenProvider.generateToken(email, authorities);
    }
}
