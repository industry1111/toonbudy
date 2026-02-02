import { storage } from './storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';

// 토큰 생성 (간단한 mock 토큰)
function generateToken(userId) {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7일 후 만료
    iat: Date.now(),
  };
  return btoa(JSON.stringify(payload));
}

// 토큰 검증
function validateToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // 만료됨
    }
    return payload;
  } catch {
    return null;
  }
}

// 이메일 유효성 검사
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: '이메일을 입력해주세요.' };
  if (!emailRegex.test(email)) return { valid: false, error: '올바른 이메일 형식이 아닙니다.' };
  return { valid: true };
}

// 비밀번호 유효성 검사
export function validatePassword(password) {
  if (!password) return { valid: false, error: '비밀번호를 입력해주세요.' };
  if (password.length < 6) return { valid: false, error: '비밀번호는 6자 이상이어야 합니다.' };
  if (password.length > 50) return { valid: false, error: '비밀번호는 50자 이하여야 합니다.' };
  if (!/[a-zA-Z]/.test(password)) return { valid: false, error: '비밀번호에 영문자를 포함해주세요.' };
  if (!/[0-9]/.test(password)) return { valid: false, error: '비밀번호에 숫자를 포함해주세요.' };
  return { valid: true };
}

// 닉네임 유효성 검사
export function validateNickname(nickname) {
  if (!nickname) return { valid: false, error: '닉네임을 입력해주세요.' };
  if (nickname.length < 2) return { valid: false, error: '닉네임은 2자 이상이어야 합니다.' };
  if (nickname.length > 20) return { valid: false, error: '닉네임은 20자 이하여야 합니다.' };
  return { valid: true };
}

// 초기 데이터
const initialUsers = [
  {
    id: 'user_1',
    email: 'demo@toonverti.com',
    password: 'demo1234',
    nickname: '웹툰덕후',
    avatar: '🐱',
    bio: '웹툰 마니아 무협, 판타지 좋아해요',
    joinDate: '2024-03-15',
    hasCompletedOnboarding: true,
  },
];

// 초기화
function initializeUsers() {
  if (!storage.get(USERS_KEY)) {
    storage.set(USERS_KEY, initialUsers);
  }
}
initializeUsers();

export const userRepo = {
  // 로그인
  login(email, password) {
    // 이메일 검증
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const users = storage.get(USERS_KEY) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      const token = generateToken(user.id);

      storage.set(CURRENT_USER_KEY, safeUser);
      storage.set(AUTH_TOKEN_KEY, token);

      return { success: true, user: safeUser, token };
    }
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  },

  // 회원가입
  signup({ email, password, nickname }) {
    // 유효성 검사
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.valid) {
      return { success: false, error: nicknameValidation.error };
    }

    const users = storage.get(USERS_KEY) || [];

    if (users.some(u => u.email === email)) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      nickname,
      avatar: '🐱',
      bio: '',
      joinDate: new Date().toISOString().split('T')[0],
      hasCompletedOnboarding: false,
    };

    users.push(newUser);
    storage.set(USERS_KEY, users);

    const { password: _, ...safeUser } = newUser;
    const token = generateToken(newUser.id);

    storage.set(CURRENT_USER_KEY, safeUser);
    storage.set(AUTH_TOKEN_KEY, token);

    return { success: true, user: safeUser, token };
  },

  // 로그아웃
  logout() {
    storage.remove(CURRENT_USER_KEY);
    storage.remove(AUTH_TOKEN_KEY);
    return { success: true };
  },

  // 현재 사용자 가져오기 (토큰 검증 포함)
  getCurrentUser() {
    const token = storage.get(AUTH_TOKEN_KEY);
    const tokenPayload = validateToken(token);

    if (!tokenPayload) {
      // 토큰이 없거나 만료됨
      storage.remove(CURRENT_USER_KEY);
      storage.remove(AUTH_TOKEN_KEY);
      return null;
    }

    return storage.get(CURRENT_USER_KEY);
  },

  // 토큰 가져오기
  getToken() {
    return storage.get(AUTH_TOKEN_KEY);
  },

  // 토큰 유효성 검사
  isTokenValid() {
    const token = storage.get(AUTH_TOKEN_KEY);
    return validateToken(token) !== null;
  },

  // 사용자 정보 업데이트
  updateUser(updates) {
    const currentUser = storage.get(CURRENT_USER_KEY);
    if (!currentUser) return { success: false, error: '로그인이 필요합니다.' };

    const users = storage.get(USERS_KEY) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) return { success: false, error: '사용자를 찾을 수 없습니다.' };

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    storage.set(USERS_KEY, users);

    const { password: _, ...safeUser } = updatedUser;
    storage.set(CURRENT_USER_KEY, safeUser);

    return { success: true, user: safeUser };
  },

  // 온보딩 완료 처리
  completeOnboarding() {
    return this.updateUser({ hasCompletedOnboarding: true });
  },
};
