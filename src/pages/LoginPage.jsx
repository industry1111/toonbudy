import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { validateEmail } from '../repo/userRepo';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // 실시간 이메일 검증
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value).valid) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value).error }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // 실시간 비밀번호 검증
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: '비밀번호는 6자 이상이어야 합니다.' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 최종 검증
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@toonverti.com');
    setPassword('demo1234');
    setIsLoading(true);
    const result = await login('demo@toonverti.com', 'demo1234');
    if (result.success) {
      navigate(from, { replace: true });
    }
    setIsLoading(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 30%, #E8F4F2 70%, #E0F2ED 100%)',
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
    floatingEmoji: (top, left, delay) => ({
      position: 'absolute',
      top,
      left,
      fontSize: '40px',
      opacity: 0.4,
      animation: `float 6s ease-in-out infinite ${delay}`,
      pointerEvents: 'none',
    }),
    card: {
      display: 'flex',
      width: '100%',
      maxWidth: '900px',
      minHeight: '550px',
      background: 'rgba(255, 255, 255, 0.85)',
      borderRadius: '32px',
      boxShadow: '0 24px 80px rgba(93, 78, 60, 0.12)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    },
    brandingSide: {
      flex: 1,
      background: 'linear-gradient(145deg, #B0E0D2 0%, #8FD4C0 50%, #7BC4A8 100%)',
      padding: '48px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
    },
    logoArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '32px',
    },
    logoEmoji: {
      fontSize: '42px',
    },
    logoText: {
      fontFamily: 'var(--font-serif)',
      fontSize: '32px',
      fontWeight: '700',
      color: '#1D4A3A',
    },
    tagline: {
      fontFamily: 'var(--font-serif)',
      fontSize: '28px',
      fontWeight: '700',
      color: '#1D4A3A',
      lineHeight: '1.4',
      marginBottom: '32px',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.4)',
      borderRadius: '12px',
      marginBottom: '12px',
    },
    featureIcon: {
      fontSize: '24px',
    },
    featureText: {
      fontSize: '14px',
      color: '#1D4A3A',
      fontWeight: '500',
    },
    formSide: {
      flex: 1,
      padding: '48px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    formTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#3D3024',
      marginBottom: '8px',
    },
    formSubtitle: {
      fontSize: '14px',
      color: '#8B7E6A',
      marginBottom: '32px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    errorBox: {
      padding: '12px 16px',
      background: '#FFE5E5',
      borderRadius: '12px',
      color: '#D64545',
      fontSize: '14px',
    },
    fieldError: {
      color: '#D64545',
      fontSize: '12px',
      marginTop: '4px',
    },
    inputWrapper: {
      position: 'relative',
    },
    rememberRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#6B5A42',
    },
    forgotLink: {
      color: '#7BC4A8',
      fontSize: '14px',
      textDecoration: 'none',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      margin: '24px 0',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#EDE4D8',
    },
    dividerText: {
      fontSize: '13px',
      color: '#A89880',
    },
    demoBtn: {
      width: '100%',
      padding: '14px',
      background: '#F5EDE4',
      border: 'none',
      borderRadius: '14px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#5D4E3C',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
    },
    signupLink: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: '#8B7E6A',
    },
    link: {
      color: '#7BC4A8',
      fontWeight: '600',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgPattern} />
      <span style={styles.floatingEmoji('10%', '10%', '0s')}>📔</span>
      <span style={styles.floatingEmoji('20%', '80%', '1s')}>✨</span>
      <span style={styles.floatingEmoji('70%', '5%', '2s')}>🎨</span>
      <span style={styles.floatingEmoji('80%', '85%', '0.5s')}>💕</span>

      <div className="login-card" style={styles.card}>
        <div className="login-branding" style={styles.brandingSide}>
          <div style={styles.logoArea}>
            <span style={styles.logoEmoji}>📔</span>
            <span style={styles.logoText}>툰버티</span>
          </div>

          <h2 style={styles.tagline}>
            웹툰 감상을<br />
            다이어리로 기록해요
          </h2>

          <div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🎨</span>
              <span style={styles.featureText}>스티커로 꾸미는 다이어리</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📱</span>
              <span style={styles.featureText}>언제 어디서나 기록</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🔗</span>
              <span style={styles.featureText}>친구와 공유하기</span>
            </div>
          </div>
        </div>

        <div className="login-form" style={styles.formSide}>
          <h1 style={styles.formTitle}>다시 만나서 반가워요!</h1>
          <p style={styles.formSubtitle}>계정에 로그인하세요</p>

          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.inputWrapper}>
              <Input
                label="이메일"
                icon="✉️"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={handleEmailChange}
                fullWidth
                required
              />
              {fieldErrors.email && <div style={styles.fieldError}>{fieldErrors.email}</div>}
            </div>

            <div style={styles.inputWrapper}>
              <Input
                label="비밀번호"
                icon="🔒"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={handlePasswordChange}
                fullWidth
                required
              />
              {fieldErrors.password && <div style={styles.fieldError}>{fieldErrors.password}</div>}
            </div>

            <div style={styles.rememberRow}>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>로그인 상태 유지</span>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading || !!fieldErrors.email || !!fieldErrors.password}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>또는</span>
            <span style={styles.dividerLine} />
          </div>

          <button style={styles.demoBtn} onClick={handleDemoLogin} disabled={isLoading}>
            <span>👋</span>
            데모 계정으로 체험하기
          </button>

          <p style={styles.signupLink}>
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" style={styles.link}>
              회원가입
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-card {
          display: flex;
        }
        .login-branding {
          flex: 1;
        }
        .login-form {
          flex: 1;
        }
        @media (max-width: 640px) {
          .login-card {
            flex-direction: column !important;
            max-width: 100% !important;
            border-radius: 24px !important;
            min-height: auto !important;
          }
          .login-branding {
            padding: 32px 24px !important;
            min-height: auto;
          }
          .login-form {
            padding: 32px 24px !important;
          }
        }
        @media (max-width: 1024px) and (min-width: 641px) {
          .login-card {
            max-width: 700px !important;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
