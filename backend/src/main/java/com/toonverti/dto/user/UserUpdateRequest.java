package com.toonverti.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateRequest {

    @Size(min = 2, max = 20, message = "닉네임은 2-20자 사이여야 합니다.")
    private String nickname;

    @Size(max = 200, message = "자기소개는 200자 이내여야 합니다.")
    private String bio;

    private String avatarUrl;
}
