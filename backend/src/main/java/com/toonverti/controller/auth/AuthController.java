package com.toonverti.controller.auth;

import com.toonverti.common.response.ApiResponse;
import com.toonverti.dto.user.LoginRequest;
import com.toonverti.dto.user.LoginResponse;
import com.toonverti.dto.user.SignUpRequest;
import com.toonverti.dto.user.UserResponse;
import com.toonverti.security.jwt.JwtToken;
import com.toonverti.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signUp(@Valid @RequestBody SignUpRequest request) {
        UserResponse response = userService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtToken>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        // Bearer 토큰에서 실제 토큰 추출
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        JwtToken token = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(token));
    }
}
