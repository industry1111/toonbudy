import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { friendRepo } from '../repo';
import { Button, Card, Modal, Input, Toast } from '../components/ui';
import WebtoonCard from '../components/WebtoonCard';

export default function FriendsPage() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState('library'); // library | diary
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchNickname, setSearchNickname] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (friendId) {
      const friend = friendRepo.getById(friendId);
      setSelectedFriend(friend);
    } else {
      setSelectedFriend(null);
    }
  }, [friendId]);

  const loadFriends = () => {
    setFriends(friendRepo.getAll());
    setPendingRequests(friendRepo.getPendingRequests());
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAcceptRequest = (requestId) => {
    friendRepo.acceptRequest(requestId);
    loadFriends();
    showToast('친구 요청을 수락했습니다!');
  };

  const handleRejectRequest = (requestId) => {
    friendRepo.rejectRequest(requestId);
    loadFriends();
    showToast('친구 요청을 거절했습니다.');
  };

  const handleRemoveFriend = (id) => {
    if (window.confirm('정말 친구를 삭제하시겠습니까?')) {
      friendRepo.removeFriend(id);
      loadFriends();
      if (friendId === id) {
        navigate('/friends');
      }
      showToast('친구가 삭제되었습니다.');
    }
  };

  const stats = friendRepo.getStats();

  // 친구 프로필 페이지
  if (selectedFriend) {
    return (
      <div className="friend-profile">
        <div className="friend-profile__header">
          <button className="friend-profile__back" onClick={() => navigate('/friends')}>
            ← 친구 목록
          </button>
        </div>

        <div className="friend-profile__info">
          <div className="friend-profile__avatar">{selectedFriend.avatar}</div>
          <h1 className="friend-profile__name">{selectedFriend.nickname}</h1>
          <p className="friend-profile__bio">{selectedFriend.bio || '소개가 없습니다.'}</p>
          <div className="friend-profile__status">
            {selectedFriend.isOnline ? (
              <span className="friend-status friend-status--online">● 온라인</span>
            ) : (
              <span className="friend-status">○ 오프라인</span>
            )}
          </div>
        </div>

        <div className="friend-profile__tabs">
          <button
            className={`friend-profile__tab ${activeTab === 'library' ? 'friend-profile__tab--active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            📚 라이브러리
          </button>
          <button
            className={`friend-profile__tab ${activeTab === 'diary' ? 'friend-profile__tab--active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            📔 다이어리
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="friend-library">
            {selectedFriend.sharedLibrary && selectedFriend.publicCards?.length > 0 ? (
              <div className="friend-library__grid">
                {selectedFriend.publicCards.map(card => (
                  <WebtoonCard
                    key={card.id}
                    card={card}
                    isDraggable={false}
                    showComments={false}
                    onStatusChange={null}
                  />
                ))}
              </div>
            ) : (
              <div className="friend-empty">
                <span className="friend-empty__icon">🔒</span>
                <p>공개된 라이브러리가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="friend-diary">
            {selectedFriend.sharedDiary && selectedFriend.publicDiary ? (
              <div className="friend-diary__canvas">
                <h3 className="friend-diary__title">{selectedFriend.publicDiary.title}</h3>
                <div
                  className="friend-diary__board"
                  style={{
                    background: selectedFriend.publicDiary.background === 'mint'
                      ? '#E8F5F1'
                      : selectedFriend.publicDiary.background === 'peach'
                      ? '#FFF0E5'
                      : '#FDF8F3'
                  }}
                >
                  {/* 카드 배치 */}
                  {selectedFriend.publicDiary.cards?.map((placement) => {
                    const card = selectedFriend.publicCards?.find(c => c.id === placement.id);
                    if (!card) return null;
                    return (
                      <div
                        key={placement.id}
                        className="friend-diary__card"
                        style={{
                          left: placement.x,
                          top: placement.y,
                          transform: `rotate(${placement.rotation || 0}deg) scale(${placement.scale || 1})`,
                        }}
                      >
                        <WebtoonCard
                          card={card}
                          isDraggable={false}
                          showComments={true}
                        />
                      </div>
                    );
                  })}

                  {/* 스티커 */}
                  {selectedFriend.publicDiary.stickers?.map((sticker) => (
                    <span
                      key={sticker.id}
                      className="friend-diary__sticker"
                      style={{
                        left: sticker.x,
                        top: sticker.y,
                        transform: `rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`,
                      }}
                    >
                      {sticker.emoji}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="friend-empty">
                <span className="friend-empty__icon">🔒</span>
                <p>공개된 다이어리가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        <style>{`
          .friend-profile {
            padding: 32px 48px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .friend-profile__header {
            margin-bottom: 24px;
          }

          .friend-profile__back {
            border: none;
            background: none;
            color: #7BC4A8;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }

          .friend-profile__info {
            text-align: center;
            margin-bottom: 40px;
          }

          .friend-profile__avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            margin: 0 auto 16px;
            box-shadow: 0 8px 24px rgba(123, 196, 168, 0.3);
          }

          .friend-profile__name {
            font-family: var(--font-serif);
            font-size: 28px;
            color: #3D3024;
            margin: 0 0 8px 0;
          }

          .friend-profile__bio {
            color: #8B7E6A;
            margin: 0 0 12px 0;
          }

          .friend-status {
            font-size: 13px;
            color: #8B7E6A;
          }

          .friend-status--online {
            color: #7BC4A8;
          }

          .friend-profile__tabs {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 32px;
          }

          .friend-profile__tab {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            background: white;
            font-size: 14px;
            font-weight: 500;
            color: #8B7E6A;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .friend-profile__tab:hover {
            background: #F5EDE4;
          }

          .friend-profile__tab--active {
            background: linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%);
            color: #1D4A3A;
          }

          .friend-library__grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 24px;
          }

          .friend-diary__canvas {
            text-align: center;
          }

          .friend-diary__title {
            font-family: var(--font-serif);
            font-size: 20px;
            color: #3D3024;
            margin: 0 0 24px 0;
          }

          .friend-diary__board {
            position: relative;
            width: 100%;
            max-width: 600px;
            aspect-ratio: 3/4;
            margin: 0 auto;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(93, 78, 60, 0.12);
          }

          .friend-diary__card {
            position: absolute;
          }

          .friend-diary__sticker {
            position: absolute;
            font-size: 32px;
            user-select: none;
          }

          .friend-empty {
            text-align: center;
            padding: 80px 20px;
            color: #8B7E6A;
          }

          .friend-empty__icon {
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
          }

          @media (max-width: 640px) {
            .friend-profile {
              padding: 16px;
            }

            .friend-library__grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
          }
        `}</style>
      </div>
    );
  }

  // 친구 목록 페이지
  return (
    <div className="friends-container">
      <div className="friends-header">
        <div className="friends-header__left">
          <h1 className="friends-title">
            <span>👥</span> 친구
          </h1>
          <p className="friends-subtitle">
            {stats.total}명의 친구 · {stats.online}명 온라인
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon="➕">
          친구 추가
        </Button>
      </div>

      {/* 친구 요청 */}
      {pendingRequests.length > 0 && (
        <div className="friends-requests">
          <h3 className="friends-section-title">📬 친구 요청 ({pendingRequests.length})</h3>
          <div className="friends-requests__list">
            {pendingRequests.map(request => (
              <div key={request.id} className="friend-request">
                <div className="friend-request__avatar">{request.fromAvatar}</div>
                <div className="friend-request__info">
                  <span className="friend-request__name">{request.fromNickname}</span>
                  <span className="friend-request__date">
                    {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="friend-request__actions">
                  <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                    수락
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleRejectRequest(request.id)}>
                    거절
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 온라인 친구 */}
      {friends.filter(f => f.isOnline).length > 0 && (
        <div className="friends-section">
          <h3 className="friends-section-title">🟢 온라인</h3>
          <div className="friends-grid">
            {friends.filter(f => f.isOnline).map(friend => (
              <div
                key={friend.id}
                className="friend-card"
                onClick={() => navigate(`/friends/${friend.id}`)}
              >
                <div className="friend-card__avatar">{friend.avatar}</div>
                <div className="friend-card__info">
                  <span className="friend-card__name">{friend.nickname}</span>
                  <span className="friend-card__bio">{friend.bio}</span>
                </div>
                <button
                  className="friend-card__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFriend(friend.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 모든 친구 */}
      <div className="friends-section">
        <h3 className="friends-section-title">👥 모든 친구</h3>
        {friends.length > 0 ? (
          <div className="friends-grid">
            {friends.map(friend => (
              <div
                key={friend.id}
                className="friend-card"
                onClick={() => navigate(`/friends/${friend.id}`)}
              >
                <div className="friend-card__avatar">
                  {friend.avatar}
                  {friend.isOnline && <span className="friend-card__online" />}
                </div>
                <div className="friend-card__info">
                  <span className="friend-card__name">{friend.nickname}</span>
                  <span className="friend-card__bio">{friend.bio}</span>
                </div>
                <button
                  className="friend-card__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFriend(friend.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="friends-empty">
            <span className="friends-empty__icon">👋</span>
            <h3>아직 친구가 없어요</h3>
            <p>친구를 추가해서 서로의 취향을 공유해보세요!</p>
            <Button onClick={() => setShowAddModal(true)}>
              친구 추가하기
            </Button>
          </div>
        )}
      </div>

      {/* 친구 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="친구 추가"
      >
        <div className="add-friend-form">
          <Input
            label="닉네임으로 검색"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            placeholder="친구의 닉네임을 입력하세요"
            fullWidth
          />
          <p className="add-friend-hint">
            (데모: 실제 검색 기능은 백엔드 연동 시 구현됩니다)
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              닫기
            </Button>
            <Button onClick={() => {
              showToast('친구 요청을 보냈습니다!');
              setShowAddModal(false);
              setSearchNickname('');
            }}>
              요청 보내기
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
        .friends-container {
          padding: 32px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .friends-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .friends-title {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 700;
          color: #3D3024;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .friends-subtitle {
          color: #8B7E6A;
          margin: 0;
        }

        .friends-section {
          margin-bottom: 40px;
        }

        .friends-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #5D4E3C;
          margin: 0 0 16px 0;
        }

        .friends-requests {
          background: #FFF8E5;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .friends-requests__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .friend-request {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
        }

        .friend-request__avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #F5EDE4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .friend-request__info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .friend-request__name {
          font-weight: 600;
          color: #3D3024;
        }

        .friend-request__date {
          font-size: 12px;
          color: #8B7E6A;
        }

        .friend-request__actions {
          display: flex;
          gap: 8px;
        }

        .friends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .friend-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(93, 78, 60, 0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .friend-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(93, 78, 60, 0.12);
        }

        .friend-card__avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F5EDE4 0%, #E8E4DF 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          position: relative;
        }

        .friend-card__online {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          background: #7BC4A8;
          border: 3px solid white;
          border-radius: 50%;
        }

        .friend-card__info {
          flex: 1;
          min-width: 0;
        }

        .friend-card__name {
          display: block;
          font-weight: 600;
          color: #3D3024;
          margin-bottom: 4px;
        }

        .friend-card__bio {
          display: block;
          font-size: 13px;
          color: #8B7E6A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .friend-card__remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border: none;
          background: #F5F2ED;
          border-radius: 50%;
          color: #8B7E6A;
          font-size: 12px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .friend-card:hover .friend-card__remove {
          opacity: 1;
        }

        .friend-card__remove:hover {
          background: #FFE5E5;
          color: #D64545;
        }

        .friends-empty {
          text-align: center;
          padding: 80px 20px;
          color: #8B7E6A;
        }

        .friends-empty__icon {
          font-size: 64px;
          display: block;
          margin-bottom: 16px;
        }

        .friends-empty h3 {
          color: #5D4E3C;
          margin: 0 0 8px 0;
        }

        .friends-empty p {
          margin: 0 0 24px 0;
        }

        .add-friend-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .add-friend-hint {
          font-size: 12px;
          color: #A89880;
          margin: 0;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .friends-container {
            padding: 16px;
          }

          .friends-header {
            flex-direction: column;
            gap: 16px;
          }

          .friends-title {
            font-size: 24px;
          }

          .friends-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
