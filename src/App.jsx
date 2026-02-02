import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DiaryProvider } from './contexts/DiaryContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LibraryPage from './pages/LibraryPage';
import FriendsPage from './pages/FriendsPage';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ViewPage from './pages/ViewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import TrashPage from './pages/TrashPage';
import SearchPage from './pages/SearchPage';
import SharePage from './pages/SharePage';
import OnboardingPage from './pages/OnboardingPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * 라우트 구조:
 *
 * Public Routes (인증 불필요):
 *   /login        - 로그인 페이지
 *   /signup       - 회원가입 페이지
 *   /share/:id    - 공유 다이어리 보기 (비로그인 접근 가능)
 *   /onboarding   - 온보딩 페이지
 *   *             - 404 Not Found
 *
 * Protected Routes (인증 필요):
 *   /             - 라이브러리 (메인, 내 작품 관리)
 *   /friends      - 친구 목록
 *   /friends/:friendId - 친구 프로필 (라이브러리/다이어리)
 *   /diary        - 내 다이어리 목록
 *   /editor/:id   - 다이어리 편집기
 *   /view/:id     - 다이어리 상세 보기
 *   /mypage       - 마이페이지 (프로필, 설정)
 *   /trash        - 휴지통
 *   /search       - 검색
 */
function App() {
  return (
    <AuthProvider>
      <DiaryProvider>
        <Routes>
          {/* ==================== Public Routes ==================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/share/:id" element={<SharePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* ==================== Protected Routes ==================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Main - Library */}
              <Route path="/" element={<LibraryPage />} />

              {/* Friends */}
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/friends/:friendId" element={<FriendsPage />} />

              {/* Diary */}
              <Route path="/diary" element={<HomePage />} />
              <Route path="/editor/:id" element={<EditorPage />} />
              <Route path="/view/:id" element={<ViewPage />} />

              {/* User */}
              <Route path="/mypage" element={<MyPage />} />

              {/* Utilities */}
              <Route path="/trash" element={<TrashPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
          </Route>

          {/* ==================== 404 Not Found ==================== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </DiaryProvider>
    </AuthProvider>
  );
}

export default App;
