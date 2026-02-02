import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiary } from '../contexts/DiaryContext';
import { Card, Button, EmptyState } from '../components/ui';

const homeStyles = `
  .home-container {
    padding: 32px 48px 60px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .home-greeting {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 28px;
    padding: 32px 40px;
    margin-bottom: 32px;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px rgba(93, 78, 60, 0.08);
    animation: fadeInUp 0.5s ease-out;
  }

  .home-stats {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .diary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .diary-card {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease-out;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 16px rgba(93, 78, 60, 0.08);
  }

  .diary-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(93, 78, 60, 0.15);
  }

  .diary-card__preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(255, 255, 255, 0.6), transparent);
    pointer-events: none;
    z-index: 1;
  }

  .diary-add-card {
    background: transparent;
    border: 3px dashed #D4C4B0;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease-out;
  }

  .diary-add-card:hover {
    border-color: #B0E0D2;
    background: rgba(176, 224, 210, 0.1);
  }

  /* Tablet: max-width 1024px */
  @media (max-width: 1024px) {
    .diary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile: max-width 640px */
  @media (max-width: 640px) {
    .home-container {
      padding: 16px;
    }

    .home-greeting {
      padding: 20px;
      border-radius: 20px;
      margin-bottom: 24px;
    }

    .home-stats {
      flex-wrap: wrap;
      gap: 16px;
    }

    .diary-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const { diaries, refreshDiaries, createDiary, deleteDiary } = useDiary();
  const navigate = useNavigate();

  useEffect(() => {
    refreshDiaries();
  }, [refreshDiaries]);

  const handleCreateNew = () => {
    const newDiary = createDiary();
    if (newDiary) {
      navigate(`/editor/${newDiary.id}`);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return { month, day, weekday };
  };

  const styles = {
    greetingTitle: {
      fontFamily: 'var(--font-serif)',
      fontSize: '26px',
      fontWeight: '700',
      color: '#4A3D2E',
      margin: '0 0 8px 0',
    },
    greetingText: {
      fontSize: '15px',
      color: '#8A7B6A',
      margin: '0 0 24px 0',
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    statNumber: {
      fontFamily: 'var(--font-serif)',
      fontSize: '28px',
      fontWeight: '700',
      color: '#5D9B84',
    },
    statLabel: {
      fontSize: '13px',
      color: '#9A8B7A',
    },
    statDivider: {
      width: '1px',
      height: '36px',
      background: 'linear-gradient(180deg, transparent, #D4C4B0, transparent)',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    sectionTitle: {
      fontFamily: 'var(--font-serif)',
      fontSize: '20px',
      fontWeight: '700',
      color: '#4A3D2E',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    diaryPreview: {
      height: '200px',
      position: 'relative',
      overflow: 'hidden',
    },
    sticker: (s) => ({
      position: 'absolute',
      left: s.x * 0.6,
      top: s.y * 0.3,
      fontSize: s.isText ? '14px' : '28px',
      fontWeight: s.isText ? '700' : '400',
      fontFamily: s.isText ? 'var(--font-handwriting)' : 'inherit',
      color: s.isText ? '#5D4E3C' : 'inherit',
      transform: `rotate(${s.rotation}deg) scale(${s.scale * 0.8})`,
    }),
    diaryInfo: {
      padding: '16px 20px',
      borderTop: '1px solid rgba(180, 160, 140, 0.1)',
    },
    diaryDate: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '6px',
      marginBottom: '8px',
    },
    dateMain: {
      fontFamily: 'var(--font-serif)',
      fontSize: '18px',
      fontWeight: '600',
      color: '#4A3D2E',
    },
    dateWeekday: {
      fontSize: '13px',
      color: '#9A8B7A',
    },
    diaryTitle: {
      fontSize: '14px',
      color: '#6B5A42',
      marginBottom: '8px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    diaryMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#A89880',
    },
    likeBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#E85A5A',
    },
    addIcon: {
      fontSize: '48px',
      color: '#C4B4A0',
      marginBottom: '12px',
    },
    addText: {
      fontSize: '15px',
      color: '#A89880',
      fontWeight: '500',
    },
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

  return (
    <div className="home-container">
      <style>{homeStyles}</style>

      {/* Greeting Section */}
      <Card className="home-greeting">
        <h1 style={styles.greetingTitle}>
          안녕하세요, {user?.nickname || '사용자'}님! ☀️
        </h1>
        <p style={styles.greetingText}>오늘도 웹툰 감상을 기록해보세요</p>
        <div className="home-stats">
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{diaries.length}</span>
            <span style={styles.statLabel}>다이어리</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>
              {diaries.reduce((acc, d) => acc + (d.stickers?.length || 0), 0)}
            </span>
            <span style={styles.statLabel}>스티커</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>
              {diaries.reduce((acc, d) => acc + d.likes, 0)}
            </span>
            <span style={styles.statLabel}>좋아요</span>
          </div>
        </div>
      </Card>

      {/* Diary List */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          <span>📔</span> 내 다이어리
        </h2>
        <Button onClick={handleCreateNew} icon="✨">
          새 다꾸 만들기
        </Button>
      </div>

      {diaries.length === 0 ? (
        <EmptyState
          icon="📔"
          title="아직 다이어리가 없어요"
          description="첫 번째 다이어리를 만들고 스티커로 꾸며보세요!"
          action={
            <Button onClick={handleCreateNew} icon="✨">
              첫 다꾸 만들기
            </Button>
          }
        />
      ) : (
        <div className="diary-grid">
          {diaries.map((diary, index) => {
            const { month, day, weekday } = formatDate(diary.date);
            return (
              <div
                key={diary.id}
                className="diary-card"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
                onClick={() => navigate(`/view/${diary.id}`)}
              >
                <div
                  style={{
                    ...styles.diaryPreview,
                    ...getBackgroundStyle(diary.background),
                  }}
                >
                  {diary.stickers?.slice(0, 5).map((sticker) => (
                    <span key={sticker.id} style={styles.sticker(sticker)}>
                      {sticker.emoji}
                    </span>
                  ))}
                  <div className="diary-card__preview-overlay" />
                </div>
                <div style={styles.diaryInfo}>
                  <div style={styles.diaryDate}>
                    <span style={styles.dateMain}>
                      {month}월 {day}일
                    </span>
                    <span style={styles.dateWeekday}>{weekday}요일</span>
                  </div>
                  <p style={styles.diaryTitle}>{diary.title}</p>
                  <div style={styles.diaryMeta}>
                    <span>스티커 {diary.stickers?.length || 0}개</span>
                    <span style={styles.likeBadge}>
                      ❤️ {diary.likes}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Card */}
          <div
            className="diary-add-card"
            onClick={handleCreateNew}
          >
            <span style={styles.addIcon}>+</span>
            <span style={styles.addText}>새 다이어리 만들기</span>
          </div>
        </div>
      )}
    </div>
  );
}
