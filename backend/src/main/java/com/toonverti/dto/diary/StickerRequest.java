package com.toonverti.dto.diary;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StickerRequest {

    @NotBlank(message = "스티커 타입은 필수입니다.")
    private String type;

    @NotBlank(message = "스티커 이미지 경로는 필수입니다.")
    private String src;

    private int x;
    private int y;
    private int width;
    private int height;
    private double rotation = 0;
    private int zIndex = 1;
}
