package com.toonverti.domain.sticker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StickerRepository extends JpaRepository<Sticker, Long> {

    List<Sticker> findByDiaryIdOrderByZIndexAsc(Long diaryId);

    void deleteByDiaryId(Long diaryId);

    // 사용자의 총 스티커 수
    @Query("SELECT COUNT(s) FROM Sticker s WHERE s.diary.user.id = :userId AND s.diary.isDeleted = false")
    long countByUserId(@Param("userId") Long userId);

    // 사용자의 다이어리당 평균 스티커 수
    @Query("SELECT COALESCE(AVG(stickerCount), 0) FROM " +
           "(SELECT COUNT(s) as stickerCount FROM Sticker s " +
           "WHERE s.diary.user.id = :userId AND s.diary.isDeleted = false " +
           "GROUP BY s.diary.id)")
    double avgStickerCountByUserId(@Param("userId") Long userId);
}
