package com.toonverti.dto.diary;

import com.toonverti.domain.diary.Diary;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class DiaryResponse {
    private Long id;
    private String title;
    private String memo;
    private LocalDate date;
    private String genre;
    private boolean isPublic;
    private boolean isDeleted;
    private LocalDateTime deletedAt;
    private int likeCount;
    private int stickerCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StickerResponse> stickers;

    public static DiaryResponse from(Diary diary) {
        return DiaryResponse.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .memo(diary.getMemo())
                .date(diary.getDate())
                .genre(diary.getGenre())
                .isPublic(diary.isPublic())
                .isDeleted(diary.isDeleted())
                .deletedAt(diary.getDeletedAt())
                .likeCount(diary.getLikeCount())
                .stickerCount(diary.getStickers().size())
                .createdAt(diary.getCreatedAt())
                .updatedAt(diary.getUpdatedAt())
                .stickers(diary.getStickers().stream()
                        .map(StickerResponse::from)
                        .toList())
                .build();
    }

    public static DiaryResponse summaryFrom(Diary diary) {
        return DiaryResponse.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .date(diary.getDate())
                .genre(diary.getGenre())
                .isPublic(diary.isPublic())
                .isDeleted(diary.isDeleted())
                .deletedAt(diary.getDeletedAt())
                .likeCount(diary.getLikeCount())
                .stickerCount(diary.getStickers().size())
                .createdAt(diary.getCreatedAt())
                .build();
    }
}
