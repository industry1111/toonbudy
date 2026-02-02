package com.toonverti.controller.diary;

import com.toonverti.common.response.ApiResponse;
import com.toonverti.dto.diary.DiaryResponse;
import com.toonverti.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ShareController {

    private final DiaryService diaryService;

    @GetMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<DiaryResponse>> getSharedDiary(@PathVariable Long diaryId) {
        DiaryResponse response = diaryService.getPublicDiary(diaryId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{diaryId}/like")
    public ResponseEntity<ApiResponse<Void>> likeDiary(@PathVariable Long diaryId) {
        diaryService.toggleLike(diaryId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
