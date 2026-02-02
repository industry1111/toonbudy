import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiary } from '../contexts/DiaryContext';
import { Button, Modal, Toast } from '../components/ui';

export default function ViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDiaryById, deleteDiary, updateDiary } = useDiary();
  const [diary, setDiary] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const d = getDiaryById(id);
    if (d) {
      setDiary(d);
    } else {
      navigate('/');
    }
  }, [id, getDiaryById, navigate]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  if (!diary) return null;

  const handleDelete = () => {
    deleteDiary(diary.id);
    navigate('/');
  };

  const handleLike = () => {
    if (!isLiked) {
      updateDiary(diary.id, { likes: diary.likes + 1 });
      setDiary({ ...diary, likes: diary.likes + 1 });
      setIsLiked(true);
    }
  };

  const getShareUrl = () => `${window.location.origin}/share/${diary?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      showToast('링크가 클립보드에 복사되었습니다!');
      if (diary && !diary.isPublic) {
        updateDiary(diary.id, { isPublic: true });
        setDiary({ ...diary, isPublic: true });
      }
    } catch {
      showToast('링크 복사에 실패했습니다.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: diary.title,
          text: '내 다이어리를 확인해보세요!',
          url: getShareUrl(),
        });
        if (!diary.isPublic) {
          updateDiary(diary.id, { isPublic: true });
          setDiary({ ...diary, isPublic: true });
        }
      } catch {
        // cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const togglePublic = () => {
    const newIsPublic = !diary.isPublic;
    updateDiary(diary.id, { isPublic: newIsPublic });
    setDiary({ ...diary, isPublic: newIsPublic });
    showToast(newIsPublic ? '다이어리가 공개되었습니다.' : '다이어리가 비공개되었습니다.');
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

  const { formatted, weekday } = formatDate(diary.date);

  return (
    <div className="view-container" style={styles.container}>
      {/* Header */}
      <div className="view-header" style={styles.header}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        <div className="view-actions" style={styles.actions}>
          <Button variant="secondary" size="sm" icon="✏️" onClick={() => navigate(`/editor/${diary.id}`)}>
            편집
          </Button>
          <Button variant="secondary" size="sm" icon="🔗" onClick={() => setShowShareModal(true)}>
            공유
          </Button>
          <Button variant="danger" size="sm" icon="🗑️" onClick={() => setShowDeleteModal(true)}>
            삭제
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="view-canvas-wrap" style={styles.canvasContainer}>
        <div className="view-canvas" style={{ ...styles.canvas, ...getBackgroundStyle(diary.background) }}>
          <div style={styles.canvasHeader}>
            <span style={styles.dateText}>{formatted}</span>
            <span style={styles.dayText}>{weekday}</span>
          </div>

          <div style={styles.canvasContent}>
            {diary.memo && <p style={styles.memoText}>{diary.memo}</p>}
          </div>

          {diary.stickers?.map((sticker) => (
            <span
              key={sticker.id}
              style={{
                position: 'absolute',
                left: sticker.x,
                top: sticker.y,
                fontSize: sticker.isText ? '16px' : '32px',
                fontWeight: sticker.isText ? '700' : '400',
                fontFamily: sticker.isText ? 'var(--font-handwriting)' : 'inherit',
                color: sticker.isText ? '#5D4E3C' : 'inherit',
                transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                userSelect: 'none',
                padding: '8px',
              }}
            >
              {sticker.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="view-info" style={styles.infoCard}>
        <div style={styles.infoLeft}>
          <h1 style={styles.title}>{diary.title}</h1>
          <span style={styles.meta}>
            스티커 {diary.stickers?.length || 0}개 &bull; {diary.isPublic ? '공개' : '비공개'}
          </span>
        </div>
        <div style={styles.infoRight}>
          <button
            className="view-like-btn"
            style={{
              ...styles.likeBtn,
              background: isLiked ? '#FFE5E5' : 'rgba(255,255,255,0.8)',
              color: isLiked ? '#E85A5A' : '#6B5A42',
              cursor: isLiked ? 'default' : 'pointer',
            }}
            onClick={handleLike}
          >
            {isLiked ? '❤️' : '🤍'} {diary.likes}
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="다이어리 삭제">
        <div style={styles.modalContent}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
          <p style={{ fontSize: '15px', color: '#5D4E3C', marginBottom: '8px' }}>
            이 다이어리를 삭제하시겠습니까?
          </p>
          <p style={{ fontSize: '13px', color: '#8B7E6A', marginBottom: '24px' }}>
            삭제된 다이어리는 휴지통에서 복구할 수 있습니다.
          </p>
          <div style={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="공유하기">
        <div style={{ padding: '8px 0' }}>
          <div style={styles.shareUrlBox}>
            <input
              type="text"
              readOnly
              value={getShareUrl()}
              style={styles.shareUrlInput}
              onClick={(e) => e.target.select()}
            />
            <button className="btn btn--primary btn--sm" onClick={handleCopyLink}>
              복사
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={styles.shareOption}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{diary?.isPublic ? '🌐' : '🔒'}</span>
                <div>
                  <div style={{ fontSize: '14px', color: '#5D4E3C' }}>공개 설정</div>
                  <div style={{ fontSize: '12px', color: '#8B7E6A' }}>
                    {diary?.isPublic ? '누구나 링크로 볼 수 있어요' : '나만 볼 수 있어요'}
                  </div>
                </div>
              </div>
              <button
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  background: diary?.isPublic ? '#7BC4A8' : '#D4CFC8',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: 'none',
                }}
                onClick={togglePublic}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: diary?.isPublic ? '22px' : '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    background: 'white',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              </button>
            </div>

            {navigator.share && (
              <Button fullWidth variant="secondary" icon="📤" onClick={handleNativeShare}>
                다른 앱으로 공유
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />

      <style>{`
        .view-container {
          padding: 32px 48px 60px;
          max-width: 900px;
          margin: 0 auto;
        }
        .view-canvas {
          width: 480px;
          height: 640px;
        }
        .view-like-btn:hover:not([disabled]) {
          transform: scale(1.05);
        }
        @media (max-width: 640px) {
          .view-container {
            padding: 16px 16px 40px !important;
          }
          .view-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch !important;
          }
          .view-actions {
            justify-content: center;
          }
          .view-canvas {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 3/4;
          }
          .view-info {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
        @media (max-width: 1024px) {
          .view-container {
            padding: 24px 24px 48px;
          }
          .view-canvas {
            width: 100%;
            max-width: 480px;
            height: auto;
            aspect-ratio: 3/4;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {},
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  canvas: {
    borderRadius: '20px',
    boxShadow: '0 12px 48px rgba(93, 78, 60, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  canvasHeader: {
    padding: '24px 28px',
    borderBottom: '1px dashed #E0D8CE',
  },
  dateText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    color: '#5D4E3C',
    fontWeight: '600',
  },
  dayText: {
    fontSize: '14px',
    color: '#8B7E6A',
    marginLeft: '12px',
  },
  canvasContent: {
    padding: '20px 28px',
  },
  memoText: {
    fontFamily: 'var(--font-handwriting)',
    fontSize: '16px',
    color: '#6B5E4C',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
  },
  infoCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(20px)',
  },
  infoLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '600',
    color: '#4A3D2E',
    margin: 0,
  },
  meta: {
    fontSize: '13px',
    color: '#8B7E6A',
  },
  infoRight: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  likeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  modalContent: {
    textAlign: 'center',
    padding: '20px 0',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  shareUrlBox: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  shareUrlInput: {
    flex: 1,
    padding: '14px 16px',
    border: '2px solid #EDE4D8',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#5D4E3C',
    background: '#FDFBF8',
    outline: 'none',
  },
  shareOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: '#FDFBF8',
    borderRadius: '12px',
  },
};
