package com.toonverti.dto.diary;

import com.toonverti.domain.sticker.Sticker;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StickerResponse {
    private Long id;
    private String type;
    private String src;
    private int x;
    private int y;
    private int width;
    private int height;
    private double rotation;
    private int zIndex;

    public static StickerResponse from(Sticker sticker) {
        return StickerResponse.builder()
                .id(sticker.getId())
                .type(sticker.getType())
                .src(sticker.getSrc())
                .x(sticker.getX())
                .y(sticker.getY())
                .width(sticker.getWidth())
                .height(sticker.getHeight())
                .rotation(sticker.getRotation())
                .zIndex(sticker.getZIndex())
                .build();
    }
}
