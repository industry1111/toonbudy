import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditorPage = location.pathname.startsWith('/editor');

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return '내 다이어리';
    if (path.startsWith('/editor')) return '다꾸 편집';
    if (path.startsWith('/view')) return '다이어리 보기';
    if (path === '/search') return '검색';
    if (path === '/trash') return '휴지통';
    if (path === '/mypage') return '마이페이지';
    return '';
  };

  return (
    <header className="app-header" style={styles.header}>
      <div style={styles.left}>
        {/* Hamburger - mobile/tablet only */}
        {!isEditorPage && (
          <button
            className="hamburger-btn"
            style={styles.hamburger}
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
          </button>
        )}

        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>📔</span>
          <span className="logo-text" style={styles.logoText}>툰버티</span>
        </Link>

        {!isEditorPage && (
          <div className="breadcrumb" style={styles.breadcrumb}>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>{getPageTitle()}</span>
          </div>
        )}

        {isEditorPage && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => navigate(-1)}
          >
            ← 뒤로
          </button>
        )}
      </div>

      <div style={styles.right}>
        <button
          className="header-icon-btn"
          style={styles.iconBtn}
          onClick={() => navigate('/search')}
          aria-label="Search"
        >
          🔍
        </button>

        <button
          className="header-profile-btn"
          style={styles.profileBtn}
          onClick={() => navigate('/mypage')}
        >
          <div style={styles.avatar}>{user?.avatar || '🐱'}</div>
          <span className="profile-name" style={styles.userName}>{user?.nickname || '사용자'}</span>
        </button>
      </div>

      <style>{`
        .hamburger-btn {
          display: none;
        }
        @media (max-width: 1024px) {
          .hamburger-btn {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .logo-text {
            display: none;
          }
          .breadcrumb {
            display: none !important;
          }
          .profile-name {
            display: none;
          }
          .app-header {
            padding: 10px 16px !important;
            height: 60px !important;
          }
        }
        .header-icon-btn:hover,
        .header-profile-btn:hover {
          background: #F5EDE4 !important;
        }
      `}</style>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    position: 'sticky',
    top: 0,
    background: 'rgba(253, 248, 243, 0.95)',
    backdropFilter: 'blur(20px)',
    zIndex: 100,
    borderBottom: '1px solid rgba(180, 160, 140, 0.1)',
    height: '70px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  hamburger: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    width: '40px',
    height: '40px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '8px',
  },
  hamburgerLine: {
    display: 'block',
    width: '20px',
    height: '2px',
    background: '#5D4E3C',
    borderRadius: '1px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '700',
    color: '#5D4E3C',
    letterSpacing: '-1px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#8B7E6A',
  },
  breadcrumbSeparator: {
    color: '#D4C4B0',
  },
  breadcrumbCurrent: {
    color: '#5D4E3C',
    fontWeight: '500',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px 6px 6px',
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #FFDAB9 0%, #FFE4C4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  userName: {
    fontSize: '14px',
    color: '#5D4E3C',
    fontWeight: '500',
  },
};
