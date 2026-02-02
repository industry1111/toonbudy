package com.toonverti.service;

import com.toonverti.dto.diary.DiaryRequest;
import com.toonverti.dto.diary.DiaryResponse;

import java.time.LocalDate;
import java.util.List;

public interface DiaryService {

    DiaryResponse createDiary(Long userId, DiaryRequest request);

    DiaryResponse getDiary(Long diaryId);

    DiaryResponse getPublicDiary(Long diaryId);

    List<DiaryResponse> getUserDiaries(Long userId);

    List<DiaryResponse> getTrashDiaries(Long userId);

    DiaryResponse updateDiary(Long diaryId, DiaryRequest request);

    void moveToTrash(Long diaryId);

    void restoreFromTrash(Long diaryId);

    void deleteDiary(Long diaryId);

    void toggleLike(Long diaryId);

    void togglePublic(Long diaryId);

    List<DiaryResponse> searchDiaries(Long userId, String keyword);

    List<DiaryResponse> searchByDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    List<DiaryResponse> searchByGenre(Long userId, String genre);
}
