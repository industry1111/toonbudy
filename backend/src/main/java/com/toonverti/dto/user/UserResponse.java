package com.toonverti.dto.user;

import com.toonverti.domain.user.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String bio;
    private String avatarUrl;
    private boolean onboardingCompleted;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .onboardingCompleted(user.isOnboardingCompleted())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
