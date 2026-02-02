import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="notfound-container" style={styles.container}>
      <div style={styles.bgPattern} />
      <span className="notfound-float" style={{ top: '10%', left: '15%', animationDelay: '0s' }}>📔</span>
      <span className="notfound-float" style={{ top: '20%', left: '80%', animationDelay: '1s' }}>✨</span>
      <span className="notfound-float" style={{ top: '70%', left: '10%', animationDelay: '2s' }}>🎨</span>
      <span className="notfound-float" style={{ top: '75%', left: '85%', animationDelay: '0.5s' }}>💕</span>

      <div className="notfound-card" style={styles.card}>
        <span style={styles.errorCode}>404</span>
        <span style={{ fontSize: '64px', marginBottom: '24px', display: 'block' }}>🔍</span>
        <h1 style={styles.title}>페이지를 찾을 수 없어요</h1>
        <p style={styles.description}>
          찾으시는 페이지가 삭제되었거나,
          <br />
          주소가 변경되었을 수 있어요.
        </p>

        <div style={styles.buttonGroup}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button size="lg" icon="🏠">
              홈으로 가기
            </Button>
          </Link>
          <button
            className="btn btn--secondary btn--md"
            onClick={() => window.history.back()}
          >
            ← 이전 페이지
          </button>
        </div>

        <div style={styles.suggestions}>
          <div style={styles.suggestionsTitle}>이런 페이지는 어떠세요?</div>
          <div style={styles.suggestionLinks}>
            <Link to="/" className="notfound-suggestion-link" style={styles.suggestionLink}>
              📔 내 다이어리
            </Link>
            <Link to="/editor/new" className="notfound-suggestion-link" style={styles.suggestionLink}>
              ✨ 새 다꾸
            </Link>
            <Link to="/search" className="notfound-suggestion-link" style={styles.suggestionLink}>
              🔍 검색
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .notfound-float {
          position: absolute;
          font-size: 40px;
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
        }
        .notfound-suggestion-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(123, 196, 168, 0.2) !important;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @media (max-width: 640px) {
          .notfound-card {
            padding: 40px 24px !important;
            border-radius: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 50%, #E8F4F2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 20px 20px, rgba(180, 160, 140, 0.06) 2px, transparent 2px)`,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '32px',
    boxShadow: '0 24px 80px rgba(93, 78, 60, 0.12)',
    backdropFilter: 'blur(20px)',
    padding: '60px 48px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
    maxWidth: '500px',
    width: '100%',
  },
  errorCode: {
    fontFamily: 'var(--font-serif)',
    fontSize: '120px',
    fontWeight: '700',
    color: '#B0E0D2',
    lineHeight: 1,
    margin: '0 0 16px 0',
    textShadow: '4px 4px 0 #E8F5F1',
    display: 'block',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '700',
    color: '#4A3D2E',
    margin: '0 0 12px 0',
  },
  description: {
    fontSize: '15px',
    color: '#8B7E6A',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  suggestions: {
    marginTop: '40px',
    padding: '24px',
    background: '#FDFBF8',
    borderRadius: '16px',
  },
  suggestionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: '16px',
  },
  suggestionLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  },
  suggestionLink: {
    padding: '8px 16px',
    background: 'white',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#7BC4A8',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(93, 78, 60, 0.06)',
    transition: 'all 0.2s ease',
  },
};
