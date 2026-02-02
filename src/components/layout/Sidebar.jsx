import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDiary } from '../../contexts/DiaryContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { diaries, createDiary } = useDiary();
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [navigate]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleCreateNew = () => {
    const newDiary = createDiary();
    if (newDiary) {
      onClose?.();
      navigate(`/editor/${newDiary.id}`);
    }
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const navItems = [
    { path: '/', icon: '📚', label: '라이브러리', exact: true },
    { path: '/friends', icon: '👥', label: '친구' },
    { path: '/diary', icon: '📔', label: '다이어리' },
    { path: '/search', icon: '🔍', label: '검색' },
    { path: '/trash', icon: '🗑️', label: '휴지통' },
    { path: '/mypage', icon: '👤', label: '마이페이지' },
  ];

  const recentDiaries = diaries.slice(0, 3);

  const sidebarContent = (
    <aside className="sidebar-inner" style={styles.sidebar}>
      {/* Close button (mobile only) */}
      <button
        className="sidebar-close-btn"
        style={styles.closeBtn}
        onClick={onClose}
        aria-label="Close menu"
      >
        ✕
      </button>

      {/* Create Button */}
      <button
        className="sidebar-create-btn"
        style={styles.createBtn}
        onClick={handleCreateNew}
      >
        <span>✨</span>
        새 다꾸 만들기
      </button>

      {/* Navigation */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>메뉴</div>
        <nav style={styles.navList}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={handleNavClick}
              className="sidebar-nav-item"
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Recent Diaries */}
      {recentDiaries.length > 0 && (
        <div style={styles.recentSection}>
          <div style={styles.sectionTitle}>최근 다이어리</div>
          {recentDiaries.map((diary) => (
            <div
              key={diary.id}
              className="sidebar-recent-item"
              style={styles.recentItem}
              onClick={() => {
                onClose?.();
                navigate(`/view/${diary.id}`);
              }}
            >
              <div style={styles.recentPreview}>
                {diary.stickers?.[0]?.emoji || '📔'}
              </div>
              <div style={styles.recentInfo}>
                <div style={styles.recentTitle}>{diary.title}</div>
                <div style={styles.recentDate}>
                  {new Date(diary.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Card */}
      <div style={styles.userCard}>
        <div style={styles.userAvatar}>{user?.avatar || '🐱'}</div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.nickname || '사용자'}</div>
          <div style={styles.userStats}>다이어리 {diaries.length}개</div>
        </div>
      </div>

      <style>{`
        .sidebar-close-btn {
          display: none;
        }
        .sidebar-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(123, 196, 168, 0.4);
        }
        .sidebar-nav-item:hover {
          background: rgba(245, 237, 228, 0.5);
        }
        .sidebar-recent-item:hover {
          background: rgba(245, 237, 228, 0.5);
        }
        @media (max-width: 1024px) {
          .sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </aside>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="sidebar-desktop" style={styles.desktopWrapper}>
        {sidebarContent}
      </div>

      {/* Mobile/Tablet: drawer overlay */}
      {isOpen && (
        <div className="sidebar-mobile">
          <div className="sidebar-overlay" onClick={onClose} />
          <div className="sidebar-drawer" style={styles.drawerWrapper}>
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        .sidebar-desktop {
          display: block;
        }
        .sidebar-mobile {
          display: none;
        }
        @media (max-width: 1024px) {
          .sidebar-desktop {
            display: none !important;
          }
          .sidebar-mobile {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  desktopWrapper: {
    width: '240px',
    position: 'fixed',
    top: '70px',
    left: 0,
    bottom: 0,
    zIndex: 50,
  },
  drawerWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    maxWidth: '85vw',
    zIndex: 91,
    background: 'white',
    boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
  },
  sidebar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(180, 160, 140, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    overflowY: 'auto',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: '36px',
    height: '36px',
    border: 'none',
    background: '#F5EDE4',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#8A7B6A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#A89880',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0 12px',
    marginBottom: '8px',
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#2D5A4A',
    fontWeight: '600',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(123, 196, 168, 0.3)',
    transition: 'all 0.2s ease',
    minHeight: '48px',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    color: '#5D4E3C',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minHeight: '48px',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(176, 224, 210, 0.3) 0%, rgba(123, 196, 168, 0.2) 100%)',
    color: '#2D5A4A',
  },
  navIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
  recentSection: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(180, 160, 140, 0.1)',
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '48px',
  },
  recentPreview: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#F5EDE4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  recentInfo: {
    flex: 1,
    minWidth: 0,
  },
  recentTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#5D4E3C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentDate: {
    fontSize: '11px',
    color: '#A89880',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '14px',
    marginTop: '16px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FFDAB9 0%, #FFE4C4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A3D2E',
  },
  userStats: {
    fontSize: '12px',
    color: '#8B7E6A',
  },
};
