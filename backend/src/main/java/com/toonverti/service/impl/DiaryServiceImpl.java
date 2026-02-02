package com.toonverti.service.impl;

import com.toonverti.domain.diary.Diary;
import com.toonverti.domain.diary.DiaryRepository;
import com.toonverti.domain.sticker.Sticker;
import com.toonverti.domain.sticker.StickerRepository;
import com.toonverti.domain.user.User;
import com.toonverti.domain.user.UserRepository;
import com.toonverti.dto.diary.DiaryRequest;
import com.toonverti.dto.diary.DiaryResponse;
import com.toonverti.dto.diary.StickerRequest;
import com.toonverti.exception.DiaryNotFoundException;
import com.toonverti.exception.UserNotFoundException;
import com.toonverti.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiaryServiceImpl implements DiaryService {

    private final DiaryRepository diaryRepository;
    private final StickerRepository stickerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DiaryResponse createDiary(Long userId, DiaryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Diary diary = Diary.builder()
                .title(request.getTitle())
                .memo(request.getMemo())
                .date(request.getDate())
                .genre(request.getGenre())
                .isPublic(request.isPublic())
                .user(user)
                .build();

        Diary savedDiary = diaryRepository.save(diary);

        if (request.getStickers() != null) {
            for (StickerRequest stickerRequest : request.getStickers()) {
                Sticker sticker = Sticker.builder()
                        .type(stickerRequest.getType())
                        .src(stickerRequest.getSrc())
                        .x(stickerRequest.getX())
                        .y(stickerRequest.getY())
                        .width(stickerRequest.getWidth())
                        .height(stickerRequest.getHeight())
                        .rotation(stickerRequest.getRotation())
                        .zIndex(stickerRequest.getZIndex())
                        .diary(savedDiary)
                        .build();
                stickerRepository.save(sticker);
                savedDiary.addSticker(sticker);
            }
        }

        return DiaryResponse.from(savedDiary);
    }

    @Override
    public DiaryResponse getDiary(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));
        return DiaryResponse.from(diary);
    }

    @Override
    public DiaryResponse getPublicDiary(Long diaryId) {
        Diary diary = diaryRepository.findByIdAndIsPublicTrue(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException("공개된 다이어리를 찾을 수 없습니다."));
        return DiaryResponse.from(diary);
    }

    @Override
    public List<DiaryResponse> getUserDiaries(Long userId) {
        return diaryRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(DiaryResponse::summaryFrom)
                .toList();
    }

    @Override
    public List<DiaryResponse> getTrashDiaries(Long userId) {
        return diaryRepository.findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(userId)
                .stream()
                .map(DiaryResponse::summaryFrom)
                .toList();
    }

    @Override
    @Transactional
    public DiaryResponse updateDiary(Long diaryId, DiaryRequest request) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));

        diary.updateTitle(request.getTitle());
        diary.updateMemo(request.getMemo());
        diary.updateDate(request.getDate());
        diary.updateGenre(request.getGenre());
        diary.updateIsPublic(request.isPublic());

        // 기존 스티커 삭제 후 새로 추가
        stickerRepository.deleteByDiaryId(diaryId);
        diary.getStickers().clear();

        if (request.getStickers() != null) {
            for (StickerRequest stickerRequest : request.getStickers()) {
                Sticker sticker = Sticker.builder()
                        .type(stickerRequest.getType())
                        .src(stickerRequest.getSrc())
                        .x(stickerRequest.getX())
                        .y(stickerRequest.getY())
                        .width(stickerRequest.getWidth())
                        .height(stickerRequest.getHeight())
                        .rotation(stickerRequest.getRotation())
                        .zIndex(stickerRequest.getZIndex())
                        .diary(diary)
                        .build();
                stickerRepository.save(sticker);
                diary.addSticker(sticker);
            }
        }

        return DiaryResponse.from(diary);
    }

    @Override
    @Transactional
    public void moveToTrash(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));
        diary.moveToTrash();
    }

    @Override
    @Transactional
    public void restoreFromTrash(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));
        diary.restore();
    }

    @Override
    @Transactional
    public void deleteDiary(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));
        diaryRepository.delete(diary);
    }

    @Override
    @Transactional
    public void toggleLike(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));
        diary.incrementLikeCount();
    }

    @Override
    @Transactional
    public void togglePublic(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new DiaryNotFoundException(diaryId));
        diary.updateIsPublic(!diary.isPublic());
    }

    @Override
    public List<DiaryResponse> searchDiaries(Long userId, String keyword) {
        return diaryRepository.searchByKeyword(userId, keyword)
                .stream()
                .map(DiaryResponse::summaryFrom)
                .toList();
    }

    @Override
    public List<DiaryResponse> searchByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return diaryRepository.findByDateRange(userId, startDate, endDate)
                .stream()
                .map(DiaryResponse::summaryFrom)
                .toList();
    }

    @Override
    public List<DiaryResponse> searchByGenre(Long userId, String genre) {
        return diaryRepository.findByUserIdAndIsDeletedFalseAndGenreOrderByCreatedAtDesc(userId, genre)
                .stream()
                .map(DiaryResponse::summaryFrom)
                .toList();
    }
}
