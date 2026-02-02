// 웹툰/웹소설 카드 Repository
import { storage } from './storage';

const CARDS_KEY = 'cards';
const FOLDERS_KEY = 'folders';

// 카드 상태
export const CardStatus = {
  WATCHING: 'watching',      // 보는 중
  PLAN_TO_WATCH: 'planToWatch', // 볼 예정
  COMPLETED: 'completed',    // 완결
  ON_HOLD: 'onHold',         // 보류
};

// 플랫폼
export const Platform = {
  NAVER: 'naver',
  KAKAO: 'kakao',
  LEZHIN: 'lezhin',
  TOPTOON: 'toptoon',
  RIDI: 'ridi',
  OTHER: 'other',
};

// 장르
export const Genre = {
  ROMANCE: '로맨스',
  ACTION: '액션',
  FANTASY: '판타지',
  DRAMA: '드라마',
  COMEDY: '코미디',
  THRILLER: '스릴러',
  HORROR: '공포',
  SLICE_OF_LIFE: '일상',
  SPORTS: '스포츠',
  HISTORICAL: '시대극',
};

// 초기 샘플 데이터
const sampleCards = [
  {
    id: 'card_1',
    title: '나 혼자만 레벨업',
    coverImage: 'https://image-comic.pstatic.net/webtoon/716948/thumbnail/thumbnail_IMAG21_7846018410022939498.jpg',
    platform: Platform.NAVER,
    type: 'webtoon',
    genre: [Genre.ACTION, Genre.FANTASY],
    status: CardStatus.COMPLETED,
    author: '추공 / DUBU',
    description: '전 세계 최약체 헌터인 성진우가 이중 던전에서 숨겨진 퀘스트를 수행하며 혼자만 레벨업하게 되는 이야기',
    rating: 5,
    folderId: null,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: 'card_2',
    title: '여신강림',
    coverImage: 'https://image-comic.pstatic.net/webtoon/703846/thumbnail/thumbnail_IMAG21_3365638549995607801.jpg',
    platform: Platform.NAVER,
    type: 'webtoon',
    genre: [Genre.ROMANCE, Genre.COMEDY],
    status: CardStatus.COMPLETED,
    author: '야옹이',
    description: '메이크업 여신으로 변신한 여고생의 로맨스 코미디',
    rating: 4,
    folderId: null,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
  },
  {
    id: 'card_3',
    title: '전지적 독자 시점',
    coverImage: 'https://image-comic.pstatic.net/webtoon/747269/thumbnail/thumbnail_IMAG21_1700809644014088795.jpg',
    platform: Platform.NAVER,
    type: 'webtoon',
    genre: [Genre.ACTION, Genre.FANTASY],
    status: CardStatus.WATCHING,
    author: '싱숑 / 슬리핑드래곤',
    description: '10년간 읽어온 소설이 현실이 되었다. 유일한 독자인 나만이 이 세계의 결말을 알고 있다.',
    rating: 5,
    folderId: null,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'card_4',
    title: '화산귀환',
    coverImage: 'https://image-comic.pstatic.net/webtoon/769209/thumbnail/thumbnail_IMAG21_7644037658498645498.jpg',
    platform: Platform.NAVER,
    type: 'webtoon',
    genre: [Genre.ACTION, Genre.HISTORICAL],
    status: CardStatus.WATCHING,
    author: '비가 / LICO',
    description: '100년 만에 돌아온 화산파의 전설, 매화검존 청명!',
    rating: 5,
    folderId: null,
    createdAt: '2024-02-05T07:00:00Z',
    updatedAt: '2024-02-12T11:00:00Z',
  },
  {
    id: 'card_5',
    title: '재혼황후',
    coverImage: 'https://image-comic.pstatic.net/webtoon/758150/thumbnail/thumbnail_IMAG21_7764048691495267094.jpg',
    platform: Platform.NAVER,
    type: 'webtoon',
    genre: [Genre.ROMANCE, Genre.DRAMA],
    status: CardStatus.PLAN_TO_WATCH,
    author: 'Alpha Tart / 수니',
    description: '황후가 된 나비에가 이혼 후 다른 나라의 황제와 재혼하는 이야기',
    rating: 4,
    folderId: null,
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-25T16:00:00Z',
  },
  {
    id: 'card_6',
    title: '귀멸의 칼날',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',
    platform: Platform.OTHER,
    type: 'webtoon',
    genre: [Genre.ACTION, Genre.DRAMA],
    status: CardStatus.COMPLETED,
    author: '고토게 코요하루',
    description: '가족을 잃고 귀신이 된 여동생을 구하기 위해 귀신 사냥꾼이 된 탄지로의 이야기',
    rating: 5,
    folderId: null,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const sampleFolders = [
  { id: 'folder_1', name: '최애 작품', color: '#FF6B6B', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'folder_2', name: '로맨스', color: '#FFB6C1', createdAt: '2024-01-02T00:00:00Z' },
  { id: 'folder_3', name: '액션/판타지', color: '#4ECDC4', createdAt: '2024-01-03T00:00:00Z' },
];

// 초기화
const initializeCards = () => {
  if (!storage.get(CARDS_KEY)) {
    storage.set(CARDS_KEY, sampleCards);
  }
  if (!storage.get(FOLDERS_KEY)) {
    storage.set(FOLDERS_KEY, sampleFolders);
  }
};

initializeCards();

export const cardRepo = {
  // === 카드 CRUD ===
  getAll() {
    return storage.get(CARDS_KEY) || [];
  },

  getById(id) {
    const cards = this.getAll();
    return cards.find(c => c.id === id) || null;
  },

  getByStatus(status) {
    const cards = this.getAll();
    return cards.filter(c => c.status === status);
  },

  getByFolder(folderId) {
    const cards = this.getAll();
    return cards.filter(c => c.folderId === folderId);
  },

  create(cardData) {
    const cards = this.getAll();
    const newCard = {
      id: `card_${Date.now()}`,
      title: cardData.title || '새 작품',
      coverImage: cardData.coverImage || '',
      platform: cardData.platform || Platform.OTHER,
      type: cardData.type || 'webtoon',
      genre: cardData.genre || [],
      status: cardData.status || CardStatus.PLAN_TO_WATCH,
      author: cardData.author || '',
      description: cardData.description || '',
      rating: cardData.rating || 0,
      folderId: cardData.folderId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cards.push(newCard);
    storage.set(CARDS_KEY, cards);
    return newCard;
  },

  update(id, updates) {
    const cards = this.getAll();
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) return null;

    cards[index] = {
      ...cards[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.set(CARDS_KEY, cards);
    return cards[index];
  },

  updateStatus(id, status) {
    return this.update(id, { status });
  },

  moveToFolder(id, folderId) {
    return this.update(id, { folderId });
  },

  delete(id) {
    const cards = this.getAll();
    const filtered = cards.filter(c => c.id !== id);
    storage.set(CARDS_KEY, filtered);
    return true;
  },

  search(query) {
    const cards = this.getAll();
    const q = query.toLowerCase();
    return cards.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.author?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  },

  filter({ status, platform, genre, folderId }) {
    let cards = this.getAll();
    if (status) cards = cards.filter(c => c.status === status);
    if (platform) cards = cards.filter(c => c.platform === platform);
    if (genre) cards = cards.filter(c => c.genre?.includes(genre));
    if (folderId) cards = cards.filter(c => c.folderId === folderId);
    return cards;
  },

  // === 폴더 CRUD ===
  getFolders() {
    return storage.get(FOLDERS_KEY) || [];
  },

  createFolder(name, color = '#7BC4A8') {
    const folders = this.getFolders();
    const newFolder = {
      id: `folder_${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    storage.set(FOLDERS_KEY, folders);
    return newFolder;
  },

  updateFolder(id, updates) {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) return null;

    folders[index] = { ...folders[index], ...updates };
    storage.set(FOLDERS_KEY, folders);
    return folders[index];
  },

  deleteFolder(id) {
    const folders = this.getFolders();
    const filtered = folders.filter(f => f.id !== id);
    storage.set(FOLDERS_KEY, filtered);

    // 해당 폴더의 카드들은 폴더 없음으로 변경
    const cards = this.getAll();
    const updatedCards = cards.map(c =>
      c.folderId === id ? { ...c, folderId: null } : c
    );
    storage.set(CARDS_KEY, updatedCards);
    return true;
  },

  // === 통계 ===
  getStats() {
    const cards = this.getAll();
    return {
      total: cards.length,
      watching: cards.filter(c => c.status === CardStatus.WATCHING).length,
      planToWatch: cards.filter(c => c.status === CardStatus.PLAN_TO_WATCH).length,
      completed: cards.filter(c => c.status === CardStatus.COMPLETED).length,
      onHold: cards.filter(c => c.status === CardStatus.ON_HOLD).length,
    };
  },
};
