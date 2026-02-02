package com.toonverti.domain.diary;

import com.toonverti.domain.BaseEntity;
import com.toonverti.domain.sticker.Sticker;
import com.toonverti.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "diaries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Diary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column
    private LocalDate date;

    @Column(length = 50)
    private String genre;

    @Column(nullable = false)
    private boolean isPublic = false;

    @Column(nullable = false)
    private boolean isDeleted = false;

    @Column
    private java.time.LocalDateTime deletedAt;

    @Column(nullable = false)
    private int likeCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sticker> stickers = new ArrayList<>();

    @Builder
    public Diary(String title, String memo, LocalDate date, String genre, boolean isPublic, User user) {
        this.title = title;
        this.memo = memo;
        this.date = date;
        this.genre = genre;
        this.isPublic = isPublic;
        this.user = user;
    }

    public void updateTitle(String title) {
        this.title = title;
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }

    public void updateDate(LocalDate date) {
        this.date = date;
    }

    public void updateGenre(String genre) {
        this.genre = genre;
    }

    public void updateIsPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public void moveToTrash() {
        this.isDeleted = true;
        this.deletedAt = java.time.LocalDateTime.now();
    }

    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
    }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void addSticker(Sticker sticker) {
        this.stickers.add(sticker);
    }

    public void removeSticker(Sticker sticker) {
        this.stickers.remove(sticker);
    }
}
