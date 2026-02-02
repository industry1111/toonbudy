package com.toonverti.domain.sticker;

import com.toonverti.domain.BaseEntity;
import com.toonverti.domain.diary.Diary;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stickers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Sticker extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 500)
    private String src;

    @Column(nullable = false)
    private int x;

    @Column(nullable = false)
    private int y;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    @Column(nullable = false)
    private double rotation = 0;

    @Column(nullable = false)
    private int zIndex = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id", nullable = false)
    private Diary diary;

    @Builder
    public Sticker(String type, String src, int x, int y, int width, int height, double rotation, int zIndex, Diary diary) {
        this.type = type;
        this.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.zIndex = zIndex;
        this.diary = diary;
    }

    public void updatePosition(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public void updateSize(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public void updateRotation(double rotation) {
        this.rotation = rotation;
    }

    public void updateZIndex(int zIndex) {
        this.zIndex = zIndex;
    }
}
