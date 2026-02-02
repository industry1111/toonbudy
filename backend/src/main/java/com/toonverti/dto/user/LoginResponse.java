package com.toonverti.dto.user;

import com.toonverti.security.jwt.JwtToken;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UserResponse user;

    public static LoginResponse of(JwtToken token, UserResponse user) {
        return LoginResponse.builder()
                .accessToken(token.getAccessToken())
                .refreshToken(token.getRefreshToken())
                .tokenType(token.getGrantType())
                .user(user)
                .build();
    }
}
