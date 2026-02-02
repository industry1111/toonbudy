import { createContext, useContext, useState, useCallback } from 'react';
import { diaryRepo } from '../repo';
import { useAuth } from './AuthContext';

const DiaryContext = createContext(null);

export function DiaryProvider({ children }) {
  const { user } = useAuth();
  const [diaries, setDiaries] = useState([]);
  const [trash, setTrash] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 다이어리 목록 새로고침
  const refreshDiaries = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userDiaries = diaryRepo.getAll(user.id);
      setDiaries(userDiaries);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 휴지통 새로고침
  const refreshTrash = useCallback(() => {
    if (!user) return;
    const userTrash = diaryRepo.getTrash(user.id);
    setTrash(userTrash);
  }, [user]);

  // 다이어리 생성
  const createDiary = useCallback((data = {}) => {
    if (!user) return null;
    const newDiary = diaryRepo.create(user.id, data);
    setDiaries(prev => [...prev, newDiary]);
    return newDiary;
  }, [user]);

  // 다이어리 업데이트
  const updateDiary = useCallback((id, updates) => {
    const updated = diaryRepo.update(id, updates);
    if (updated) {
      setDiaries(prev => prev.map(d => d.id === id ? updated : d));
    }
    return updated;
  }, []);

  // 다이어리 삭제 (휴지통으로)
  const deleteDiary = useCallback((id) => {
    const success = diaryRepo.delete(id);
    if (success) {
      setDiaries(prev => prev.filter(d => d.id !== id));
      refreshTrash();
    }
    return success;
  }, [refreshTrash]);

  // 휴지통에서 복구
  const restoreDiary = useCallback((id) => {
    const success = diaryRepo.restore(id);
    if (success) {
      refreshDiaries();
      refreshTrash();
    }
    return success;
  }, [refreshDiaries, refreshTrash]);

  // 영구 삭제
  const permanentDeleteDiary = useCallback((id) => {
    const success = diaryRepo.permanentDelete(id);
    if (success) {
      setTrash(prev => prev.filter(d => d.id !== id));
    }
    return success;
  }, []);

  // 휴지통 비우기
  const emptyTrash = useCallback(() => {
    if (!user) return false;
    const success = diaryRepo.emptyTrash(user.id);
    if (success) {
      setTrash([]);
    }
    return success;
  }, [user]);

  // 단일 다이어리 조회
  const getDiaryById = useCallback((id) => {
    return diaryRepo.getById(id);
  }, []);

  // 공개 다이어리 조회
  const getPublicDiary = useCallback((id) => {
    return diaryRepo.getPublicById(id);
  }, []);

  const value = {
    diaries,
    trash,
    isLoading,
    refreshDiaries,
    refreshTrash,
    createDiary,
    updateDiary,
    deleteDiary,
    restoreDiary,
    permanentDeleteDiary,
    emptyTrash,
    getDiaryById,
    getPublicDiary,
  };

  return (
    <DiaryContext.Provider value={value}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
}
