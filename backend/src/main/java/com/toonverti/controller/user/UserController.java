package com.toonverti.controller.user;

import com.toonverti.common.code.SuccessCode;
import com.toonverti.common.response.ApiResponse;
import com.toonverti.dto.user.UserResponse;
import com.toonverti.dto.user.UserUpdateRequest;
import com.toonverti.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long userId) {
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@RequestParam String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.of(response, SuccessCode.UPDATE_SUCCESS));
    }

    @PostMapping("/{userId}/onboarding/complete")
    public ResponseEntity<ApiResponse<Void>> completeOnboarding(@PathVariable Long userId) {
        userService.completeOnboarding(userId);
        return ResponseEntity.ok(ApiResponse.of(null, SuccessCode.UPDATE_SUCCESS));
    }
}
