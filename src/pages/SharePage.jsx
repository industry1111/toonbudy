import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diaryRepo } from '../repo';
import { Button, Card, Toast } from '../components/ui';

export default function SharePage() {
  const { id } = useParams();
  const [diary, setDiary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const d = diaryRepo.getPublicById(id);
    setDiary(d);
    setIsLoading(false);
  }, [id]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  const handleLike = () => {
    if (!isLiked && diary) {
      diaryRepo.update(diary.id, { likes: diary.likes + 1 });
      setDiary({ ...diary, likes: diary.likes + 1 });
      setIsLiked(true);
      showToast('좋아요를 눌렀어요!');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었습니다!');
    } catch {
      showToast('링크 복사에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: diary?.title,
          text: '이 다이어리를 확인해보세요!',
          url: window.location.href,
        });
      } catch {
        // 사용자가 취소
      }
    } else {
      handleCopyLink();
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[d.getDay()];
    return { formatted: `${year}. ${month}. ${day}`, weekday };
  };

  const getBackgroundStyle = (bg) => {
    switch (bg) {
      case 'grid':
        return {
          backgroundColor: '#FDF8F3',
          backgroundImage:
            'linear-gradient(#E8E4DF 1px, transparent 1px), linear-gradient(90deg, #E8E4DF 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        };
      case 'dots':
        return {
          backgroundColor: '#FDF8F3',
          backgroundImage: 'radial-gradient(#D4CFC8 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        };
      case 'lines':
        return {
          backgroundColor: '#FDF8F3',
          backgroundImage: 'linear-gradient(transparent 23px, #E8E4DF 24px)',
          backgroundSize: '100% 24px',
        };
      case 'mint':
        return { backgroundColor: '#E8F5F1' };
      case 'peach':
        return { backgroundColor: '#FFF0E5' };
      default:
        return { backgroundColor: '#FDF8F3' };
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FDF8F3 0%, #F5EDE4 50%, #E8F0ED 100%)',
      padding: '40px 20px',
    },
    content: {
      maxWidth: '600px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logo: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '24px',
    },
    logoEmoji: {
      fontSize: '32px',
    },
    logoText: {
      fontFamily: 'var(--font-serif)',
      fontSize: '24px',
      fontWeight: '700',
      color: '#5D4E3C',
    },
    shareLabel: {
      display: 'inline-block',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%)',
      borderRadius: '20px',
      fontSize: '13px',
      color: '#2D5A4A',
      fontWeight: '600',
    },
    canvasContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px',
    },
    canvas: {
      width: '100%',
      maxWidth: '480px',
      aspectRatio: '3/4',
      borderRadius: '20px',
      boxShadow: '0 12px 48px rgba(93, 78, 60, 0.15)',
      position: 'relative',
      overflow: 'hidden',
    },
    canvasHeader: {
      padding: '20px 24px',
      borderBottom: '1px dashed #E0D8CE',
    },
    dateText: {
      fontFamily: 'var(--font-serif)',
      fontSize: '18px',
      color: '#5D4E3C',
      fontWeight: '600',
    },
    dayText: {
      fontSize: '13px',
      color: '#8B7E6A',
      marginLeft: '10px',
    },
    canvasContent: {
      padding: '16px 24px',
    },
    memoText: {
      fontFamily: 'var(--font-handwriting)',
      fontSize: '15px',
      color: '#6B5E4C',
      lineHeight: '1.8',
      whiteSpace: 'pre-wrap',
    },
    sticker: (s) => ({
      position: 'absolute',
      left: `${(s.x / 480) * 100}%`,
      top: `${(s.y / 640) * 100}%`,
      fontSize: s.isText ? '14px' : '28px',
      fontWeight: s.isText ? '700' : '400',
      fontFamily: s.isText ? 'var(--font-handwriting)' : 'inherit',
      color: s.isText ? '#5D4E3C' : 'inherit',
      transform: `rotate(${s.rotation}deg) scale(${s.scale})`,
      userSelect: 'none',
      padding: '6px',
    }),
    infoCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '20px',
      padding: '20px 24px',
      textAlign: 'center',
      marginBottom: '24px',
    },
    title: {
      fontFamily: 'var(--font-serif)',
      fontSize: '18px',
      fontWeight: '600',
      color: '#4A3D2E',
      margin: '0 0 8px 0',
    },
    meta: {
      fontSize: '13px',
      color: '#8B7E6A',
      marginBottom: '16px',
    },
    likeBtn: (liked) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: liked ? '#FFE5E5' : 'white',
      border: 'none',
      borderRadius: '14px',
      cursor: liked ? 'default' : 'pointer',
      fontSize: '15px',
      color: liked ? '#E85A5A' : '#6B5A42',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(93, 78, 60, 0.08)',
      transition: 'all 0.2s ease',
    }),
    ctaCard: {
      textAlign: 'center',
      padding: '32px 24px',
    },
    ctaEmoji: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    ctaTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#4A3D2E',
      marginBottom: '8px',
    },
    ctaText: {
      fontSize: '14px',
      color: '#8B7E6A',
      marginBottom: '20px',
    },
    notFound: {
      textAlign: 'center',
      padding: '80px 20px',
    },
    notFoundEmoji: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    notFoundTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#5D4E3C',
      marginBottom: '8px',
    },
    notFoundText: {
      fontSize: '14px',
      color: '#8B7E6A',
      marginBottom: '24px',
    },
    toast: {
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(61, 48, 36, 0.95)',
      color: 'white',
      padding: '14px 28px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000,
      animation: 'fadeInUp 0.3s ease-out',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    },
    actionRow: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '16px',
    },
    shareBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 18px',
      background: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#5D4E3C',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(93, 78, 60, 0.08)',
      transition: 'all 0.2s ease',
    },
  };

  if (isLoading) {
    return (
      <div className="share-container" style={styles.container}>
        <div style={styles.content}>
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(123,196,168,0.2)', borderTopColor: '#7BC4A8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#8B7E6A' }}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <Card style={styles.notFound}>
            <div style={styles.notFoundEmoji}>🔒</div>
            <h2 style={styles.notFoundTitle}>다이어리를 찾을 수 없어요</h2>
            <p style={styles.notFoundText}>
              이 다이어리가 비공개로 설정되었거나 삭제되었을 수 있습니다.
            </p>
            <Link to="/login">
              <Button>툰버티 시작하기</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const { formatted, weekday } = formatDate(diary.date);

  return (
    <div className="share-container" style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoEmoji}>📔</span>
            <span style={styles.logoText}>툰버티</span>
          </Link>
          <div>
            <span style={styles.shareLabel}>🔗 공유된 다이어리</span>
          </div>
        </div>

        {/* Canvas */}
        <div style={styles.canvasContainer}>
          <div style={{ ...styles.canvas, ...getBackgroundStyle(diary.background) }}>
            <div style={styles.canvasHeader}>
              <span style={styles.dateText}>{formatted}</span>
              <span style={styles.dayText}>{weekday}</span>
            </div>

            <div style={styles.canvasContent}>
              {diary.memo && <p style={styles.memoText}>{diary.memo}</p>}
            </div>

            {diary.stickers?.map((sticker) => (
              <span key={sticker.id} style={styles.sticker(sticker)}>
                {sticker.emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Info */}
        <Card style={styles.infoCard}>
          <h1 style={styles.title}>{diary.title}</h1>
          <p style={styles.meta}>스티커 {diary.stickers?.length || 0}개</p>
          <button style={styles.likeBtn(isLiked)} onClick={handleLike}>
            {isLiked ? '❤️' : '🤍'} {diary.likes}
          </button>
          <div style={styles.actionRow}>
            <button className="share-action-btn" style={styles.shareBtn} onClick={handleCopyLink}>
              📋 링크 복사
            </button>
            <button className="share-action-btn" style={styles.shareBtn} onClick={handleShare}>
              📤 공유하기
            </button>
          </div>
        </Card>

        {/* CTA */}
        <Card style={styles.ctaCard}>
          <div style={styles.ctaEmoji}>✨</div>
          <h3 style={styles.ctaTitle}>나만의 다이어리를 만들어보세요!</h3>
          <p style={styles.ctaText}>
            툰버티에서 웹툰 감상을 스티커로 기록해보세요
          </p>
          <Link to="/signup">
            <Button size="lg">무료로 시작하기</Button>
          </Link>
        </Card>

        {/* Toast */}
        <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
      </div>

      <style>{`
        .share-action-btn:hover {
          background: #F5EDE4 !important;
          transform: translateY(-2px);
        }
        @media (max-width: 640px) {
          .share-container {
            padding: 24px 16px !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
