package com.toonverti.dto.diary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class DiaryRequest {

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 200, message = "제목은 200자 이내여야 합니다.")
    private String title;

    private String memo;

    private LocalDate date;

    @Size(max = 50, message = "장르는 50자 이내여야 합니다.")
    private String genre;

    private boolean isPublic = false;

    private List<StickerRequest> stickers;
}
