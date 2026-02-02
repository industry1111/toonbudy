import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cardRepo, CardStatus, Platform, Genre } from '../repo';
import { Button, Modal, Input, Toast } from '../components/ui';
import WebtoonCard from '../components/WebtoonCard';

const statusTabs = [
  { key: 'all', label: '전체', icon: '📚' },
  { key: CardStatus.WATCHING, label: '보는 중', icon: '👀' },
  { key: CardStatus.PLAN_TO_WATCH, label: '볼 예정', icon: '📋' },
  { key: CardStatus.COMPLETED, label: '완결', icon: '✅' },
  { key: CardStatus.ON_HOLD, label: '보류', icon: '⏸️' },
];

export default function LibraryPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 새 카드 폼
  const [newCard, setNewCard] = useState({
    title: '',
    coverImage: '',
    platform: Platform.NAVER,
    type: 'webtoon',
    genre: [],
    author: '',
    description: '',
    status: CardStatus.PLAN_TO_WATCH,
  });

  // 새 폴더 폼
  const [newFolder, setNewFolder] = useState({ name: '', color: '#7BC4A8' });

  // 데이터 로드
  const loadData = useCallback(() => {
    let loadedCards = cardRepo.getAll();

    // 필터 적용
    if (selectedTab !== 'all') {
      loadedCards = loadedCards.filter(c => c.status === selectedTab);
    }
    if (selectedFolder) {
      loadedCards = loadedCards.filter(c => c.folderId === selectedFolder);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      loadedCards = loadedCards.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.author?.toLowerCase().includes(q)
      );
    }

    setCards(loadedCards);
    setFolders(cardRepo.getFolders());
  }, [selectedTab, selectedFolder, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // 카드 추가
  const handleAddCard = () => {
    if (!newCard.title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }
    cardRepo.create(newCard);
    setShowAddModal(false);
    setNewCard({
      title: '',
      coverImage: '',
      platform: Platform.NAVER,
      type: 'webtoon',
      genre: [],
      author: '',
      description: '',
      status: CardStatus.PLAN_TO_WATCH,
    });
    loadData();
    showToast('작품이 추가되었습니다!');
  };

  // 카드 상태 변경
  const handleStatusChange = (cardId, status) => {
    cardRepo.updateStatus(cardId, status);
    loadData();
    showToast('상태가 변경되었습니다.');
  };

  // 카드 삭제
  const handleDeleteCard = (cardId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      cardRepo.delete(cardId);
      setSelectedCard(null);
      loadData();
      showToast('삭제되었습니다.');
    }
  };

  // 폴더 추가
  const handleAddFolder = () => {
    if (!newFolder.name.trim()) {
      showToast('폴더 이름을 입력해주세요.', 'error');
      return;
    }
    cardRepo.createFolder(newFolder.name, newFolder.color);
    setShowFolderModal(false);
    setNewFolder({ name: '', color: '#7BC4A8' });
    loadData();
    showToast('폴더가 생성되었습니다!');
  };

  // 폴더로 이동
  const handleMoveToFolder = (cardId, folderId) => {
    cardRepo.moveToFolder(cardId, folderId);
    loadData();
    showToast('폴더로 이동했습니다.');
  };

  const stats = cardRepo.getStats();

  return (
    <div className="library-container">
      {/* 헤더 */}
      <div className="library-header">
        <div className="library-header__left">
          <h1 className="library-title">
            <span className="library-title__icon">📚</span>
            내 라이브러리
          </h1>
          <p className="library-subtitle">
            총 {stats.total}개의 작품
          </p>
        </div>
        <div className="library-header__right">
          <Button onClick={() => setShowAddModal(true)} icon="➕">
            작품 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="library-stats">
        <div className="library-stat">
          <span className="library-stat__icon">👀</span>
          <span className="library-stat__value">{stats.watching}</span>
          <span className="library-stat__label">보는 중</span>
        </div>
        <div className="library-stat">
          <span className="library-stat__icon">📋</span>
          <span className="library-stat__value">{stats.planToWatch}</span>
          <span className="library-stat__label">볼 예정</span>
        </div>
        <div className="library-stat">
          <span className="library-stat__icon">✅</span>
          <span className="library-stat__value">{stats.completed}</span>
          <span className="library-stat__label">완결</span>
        </div>
        <div className="library-stat">
          <span className="library-stat__icon">⏸️</span>
          <span className="library-stat__value">{stats.onHold}</span>
          <span className="library-stat__label">보류</span>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="library-filters">
        {/* 상태 탭 */}
        <div className="library-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              className={`library-tab ${selectedTab === tab.key ? 'library-tab--active' : ''}`}
              onClick={() => setSelectedTab(tab.key)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="library-search">
          <input
            type="text"
            placeholder="작품명, 작가 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="library-search__input"
          />
          {searchQuery && (
            <button
              className="library-search__clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 폴더 영역 */}
      <div className="library-folders">
        <div className="library-folders__header">
          <span className="library-folders__title">📁 폴더</span>
          <button
            className="library-folders__add"
            onClick={() => setShowFolderModal(true)}
          >
            + 새 폴더
          </button>
        </div>
        <div className="library-folders__list">
          <button
            className={`library-folder ${!selectedFolder ? 'library-folder--active' : ''}`}
            onClick={() => setSelectedFolder(null)}
          >
            전체
          </button>
          {folders.map(folder => (
            <button
              key={folder.id}
              className={`library-folder ${selectedFolder === folder.id ? 'library-folder--active' : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
              style={{ '--folder-color': folder.color }}
            >
              <span className="library-folder__dot" style={{ background: folder.color }} />
              {folder.name}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="library-grid">
        {cards.length > 0 ? (
          cards.map(card => (
            <div key={card.id} className="library-card-wrapper">
              <WebtoonCard
                card={card}
                isSelected={selectedCard === card.id}
                onSelect={(c) => setSelectedCard(c.id === selectedCard ? null : c.id)}
                onStatusChange={handleStatusChange}
                showComments={false}
              />
              {/* 카드 액션 메뉴 */}
              {selectedCard === card.id && (
                <div className="library-card-actions">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleMoveToFolder(card.id, e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>폴더로 이동</option>
                    <option value="null">폴더 없음</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    className="library-card-delete"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="library-empty">
            <span className="library-empty__icon">📭</span>
            <h3>작품이 없습니다</h3>
            <p>새로운 웹툰이나 웹소설을 추가해보세요!</p>
            <Button onClick={() => setShowAddModal(true)}>
              작품 추가하기
            </Button>
          </div>
        )}
      </div>

      {/* 작품 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="작품 추가"
      >
        <div className="add-card-form">
          <Input
            label="제목"
            value={newCard.title}
            onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
            placeholder="웹툰/웹소설 제목"
            fullWidth
          />
          <Input
            label="작가"
            value={newCard.author}
            onChange={(e) => setNewCard({ ...newCard, author: e.target.value })}
            placeholder="작가명"
            fullWidth
          />
          <Input
            label="커버 이미지 URL"
            value={newCard.coverImage}
            onChange={(e) => setNewCard({ ...newCard, coverImage: e.target.value })}
            placeholder="https://..."
            fullWidth
          />
          <div className="form-row">
            <div className="form-field">
              <label>플랫폼</label>
              <select
                value={newCard.platform}
                onChange={(e) => setNewCard({ ...newCard, platform: e.target.value })}
              >
                <option value="naver">네이버</option>
                <option value="kakao">카카오</option>
                <option value="lezhin">레진</option>
                <option value="toptoon">탑툰</option>
                <option value="ridi">리디</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div className="form-field">
              <label>상태</label>
              <select
                value={newCard.status}
                onChange={(e) => setNewCard({ ...newCard, status: e.target.value })}
              >
                <option value="watching">보는 중</option>
                <option value="planToWatch">볼 예정</option>
                <option value="completed">완결</option>
                <option value="onHold">보류</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>장르 (다중 선택)</label>
            <div className="genre-chips">
              {Object.entries(Genre).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  className={`genre-chip ${newCard.genre.includes(value) ? 'genre-chip--active' : ''}`}
                  onClick={() => {
                    const genres = newCard.genre.includes(value)
                      ? newCard.genre.filter(g => g !== value)
                      : [...newCard.genre, value];
                    setNewCard({ ...newCard, genre: genres });
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label>설명</label>
            <textarea
              value={newCard.description}
              onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
              placeholder="작품 설명..."
              rows={3}
            />
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddCard}>
              추가하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 폴더 추가 모달 */}
      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="새 폴더"
      >
        <div className="add-folder-form">
          <Input
            label="폴더 이름"
            value={newFolder.name}
            onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
            placeholder="폴더 이름"
            fullWidth
          />
          <div className="form-field">
            <label>색상</label>
            <div className="color-picker">
              {['#7BC4A8', '#FF6B6B', '#FFB6C1', '#4ECDC4', '#F5A623', '#9B59B6'].map(color => (
                <button
                  key={color}
                  className={`color-option ${newFolder.color === color ? 'color-option--active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setNewFolder({ ...newFolder, color })}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowFolderModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddFolder}>
              만들기
            </Button>
          </div>
        </div>
      </Modal>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <style>{`
        .library-container {
          padding: 32px 48px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .library-title {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 700;
          color: #3D3024;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .library-title__icon {
          font-size: 36px;
        }

        .library-subtitle {
          color: #8B7E6A;
          margin: 0;
        }

        .library-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .library-stat {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(93, 78, 60, 0.08);
        }

        .library-stat__icon {
          font-size: 24px;
          display: block;
          margin-bottom: 8px;
        }

        .library-stat__value {
          font-size: 28px;
          font-weight: 700;
          color: #3D3024;
          display: block;
        }

        .library-stat__label {
          font-size: 13px;
          color: #8B7E6A;
        }

        .library-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .library-tabs {
          display: flex;
          gap: 8px;
        }

        .library-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: white;
          color: #8B7E6A;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .library-tab:hover {
          background: #F5EDE4;
        }

        .library-tab--active {
          background: linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%);
          color: #1D4A3A;
        }

        .library-search {
          position: relative;
          width: 280px;
        }

        .library-search__input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 1px solid #E8E4DF;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .library-search__input:focus {
          border-color: #7BC4A8;
        }

        .library-search__clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: none;
          color: #A89880;
          cursor: pointer;
          font-size: 14px;
        }

        .library-folders {
          margin-bottom: 32px;
        }

        .library-folders__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .library-folders__title {
          font-weight: 600;
          color: #5D4E3C;
        }

        .library-folders__add {
          border: none;
          background: none;
          color: #7BC4A8;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .library-folders__list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .library-folder {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid #E8E4DF;
          border-radius: 20px;
          background: white;
          font-size: 13px;
          color: #5D4E3C;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .library-folder:hover {
          border-color: #7BC4A8;
        }

        .library-folder--active {
          background: #E8F5F1;
          border-color: #7BC4A8;
        }

        .library-folder__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .library-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 24px;
        }

        .library-card-wrapper {
          position: relative;
        }

        .library-card-actions {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          background: white;
          padding: 6px 10px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(93, 78, 60, 0.15);
          z-index: 20;
        }

        .library-card-actions select {
          padding: 4px 8px;
          border: 1px solid #E8E4DF;
          border-radius: 4px;
          font-size: 11px;
        }

        .library-card-delete {
          border: none;
          background: #FFE5E5;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .library-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: #8B7E6A;
        }

        .library-empty__icon {
          font-size: 64px;
          display: block;
          margin-bottom: 16px;
        }

        .library-empty h3 {
          color: #5D4E3C;
          margin: 0 0 8px 0;
        }

        .library-empty p {
          margin: 0 0 24px 0;
        }

        /* 폼 스타일 */
        .add-card-form,
        .add-folder-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-field {
          flex: 1;
        }

        .form-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #5D4E3C;
          margin-bottom: 6px;
        }

        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E8E4DF;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
        }

        .form-field textarea {
          resize: vertical;
          font-family: inherit;
        }

        .genre-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .genre-chip {
          padding: 6px 12px;
          border: 1px solid #E8E4DF;
          border-radius: 16px;
          background: white;
          font-size: 12px;
          color: #5D4E3C;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .genre-chip:hover {
          border-color: #7BC4A8;
        }

        .genre-chip--active {
          background: #E8F5F1;
          border-color: #7BC4A8;
          color: #2D5A4A;
        }

        .color-picker {
          display: flex;
          gap: 8px;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option--active {
          border-color: #3D3024;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        @media (max-width: 1024px) {
          .library-container {
            padding: 24px;
          }

          .library-stats {
            flex-wrap: wrap;
          }

          .library-stat {
            flex: 1 1 calc(50% - 8px);
          }
        }

        @media (max-width: 640px) {
          .library-container {
            padding: 16px;
          }

          .library-header {
            flex-direction: column;
            gap: 16px;
          }

          .library-title {
            font-size: 24px;
          }

          .library-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .library-tabs {
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .library-search {
            width: 100%;
          }

          .library-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
