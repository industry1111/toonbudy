import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { validateEmail, validatePassword, validateNickname } from '../repo/userRepo';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 실시간 닉네임 검증
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    if (value) {
      const validation = validateNickname(value);
      setFieldErrors(prev => ({ ...prev, nickname: validation.valid ? '' : validation.error }));
    } else {
      setFieldErrors(prev => ({ ...prev, nickname: '' }));
    }
  };

  // 실시간 이메일 검증
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      const validation = validateEmail(value);
      setFieldErrors(prev => ({ ...prev, email: validation.valid ? '' : validation.error }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // 실시간 비밀번호 검증
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      const validation = validatePassword(value);
      setFieldErrors(prev => ({ ...prev, password: validation.valid ? '' : validation.error }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    // 비밀번호 확인 재검증
    if (confirmPassword && value !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
    } else if (confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  // 실시간 비밀번호 확인 검증
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  // 폼 유효성 확인
  const isFormValid = () => {
    return (
      nickname &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      !Object.values(fieldErrors).some(e => e) &&
      agreedToTerms
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 최종 검증
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.valid) {
      setError(nicknameValidation.error);
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreedToTerms) {
      setError('이용약관에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password, nickname);
      if (result.success) {
        navigate('/onboarding');
      } else {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
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
    card: {
      width: '100%',
      maxWidth: '480px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '32px',
      boxShadow: '0 24px 80px rgba(93, 78, 60, 0.12)',
      backdropFilter: 'blur(20px)',
      padding: '48px',
      position: 'relative',
      zIndex: 10,
    },
    logoArea: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '32px',
    },
    logoEmoji: {
      fontSize: '36px',
    },
    logoText: {
      fontFamily: 'var(--font-serif)',
      fontSize: '28px',
      fontWeight: '700',
      color: '#5D4E3C',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#3D3024',
      textAlign: 'center',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#8B7E6A',
      textAlign: 'center',
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
    passwordStrength: {
      marginTop: '8px',
      fontSize: '12px',
    },
    strengthBar: {
      height: '4px',
      borderRadius: '2px',
      background: '#EDE4D8',
      marginTop: '4px',
      overflow: 'hidden',
    },
    strengthFill: (strength) => ({
      height: '100%',
      width: `${strength}%`,
      background: strength < 40 ? '#D64545' : strength < 70 ? '#F5A623' : '#7BC4A8',
      transition: 'all 0.3s ease',
    }),
    termsCheckbox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginTop: '8px',
    },
    checkbox: {
      marginTop: '2px',
      accentColor: '#7BC4A8',
    },
    termsLabel: {
      fontSize: '12px',
      color: '#6B5A42',
      lineHeight: '1.6',
    },
    termsLink: {
      color: '#7BC4A8',
      textDecoration: 'none',
    },
    loginLink: {
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

      <div className="signup-card" style={styles.card}>
        <div style={styles.logoArea}>
          <span style={styles.logoEmoji}>📔</span>
          <span style={styles.logoText}>툰버티</span>
        </div>

        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>툰버티와 함께 웹툰 다이어리를 시작해요!</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.inputWrapper}>
            <Input
              label="닉네임"
              icon="😊"
              type="text"
              placeholder="다이어리에 표시될 이름 (2-20자)"
              value={nickname}
              onChange={handleNicknameChange}
              fullWidth
              required
            />
            {fieldErrors.nickname && <div style={styles.fieldError}>{fieldErrors.nickname}</div>}
          </div>

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
              placeholder="영문, 숫자 포함 6자 이상"
              value={password}
              onChange={handlePasswordChange}
              fullWidth
              required
            />
            {fieldErrors.password && <div style={styles.fieldError}>{fieldErrors.password}</div>}
            {password && !fieldErrors.password && (
              <div style={styles.passwordStrength}>
                <span style={{ color: '#8B7E6A' }}>비밀번호 강도</span>
                <div style={styles.strengthBar}>
                  <div style={styles.strengthFill(
                    password.length >= 8 && /[!@#$%^&*]/.test(password) ? 100 :
                    password.length >= 8 ? 70 :
                    password.length >= 6 ? 40 : 20
                  )} />
                </div>
              </div>
            )}
          </div>

          <div style={styles.inputWrapper}>
            <Input
              label="비밀번호 확인"
              icon="🔐"
              type="password"
              placeholder="비밀번호 다시 입력"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              fullWidth
              required
            />
            {fieldErrors.confirmPassword && <div style={styles.fieldError}>{fieldErrors.confirmPassword}</div>}
            {confirmPassword && !fieldErrors.confirmPassword && password === confirmPassword && (
              <div style={{ color: '#7BC4A8', fontSize: '12px', marginTop: '4px' }}>
                비밀번호가 일치합니다
              </div>
            )}
          </div>

          <div style={styles.termsCheckbox}>
            <input
              type="checkbox"
              id="terms"
              style={styles.checkbox}
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label htmlFor="terms" style={styles.termsLabel}>
              <a href="#" style={styles.termsLink}>이용약관</a> 및{' '}
              <a href="#" style={styles.termsLink}>개인정보처리방침</a>에 동의합니다
            </label>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? '가입 중...' : '가입하기'}
          </Button>
        </form>

        <p style={styles.loginLink}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={styles.link}>
            로그인
          </Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .signup-card {
            padding: 32px 24px !important;
            border-radius: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
