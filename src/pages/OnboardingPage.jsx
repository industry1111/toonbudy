import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';

const avatars = ['🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐧', '🐶', '🐹'];

const steps = [
  {
    title: '환영해요! 👋',
    description: '툰버티에서 웹툰 감상을 기록하고\n나만의 다이어리를 만들어보세요.',
    illustration: '📔',
  },
  {
    title: '아바타 선택',
    description: '나를 표현할 아바타를 선택해주세요.',
    illustration: null,
  },
  {
    title: '다이어리 꾸미기 🎨',
    description: '스티커와 텍스트로 다이어리를 꾸며보세요.\n드래그로 위치를 조정하고 크기도 변경할 수 있어요.',
    illustration: '🎨',
    tip: '단축키: Ctrl+S (저장), Delete (삭제), 방향키 (이동)',
  },
  {
    title: '공유하기 🔗',
    description: '완성한 다이어리를 친구들과 공유해보세요.\n공개/비공개 설정도 가능해요.',
    illustration: '🔗',
    tip: '공유 링크를 복사해서 SNS에 올려보세요!',
  },
  {
    title: '준비 완료! 🎉',
    description: '이제 다이어리를 꾸미러 가볼까요?',
    illustration: '🚀',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🐱');
  const [isAnimating, setIsAnimating] = useState(false);

  // 이미 온보딩 완료된 경우 홈으로
  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleNext = async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (step === 1) {
      // 아바타 저장
      await updateUser({ avatar: selectedAvatar });
    }

    if (step === steps.length - 1) {
      await completeOnboarding();
      navigate('/');
    } else {
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrev = () => {
    if (step > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigate('/');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDF8F3 0%, #E8F4F2 50%, #E0F2ED 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    },
    card: {
      width: '100%',
      maxWidth: '500px',
      background: 'white',
      borderRadius: '32px',
      boxShadow: '0 24px 80px rgba(93, 78, 60, 0.12)',
      padding: '48px',
      textAlign: 'center',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '40px',
    },
    dot: (active) => ({
      width: active ? '24px' : '8px',
      height: '8px',
      borderRadius: '4px',
      background: active
        ? 'linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%)'
        : '#E8E4DF',
      transition: 'all 0.3s ease',
    }),
    illustration: {
      fontSize: '80px',
      marginBottom: '24px',
    },
    title: {
      fontFamily: 'var(--font-serif)',
      fontSize: '28px',
      fontWeight: '700',
      color: '#3D3024',
      marginBottom: '12px',
    },
    description: {
      fontSize: '16px',
      color: '#8B7E6A',
      lineHeight: '1.6',
      whiteSpace: 'pre-line',
      marginBottom: '40px',
    },
    avatarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '40px',
    },
    avatarItem: (selected) => ({
      width: '70px',
      height: '70px',
      borderRadius: '20px',
      background: selected
        ? 'linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%)'
        : '#F5EDE4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      cursor: 'pointer',
      border: selected ? '3px solid #7BC4A8' : '3px solid transparent',
      transition: 'all 0.2s ease',
      margin: '0 auto',
    }),
    selectedPreview: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '32px',
    },
    previewAvatar: {
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
    previewName: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#3D3024',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
    },
    skipBtn: {
      padding: '14px 28px',
      background: 'transparent',
      border: '2px solid #E8E4DF',
      borderRadius: '14px',
      cursor: 'pointer',
      fontSize: '15px',
      color: '#8B7E6A',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    tipBox: {
      background: '#FFF9F0',
      border: '1px solid #FFE4C4',
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      textAlign: 'left',
    },
    tipIcon: {
      fontSize: '20px',
      flexShrink: 0,
    },
    tipText: {
      fontSize: '13px',
      color: '#6B5A42',
      lineHeight: '1.5',
    },
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '32px',
      textAlign: 'left',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 18px',
      background: '#F5F8F7',
      borderRadius: '14px',
    },
    featureIcon: {
      fontSize: '28px',
    },
    featureText: {
      flex: 1,
    },
    featureTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#3D3024',
      marginBottom: '2px',
    },
    featureDesc: {
      fontSize: '13px',
      color: '#8B7E6A',
    },
    skipLink: {
      display: 'block',
      marginTop: '20px',
      fontSize: '13px',
      color: '#A89880',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    progressBar: {
      height: '4px',
      background: '#E8E4DF',
      borderRadius: '2px',
      marginBottom: '40px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%)',
      borderRadius: '2px',
      transition: 'width 0.3s ease',
    },
    cardContent: {
      opacity: isAnimating ? 0 : 1,
      transform: isAnimating ? 'translateY(10px)' : 'translateY(0)',
      transition: 'all 0.2s ease',
    },
  };

  const currentStep = steps[step];

  return (
    <div style={styles.container}>
      <div className="onboarding-card" style={styles.card}>
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {steps.map((_, idx) => (
            <div key={idx} style={styles.dot(idx === step)} />
          ))}
        </div>

        <div style={styles.cardContent}>
          {/* Step 0: Welcome */}
          {step === 0 && (
            <>
              <div style={styles.illustration}>{currentStep.illustration}</div>
              <h1 style={styles.title}>{currentStep.title}</h1>
              <p style={styles.description}>{currentStep.description}</p>

              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🎨</span>
                  <div style={styles.featureText}>
                    <div style={styles.featureTitle}>스티커로 꾸미기</div>
                    <div style={styles.featureDesc}>다양한 스티커로 다이어리를 꾸며요</div>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>📱</span>
                  <div style={styles.featureText}>
                    <div style={styles.featureTitle}>언제 어디서나</div>
                    <div style={styles.featureDesc}>모바일에서도 편하게 기록해요</div>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🔗</span>
                  <div style={styles.featureText}>
                    <div style={styles.featureTitle}>친구와 공유</div>
                    <div style={styles.featureDesc}>완성한 다이어리를 공유해요</div>
                  </div>
                </div>
              </div>

              <Button size="lg" onClick={handleNext}>
                시작하기
              </Button>
              <span style={styles.skipLink} onClick={handleSkip}>
                건너뛰기
              </span>
            </>
          )}

          {/* Step 1: Avatar Selection */}
          {step === 1 && (
            <>
              <h1 style={styles.title}>{currentStep.title}</h1>
              <p style={styles.description}>{currentStep.description}</p>

              <div style={styles.avatarGrid}>
                {avatars.map((avatar) => (
                  <button
                    key={avatar}
                    style={styles.avatarItem(selectedAvatar === avatar)}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>

              <div style={styles.buttonGroup}>
                <button style={styles.skipBtn} onClick={handlePrev}>
                  이전
                </button>
                <Button size="lg" onClick={handleNext}>
                  다음
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Decorating Tutorial */}
          {step === 2 && (
            <>
              <div style={styles.illustration}>{currentStep.illustration}</div>
              <h1 style={styles.title}>{currentStep.title}</h1>
              <p style={styles.description}>{currentStep.description}</p>

              {currentStep.tip && (
                <div style={styles.tipBox}>
                  <span style={styles.tipIcon}>💡</span>
                  <span style={styles.tipText}>{currentStep.tip}</span>
                </div>
              )}

              <div style={styles.buttonGroup}>
                <button style={styles.skipBtn} onClick={handlePrev}>
                  이전
                </button>
                <Button size="lg" onClick={handleNext}>
                  다음
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Sharing Tutorial */}
          {step === 3 && (
            <>
              <div style={styles.illustration}>{currentStep.illustration}</div>
              <h1 style={styles.title}>{currentStep.title}</h1>
              <p style={styles.description}>{currentStep.description}</p>

              {currentStep.tip && (
                <div style={styles.tipBox}>
                  <span style={styles.tipIcon}>💡</span>
                  <span style={styles.tipText}>{currentStep.tip}</span>
                </div>
              )}

              <div style={styles.buttonGroup}>
                <button style={styles.skipBtn} onClick={handlePrev}>
                  이전
                </button>
                <Button size="lg" onClick={handleNext}>
                  다음
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <>
              <div style={styles.selectedPreview}>
                <div style={styles.previewAvatar}>{selectedAvatar}</div>
                <span style={styles.previewName}>{user?.nickname || '사용자'}님</span>
              </div>

              <h1 style={styles.title}>{currentStep.title}</h1>
              <p style={styles.description}>{currentStep.description}</p>

              <Button size="lg" onClick={handleNext}>
                다이어리 시작하기
              </Button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .onboarding-card {
            padding: 32px 24px !important;
            border-radius: 24px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
