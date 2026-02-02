import { storage } from './storage';

const DIARIES_KEY = 'diaries';
const TRASH_KEY = 'trash';

// 초기 샘플 데이터
const initialDiaries = [
  {
    id: 'diary_1',
    userId: 'user_1',
    title: '오늘의 웹툰 감상',
    date: '2026-01-28',
    background: 'plain',
    stickers: [
      { id: 1, emoji: '⚔️', x: 120, y: 95, rotation: -15, scale: 1.2, isText: false },
      { id: 2, emoji: '💎', x: 230, y: 160, rotation: 10, scale: 1.0, isText: false },
      { id: 3, emoji: '최고', x: 140, y: 240, rotation: 0, scale: 1.0, isText: true },
    ],
    memo: '재벌집 막내아들 - 반전 대박!\n화산귀환 - 주인공 멋있어 ㅠㅠ',
    likes: 24,
    isPublic: true,
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
  },
  {
    id: 'diary_2',
    userId: 'user_1',
    title: '주말 정주행 기록',
    date: '2026-01-25',
    background: 'grid',
    stickers: [
      { id: 1, emoji: '📚', x: 100, y: 120, rotation: 5, scale: 1.3, isText: false },
      { id: 2, emoji: '✨', x: 200, y: 180, rotation: -8, scale: 1.0, isText: false },
      { id: 3, emoji: '완결!', x: 160, y: 280, rotation: 0, scale: 1.1, isText: true },
    ],
    memo: '나 혼자만 레벨업 완독!\n마지막 회 감동이었다...',
    likes: 42,
    isPublic: true,
    createdAt: '2026-01-25T14:30:00Z',
    updatedAt: '2026-01-25T14:30:00Z',
  },
];

// 초기화
function initializeDiaries() {
  if (!storage.get(DIARIES_KEY)) {
    storage.set(DIARIES_KEY, initialDiaries);
  }
  if (!storage.get(TRASH_KEY)) {
    storage.set(TRASH_KEY, []);
  }
}
initializeDiaries();

export const diaryRepo = {
  // 다이어리 목록 가져오기
  getAll(userId) {
    const diaries = storage.get(DIARIES_KEY) || [];
    return diaries.filter(d => d.userId === userId);
  },

  // 단일 다이어리 가져오기
  getById(id) {
    const diaries = storage.get(DIARIES_KEY) || [];
    return diaries.find(d => d.id === id) || null;
  },

  // 공개 다이어리 가져오기 (공유용)
  getPublicById(id) {
    const diary = this.getById(id);
    return diary?.isPublic ? diary : null;
  },

  // 다이어리 생성
  create(userId, data = {}) {
    const diaries = storage.get(DIARIES_KEY) || [];
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const newDiary = {
      id: `diary_${Date.now()}`,
      userId,
      title: data.title || '새 다이어리',
      date: data.date || today,
      background: data.background || 'plain',
      stickers: data.stickers || [],
      memo: data.memo || '',
      likes: 0,
      isPublic: data.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    };

    diaries.push(newDiary);
    storage.set(DIARIES_KEY, diaries);
    return newDiary;
  },

  // 다이어리 업데이트
  update(id, updates) {
    const diaries = storage.get(DIARIES_KEY) || [];
    const index = diaries.findIndex(d => d.id === id);

    if (index === -1) return null;

    const updatedDiary = {
      ...diaries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    diaries[index] = updatedDiary;
    storage.set(DIARIES_KEY, diaries);
    return updatedDiary;
  },

  // 다이어리 삭제 (휴지통으로 이동)
  delete(id) {
    const diaries = storage.get(DIARIES_KEY) || [];
    const trash = storage.get(TRASH_KEY) || [];

    const index = diaries.findIndex(d => d.id === id);
    if (index === -1) return false;

    const [deletedDiary] = diaries.splice(index, 1);
    deletedDiary.deletedAt = new Date().toISOString();
    trash.push(deletedDiary);

    storage.set(DIARIES_KEY, diaries);
    storage.set(TRASH_KEY, trash);
    return true;
  },

  // 휴지통 목록
  getTrash(userId) {
    const trash = storage.get(TRASH_KEY) || [];
    return trash.filter(d => d.userId === userId);
  },

  // 휴지통에서 복구
  restore(id) {
    const diaries = storage.get(DIARIES_KEY) || [];
    const trash = storage.get(TRASH_KEY) || [];

    const index = trash.findIndex(d => d.id === id);
    if (index === -1) return false;

    const [restoredDiary] = trash.splice(index, 1);
    delete restoredDiary.deletedAt;
    restoredDiary.updatedAt = new Date().toISOString();
    diaries.push(restoredDiary);

    storage.set(DIARIES_KEY, diaries);
    storage.set(TRASH_KEY, trash);
    return true;
  },

  // 휴지통에서 영구 삭제
  permanentDelete(id) {
    const trash = storage.get(TRASH_KEY) || [];
    const index = trash.findIndex(d => d.id === id);

    if (index === -1) return false;

    trash.splice(index, 1);
    storage.set(TRASH_KEY, trash);
    return true;
  },

  // 휴지통 비우기
  emptyTrash(userId) {
    const trash = storage.get(TRASH_KEY) || [];
    const filtered = trash.filter(d => d.userId !== userId);
    storage.set(TRASH_KEY, filtered);
    return true;
  },

  // 좋아요 토글
  toggleLike(id) {
    const diary = this.getById(id);
    if (!diary) return null;

    return this.update(id, { likes: diary.likes + 1 });
  },
};
