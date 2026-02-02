package com.toonverti.controller.diary;

import com.toonverti.common.code.SuccessCode;
import com.toonverti.common.response.ApiResponse;
import com.toonverti.dto.diary.DiaryRequest;
import com.toonverti.dto.diary.DiaryResponse;
import com.toonverti.service.DiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<ApiResponse<DiaryResponse>> createDiary(
            @RequestParam Long userId,
            @Valid @RequestBody DiaryRequest request) {
        DiaryResponse response = diaryService.createDiary(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<DiaryResponse>> getDiary(@PathVariable Long diaryId) {
        DiaryResponse response = diaryService.getDiary(diaryId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<DiaryResponse>>> getUserDiaries(@PathVariable Long userId) {
        List<DiaryResponse> response = diaryService.getUserDiaries(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/trash/{userId}")
    public ResponseEntity<ApiResponse<List<DiaryResponse>>> getTrashDiaries(@PathVariable Long userId) {
        List<DiaryResponse> response = diaryService.getTrashDiaries(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<DiaryResponse>> updateDiary(
            @PathVariable Long diaryId,
            @Valid @RequestBody DiaryRequest request) {
        DiaryResponse response = diaryService.updateDiary(diaryId, request);
        return ResponseEntity.ok(ApiResponse.of(response, SuccessCode.UPDATE_SUCCESS));
    }

    @PostMapping("/{diaryId}/trash")
    public ResponseEntity<ApiResponse<Void>> moveToTrash(@PathVariable Long diaryId) {
        diaryService.moveToTrash(diaryId);
        return ResponseEntity.ok(ApiResponse.of(null, SuccessCode.UPDATE_SUCCESS));
    }

    @PostMapping("/{diaryId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreFromTrash(@PathVariable Long diaryId) {
        diaryService.restoreFromTrash(diaryId);
        return ResponseEntity.ok(ApiResponse.of(null, SuccessCode.UPDATE_SUCCESS));
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<Void>> deleteDiary(@PathVariable Long diaryId) {
        diaryService.deleteDiary(diaryId);
        return ResponseEntity.ok(ApiResponse.of(null, SuccessCode.DELETE_SUCCESS));
    }

    @PostMapping("/{diaryId}/like")
    public ResponseEntity<ApiResponse<Void>> toggleLike(@PathVariable Long diaryId) {
        diaryService.toggleLike(diaryId);
        return ResponseEntity.ok(ApiResponse.of(null, SuccessCode.UPDATE_SUCCESS));
    }

    @PostMapping("/{diaryId}/toggle-public")
    public ResponseEntity<ApiResponse<Void>> togglePublic(@PathVariable Long diaryId) {
        diaryService.togglePublic(diaryId);
        return ResponseEntity.ok(ApiResponse.of(null, SuccessCode.UPDATE_SUCCESS));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DiaryResponse>>> searchDiaries(
            @RequestParam Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String genre) {

        List<DiaryResponse> response;

        if (keyword != null && !keyword.isBlank()) {
            response = diaryService.searchDiaries(userId, keyword);
        } else if (startDate != null && endDate != null) {
            response = diaryService.searchByDateRange(userId, startDate, endDate);
        } else if (genre != null && !genre.isBlank()) {
            response = diaryService.searchByGenre(userId, genre);
        } else {
            response = diaryService.getUserDiaries(userId);
        }

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
