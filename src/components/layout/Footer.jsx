import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer" style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <span style={styles.logoEmoji}>📔</span>
            <span style={styles.logoText}>툰버티</span>
          </div>
          <p style={styles.tagline}>
            웹툰 감상을 스티커로 기록하는 나만의 다이어리
          </p>
        </div>

        <div className="footer-links" style={styles.linksSection}>
          <div style={styles.linkGroup}>
            <span style={styles.linkGroupTitle}>서비스</span>
            <Link to="/" className="footer-link" style={styles.link}>내 다이어리</Link>
            <Link to="/editor/new" className="footer-link" style={styles.link}>새 다꾸 만들기</Link>
            <Link to="/search" className="footer-link" style={styles.link}>검색</Link>
          </div>

          <div style={styles.linkGroup}>
            <span style={styles.linkGroupTitle}>계정</span>
            <Link to="/mypage" className="footer-link" style={styles.link}>마이페이지</Link>
            <Link to="/trash" className="footer-link" style={styles.link}>휴지통</Link>
          </div>

          <div style={styles.linkGroup}>
            <span style={styles.linkGroupTitle}>정보</span>
            <a href="#" className="footer-link" style={styles.link}>이용약관</a>
            <a href="#" className="footer-link" style={styles.link}>개인정보처리방침</a>
            <a href="#" className="footer-link" style={styles.link}>문의하기</a>
          </div>
        </div>

        <div className="footer-bottom" style={styles.bottom}>
          <span style={styles.copyright}>
            &copy; {currentYear} 툰버티 (Toonverti). All rights reserved.
          </span>
          <div style={styles.socialLinks}>
            <a href="#" className="footer-social" style={styles.socialLink}>📧</a>
            <a href="#" className="footer-social" style={styles.socialLink}>💬</a>
          </div>
        </div>
      </div>

      <style>{`
        .app-footer {
          margin-left: 240px;
        }
        .footer-link:hover {
          color: #7BC4A8 !important;
        }
        .footer-social:hover {
          background: #E8F5F1 !important;
          transform: translateY(-2px);
        }
        @media (max-width: 1024px) {
          .app-footer {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 640px) {
          .app-footer {
            padding: 24px 20px !important;
          }
          .footer-links {
            gap: 24px !important;
            flex-wrap: wrap;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            align-items: center !important;
          }
        }
      `}</style>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(180, 160, 140, 0.1)',
    padding: '32px 48px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '32px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoEmoji: {
    fontSize: '24px',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#5D4E3C',
  },
  tagline: {
    fontSize: '13px',
    color: '#8B7E6A',
    maxWidth: '200px',
    lineHeight: '1.5',
  },
  linksSection: {
    display: 'flex',
    gap: '48px',
  },
  linkGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  linkGroupTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: '4px',
  },
  link: {
    fontSize: '13px',
    color: '#8B7E6A',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  bottom: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    marginTop: '24px',
    borderTop: '1px solid rgba(180, 160, 140, 0.1)',
  },
  copyright: {
    fontSize: '12px',
    color: '#A89880',
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
  },
  socialLink: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#F5EDE4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
};
