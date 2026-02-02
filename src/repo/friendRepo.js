// 친구 Repository
import { storage } from './storage';

const FRIENDS_KEY = 'friends';
const FRIEND_REQUESTS_KEY = 'friend_requests';

// 샘플 친구 데이터
const sampleFriends = [
  {
    id: 'friend_1',
    oderId: 'user_friend1',
    nickname: '웹툰러버',
    avatar: '🐰',
    bio: '판타지 웹툰 덕후입니다',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    sharedLibrary: true,
    sharedDiary: true,
    // 이 친구의 카드들 (공개된 것)
    publicCards: [
      {
        id: 'fc_1',
        title: '외모지상주의',
        coverImage: 'https://image-comic.pstatic.net/webtoon/641253/thumbnail/thumbnail_IMAG21_1810673419682058095.jpg',
        platform: 'naver',
        status: 'watching',
        genre: ['드라마', '액션'],
      },
      {
        id: 'fc_2',
        title: '싸움독학',
        coverImage: 'https://image-comic.pstatic.net/webtoon/736277/thumbnail/thumbnail_IMAG21_3632088712930592595.jpg',
        platform: 'naver',
        status: 'watching',
        genre: ['액션'],
      },
    ],
    // 친구의 다이어리 (공개된 것)
    publicDiary: {
      id: 'diary_f1',
      title: '내 최애 웹툰들',
      background: 'mint',
      cards: [
        { id: 'fc_1', x: 50, y: 80, rotation: -5, scale: 1 },
        { id: 'fc_2', x: 250, y: 100, rotation: 3, scale: 1.1 },
      ],
      stickers: [
        { id: 's1', emoji: '⭐', x: 180, y: 50, rotation: 0, scale: 1 },
      ],
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'friend_2',
    userId: 'user_friend2',
    nickname: '로맨스퀸',
    avatar: '🐱',
    bio: '로맨스 웹툰만 봐요 💕',
    isOnline: false,
    lastSeen: '2024-02-10T15:30:00Z',
    sharedLibrary: true,
    sharedDiary: true,
    publicCards: [
      {
        id: 'fc_3',
        title: '유미의 세포들',
        coverImage: 'https://image-comic.pstatic.net/webtoon/651673/thumbnail/thumbnail_IMAG21_3861879534716018689.jpg',
        platform: 'naver',
        status: 'completed',
        genre: ['로맨스', '코미디'],
      },
      {
        id: 'fc_4',
        title: '치즈인더트랩',
        coverImage: 'https://image-comic.pstatic.net/webtoon/25455/thumbnail/thumbnail_IMAG10_3783596168015953498.jpg',
        platform: 'naver',
        status: 'completed',
        genre: ['로맨스', '드라마'],
      },
    ],
    publicDiary: {
      id: 'diary_f2',
      title: '인생 로맨스 웹툰',
      background: 'peach',
      cards: [
        { id: 'fc_3', x: 80, y: 120, rotation: 0, scale: 1 },
        { id: 'fc_4', x: 280, y: 150, rotation: 5, scale: 0.9 },
      ],
      stickers: [
        { id: 's2', emoji: '💕', x: 200, y: 80, rotation: 10, scale: 1.2 },
        { id: 's3', emoji: '✨', x: 380, y: 200, rotation: -5, scale: 1 },
      ],
    },
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'friend_3',
    userId: 'user_friend3',
    nickname: '액션매니아',
    avatar: '🦊',
    bio: '무협/액션 웹툰 추천받아요!',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    sharedLibrary: true,
    sharedDiary: false,
    publicCards: [
      {
        id: 'fc_5',
        title: '갓 오브 하이스쿨',
        coverImage: 'https://image-comic.pstatic.net/webtoon/318995/thumbnail/thumbnail_IMAG21_2702030095504069227.jpg',
        platform: 'naver',
        status: 'completed',
        genre: ['액션', '판타지'],
      },
    ],
    publicDiary: null,
    createdAt: '2024-02-01T00:00:00Z',
  },
];

const sampleRequests = [
  {
    id: 'req_1',
    fromUserId: 'user_new1',
    fromNickname: '새친구1',
    fromAvatar: '🐻',
    status: 'pending',
    createdAt: '2024-02-12T10:00:00Z',
  },
];

// 초기화
const initializeFriends = () => {
  if (!storage.get(FRIENDS_KEY)) {
    storage.set(FRIENDS_KEY, sampleFriends);
  }
  if (!storage.get(FRIEND_REQUESTS_KEY)) {
    storage.set(FRIEND_REQUESTS_KEY, sampleRequests);
  }
};

initializeFriends();

export const friendRepo = {
  // === 친구 목록 ===
  getAll() {
    return storage.get(FRIENDS_KEY) || [];
  },

  getById(id) {
    const friends = this.getAll();
    return friends.find(f => f.id === id) || null;
  },

  getOnlineFriends() {
    const friends = this.getAll();
    return friends.filter(f => f.isOnline);
  },

  // 친구의 공개 라이브러리 가져오기
  getFriendLibrary(friendId) {
    const friend = this.getById(friendId);
    if (!friend || !friend.sharedLibrary) return [];
    return friend.publicCards || [];
  },

  // 친구의 공개 다이어리 가져오기
  getFriendDiary(friendId) {
    const friend = this.getById(friendId);
    if (!friend || !friend.sharedDiary) return null;
    return friend.publicDiary || null;
  },

  // 친구 추가
  addFriend(friendData) {
    const friends = this.getAll();
    const newFriend = {
      id: `friend_${Date.now()}`,
      userId: friendData.userId,
      nickname: friendData.nickname,
      avatar: friendData.avatar || '🐱',
      bio: friendData.bio || '',
      isOnline: false,
      lastSeen: new Date().toISOString(),
      sharedLibrary: true,
      sharedDiary: true,
      publicCards: [],
      publicDiary: null,
      createdAt: new Date().toISOString(),
    };
    friends.push(newFriend);
    storage.set(FRIENDS_KEY, friends);
    return newFriend;
  },

  // 친구 삭제
  removeFriend(id) {
    const friends = this.getAll();
    const filtered = friends.filter(f => f.id !== id);
    storage.set(FRIENDS_KEY, filtered);
    return true;
  },

  // === 친구 요청 ===
  getRequests() {
    return storage.get(FRIEND_REQUESTS_KEY) || [];
  },

  getPendingRequests() {
    const requests = this.getRequests();
    return requests.filter(r => r.status === 'pending');
  },

  sendRequest(toUserId, toNickname) {
    const requests = this.getRequests();
    const newRequest = {
      id: `req_${Date.now()}`,
      toUserId,
      toNickname,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    storage.set(FRIEND_REQUESTS_KEY, requests);
    return newRequest;
  },

  acceptRequest(requestId) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    const request = requests[index];
    requests[index] = { ...request, status: 'accepted' };
    storage.set(FRIEND_REQUESTS_KEY, requests);

    // 친구 목록에 추가
    this.addFriend({
      userId: request.fromUserId,
      nickname: request.fromNickname,
      avatar: request.fromAvatar,
    });

    return requests[index];
  },

  rejectRequest(requestId) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    requests[index] = { ...requests[index], status: 'rejected' };
    storage.set(FRIEND_REQUESTS_KEY, requests);
    return requests[index];
  },

  // === 통계 ===
  getStats() {
    const friends = this.getAll();
    const requests = this.getPendingRequests();
    return {
      total: friends.length,
      online: friends.filter(f => f.isOnline).length,
      pendingRequests: requests.length,
    };
  },
};
