package com.toonverti.exception;

public class DiaryNotFoundException extends RuntimeException {
    public DiaryNotFoundException(String message) {
        super(message);
    }

    public DiaryNotFoundException(Long diaryId) {
        super("다이어리를 찾을 수 없습니다. ID: " + diaryId);
    }
}
