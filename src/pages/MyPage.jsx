import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiary } from '../contexts/DiaryContext';
import { Button, Card, Modal, Toast } from '../components/ui';

const avatars = ['🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐧', '🐶', '🐹'];

export default function MyPage() {
  const { user, updateUser, logout } = useAuth();
  const { diaries, refreshDiaries } = useDiary();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🐱');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    refreshDiaries();
  }, [refreshDiaries]);

  const showToastMsg = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  const handleSave = async () => {
    if (nickname.length < 2 || nickname.length > 20) {
      showToastMsg('닉네임은 2~20자여야 합니다.');
      return;
    }
    await updateUser({ nickname, bio, avatar: selectedAvatar });
    setIsEditing(false);
    showToastMsg('프로필이 업데이트되었습니다!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalDiaries = diaries.length;
  const thisMonth = diaries.filter(d => {
    const now = new Date();
    const date = new Date(d.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const totalStickers = diaries.reduce((sum, d) => sum + (d.stickers?.length || 0), 0);
  const totalLikes = diaries.reduce((sum, d) => sum + (d.likes || 0), 0);
  const publicCount = diaries.filter(d => d.isPublic).length;
  const avgStickers = totalDiaries > 0 ? Math.round(totalStickers / totalDiaries * 10) / 10 : 0;

  const getConsecutiveDays = () => {
    if (diaries.length === 0) return 0;
    const dates = [...new Set(diaries.map(d => d.date))].sort().reverse();
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const curr = new Date(dates[i - 1]);
      const prev = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  const getDaysSinceJoin = () => {
    if (!user?.createdAt) return 0;
    const now = new Date();
    const joined = new Date(user.createdAt);
    return Math.floor((now - joined) / (1000 * 60 * 60 * 24));
  };

  const stats = [
    { label: '전체 다이어리', value: totalDiaries, icon: '📔' },
    { label: '이번 달', value: thisMonth, icon: '📅' },
    { label: '연속 기록', value: `${getConsecutiveDays()}일`, icon: '🔥' },
    { label: '스티커 수', value: totalStickers, icon: '✨' },
    { label: '받은 좋아요', value: totalLikes, icon: '❤️' },
    { label: '공유 중', value: publicCount, icon: '🔗' },
    { label: '평균 스티커', value: avgStickers, icon: '📊' },
    { label: '가입 일수', value: `${getDaysSinceJoin()}일`, icon: '🎂' },
  ];

  return (
    <div className="mypage-container" style={styles.container}>
      {/* Profile Card */}
      <Card className="mypage-profile" style={{ marginBottom: '24px' }}>
        <div className="mypage-profile-inner" style={styles.profileInner}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {isEditing ? selectedAvatar : (user?.avatar || '🐱')}
            </div>
            {!isEditing && (
              <button className="btn btn--ghost btn--sm" onClick={() => setIsEditing(true)}>
                편집
              </button>
            )}
          </div>

          {isEditing ? (
            <div style={{ flex: 1 }}>
              <div style={styles.avatarGrid}>
                {avatars.map(a => (
                  <button
                    key={a}
                    className="mypage-avatar-option"
                    style={{
                      ...styles.avatarOption,
                      background: selectedAvatar === a ? 'linear-gradient(135deg, #B0E0D2, #7BC4A8)' : '#F5EDE4',
                      border: selectedAvatar === a ? '3px solid #7BC4A8' : '3px solid transparent',
                    }}
                    onClick={() => setSelectedAvatar(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="input-wrapper" style={{ marginBottom: '12px' }}>
                <input
                  className="input-field"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 (2~20자)"
                  maxLength={20}
                />
              </div>
              <div className="input-wrapper" style={{ marginBottom: '16px' }}>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="한 줄 소개"
                  maxLength={100}
                  style={{ resize: 'none', minHeight: '60px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>취소</Button>
                <Button onClick={handleSave}>저장</Button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, paddingTop: '8px' }}>
              <h2 style={styles.profileName}>{user?.nickname || '사용자'}</h2>
              <p style={styles.profileBio}>{user?.bio || '한 줄 소개를 입력해주세요'}</p>
              <p style={{ fontSize: '13px', color: '#A89880' }}>{user?.email}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="mypage-stats" style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <Card key={i} className="mypage-stat-card" style={styles.statCard}>
            <span style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</span>
            <span style={styles.statValue}>{stat.value}</span>
            <span style={{ fontSize: '12px', color: '#8B7E6A' }}>{stat.label}</span>
          </Card>
        ))}
      </div>

      {/* Settings */}
      <Card className="mypage-settings" padding={0} style={{ overflow: 'hidden' }}>
        <h3 style={styles.settingsTitle}>설정</h3>
        <div>
          <div className="mypage-setting-item" style={styles.settingItem} onClick={() => navigate('/trash')}>
            <span style={styles.settingIcon}>🗑️</span>
            <span style={{ flex: 1, fontSize: '15px', color: '#5D4E3C' }}>휴지통</span>
            <span style={{ fontSize: '14px', color: '#A89880' }}>→</span>
          </div>
          <div className="mypage-setting-item" style={styles.settingItem} onClick={() => navigate('/onboarding')}>
            <span style={styles.settingIcon}>💡</span>
            <span style={{ flex: 1, fontSize: '15px', color: '#5D4E3C' }}>온보딩 다시 보기</span>
            <span style={{ fontSize: '14px', color: '#A89880' }}>→</span>
          </div>
          <div
            className="mypage-setting-item"
            style={{ ...styles.settingItem, borderBottom: 'none' }}
            onClick={() => setShowLogoutModal(true)}
          >
            <span style={styles.settingIcon}>🚪</span>
            <span style={{ flex: 1, fontSize: '15px', color: '#D64545' }}>로그아웃</span>
            <span style={{ fontSize: '14px', color: '#A89880' }}>→</span>
          </div>
        </div>
      </Card>

      {/* Logout Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="로그아웃">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
          <p style={{ fontSize: '15px', color: '#5D4E3C', marginBottom: '24px' }}>
            로그아웃 하시겠습니까?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>취소</Button>
            <Button variant="danger" onClick={handleLogout}>로그아웃</Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />

      <style>{`
        .mypage-container {
          padding: 32px 48px 60px;
          max-width: 900px;
          margin: 0 auto;
        }
        .mypage-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(93, 78, 60, 0.1);
        }
        .mypage-setting-item:hover {
          background: #FDFBF8;
        }
        .mypage-avatar-option:hover {
          transform: scale(1.1);
        }
        @media (max-width: 640px) {
          .mypage-container {
            padding: 16px 16px 40px !important;
          }
          .mypage-profile-inner {
            flex-direction: column !important;
            text-align: center;
          }
          .mypage-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 1024px) {
          .mypage-container {
            padding: 24px 24px 48px;
          }
          .mypage-stats {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {},
  profileInner: {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #FFDAB9 0%, #FFE4C4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '56px',
    boxShadow: '0 8px 24px rgba(255, 218, 185, 0.4)',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  },
  avatarOption: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  profileName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '700',
    color: '#4A3D2E',
    marginBottom: '8px',
  },
  profileBio: {
    fontSize: '15px',
    color: '#8B7E6A',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 12px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#4A3D2E',
    marginBottom: '4px',
  },
  settingsTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '600',
    color: '#4A3D2E',
    padding: '20px 24px 12px',
    margin: 0,
  },
  settingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(180, 160, 140, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '56px',
  },
  settingIcon: {
    fontSize: '20px',
    width: '28px',
    textAlign: 'center',
  },
};
