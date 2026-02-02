package com.toonverti.domain.diary;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiaryRepository extends JpaRepository<Diary, Long> {

    // 사용자의 다이어리 목록 (휴지통 제외)
    List<Diary> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    // 사용자의 휴지통 목록
    List<Diary> findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(Long userId);

    // 공개 다이어리 조회
    Optional<Diary> findByIdAndIsPublicTrue(Long id);

    // 사용자의 다이어리 수 (휴지통 제외)
    long countByUserIdAndIsDeletedFalse(Long userId);

    // 사용자의 특정 달 다이어리 수
    @Query("SELECT COUNT(d) FROM Diary d WHERE d.user.id = :userId AND d.isDeleted = false " +
           "AND YEAR(d.createdAt) = :year AND MONTH(d.createdAt) = :month")
    long countByUserIdAndMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);

    // 검색 - 제목, 메모, 날짜로 검색
    @Query("SELECT d FROM Diary d WHERE d.user.id = :userId AND d.isDeleted = false " +
           "AND (LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(d.memo) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Diary> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    // 날짜 범위로 검색
    @Query("SELECT d FROM Diary d WHERE d.user.id = :userId AND d.isDeleted = false " +
           "AND d.date BETWEEN :startDate AND :endDate ORDER BY d.date DESC")
    List<Diary> findByDateRange(@Param("userId") Long userId,
                                @Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);

    // 장르로 검색
    List<Diary> findByUserIdAndIsDeletedFalseAndGenreOrderByCreatedAtDesc(Long userId, String genre);

    // 공개된 다이어리 목록 (페이징)
    Page<Diary> findByIsPublicTrueAndIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
}
