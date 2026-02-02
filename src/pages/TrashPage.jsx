import { useEffect, useState, useCallback } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import { Button, Card, Modal, Toast, EmptyState } from '../components/ui';

const AUTO_DELETE_DAYS = 30;

export default function TrashPage() {
  const { trash, refreshTrash, restoreDiary, permanentDeleteDiary, emptyTrash } = useDiary();
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    refreshTrash();
  }, [refreshTrash]);

  const showToastMsg = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  const handleRestore = (id) => {
    restoreDiary(id);
    showToastMsg('다이어리가 복구되었습니다!');
  };

  const handleRestoreSelected = () => {
    selectedIds.forEach(id => restoreDiary(id));
    showToastMsg(`${selectedIds.length}개의 다이어리가 복구되었습니다!`);
    setSelectedIds([]);
  };

  const handleDelete = (id) => {
    permanentDeleteDiary(id);
    setSelectedItem(null);
    showToastMsg('다이어리가 영구 삭제되었습니다.');
  };

  const handleEmptyTrash = () => {
    emptyTrash();
    setShowEmptyModal(false);
    showToastMsg('휴지통이 비워졌습니다.');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === trash.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trash.map(d => d.id));
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const getDaysRemaining = (deletedAt) => {
    const deleted = new Date(deletedAt);
    const autoDeleteDate = new Date(deleted.getTime() + AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = Math.ceil((autoDeleteDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  };

  const getBackgroundStyle = (bg) => {
    switch (bg) {
      case 'grid':
        return {
          backgroundColor: '#FDF8F3',
          backgroundImage: 'linear-gradient(#E8E4DF 1px, transparent 1px), linear-gradient(90deg, #E8E4DF 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        };
      case 'dots':
        return {
          backgroundColor: '#FDF8F3',
          backgroundImage: 'radial-gradient(#D4CFC8 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        };
      case 'lines':
        return {
          backgroundColor: '#FDF8F3',
          backgroundImage: 'linear-gradient(transparent 11px, #E8E4DF 12px)',
          backgroundSize: '100% 12px',
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
    <div className="trash-container" style={styles.container}>
      {/* Header */}
      <div className="trash-header" style={styles.header}>
        <h1 style={styles.title}>
          <span>🗑️</span>
          휴지통
          <span className="badge badge--beige">{trash.length}개</span>
        </h1>
        {trash.length > 0 && (
          <Button variant="danger" size="sm" icon="🧹" onClick={() => setShowEmptyModal(true)}>
            휴지통 비우기
          </Button>
        )}
      </div>

      {/* Select Bar */}
      {trash.length > 0 && (
        <div className="trash-select-bar" style={styles.selectBar}>
          <label style={styles.selectAll}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={selectedIds.length === trash.length && trash.length > 0}
              onChange={toggleSelectAll}
            />
            전체 선택
          </label>
          <span style={{ fontSize: '14px', color: '#8B7E6A', flex: 1 }}>
            {selectedIds.length > 0 ? `${selectedIds.length}개 선택됨` : ''}
          </span>
          {selectedIds.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleRestoreSelected}>
              선택 복구
            </Button>
          )}
        </div>
      )}

      {/* Trash Items */}
      {trash.length === 0 ? (
        <Card>
          <EmptyState
            icon="✨"
            title="휴지통이 비어있어요"
            description="삭제된 다이어리가 이곳에 표시됩니다."
          />
        </Card>
      ) : (
        <div className="trash-grid" style={styles.grid}>
          {trash.map((diary) => {
            const daysRemaining = getDaysRemaining(diary.deletedAt);
            return (
              <div key={diary.id} className="trash-card" style={styles.trashCard}>
                <div style={{ ...styles.preview, ...getBackgroundStyle(diary.background) }}>
                  <input
                    type="checkbox"
                    style={styles.cardCheckbox}
                    checked={selectedIds.includes(diary.id)}
                    onChange={() => toggleSelect(diary.id)}
                  />
                  {diary.stickers?.slice(0, 4).map((sticker) => (
                    <span
                      key={sticker.id}
                      style={{
                        position: 'absolute',
                        left: sticker.x * 0.5,
                        top: sticker.y * 0.25,
                        fontSize: sticker.isText ? '12px' : '24px',
                        fontWeight: sticker.isText ? '700' : '400',
                        fontFamily: sticker.isText ? 'var(--font-handwriting)' : 'inherit',
                        color: sticker.isText ? '#5D4E3C' : 'inherit',
                        transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale * 0.7})`,
                        opacity: 0.7,
                      }}
                    >
                      {sticker.emoji}
                    </span>
                  ))}
                  <div style={styles.deleteOverlay}>
                    <span
                      className={`badge ${daysRemaining <= 7 ? 'badge--error' : 'badge--beige'}`}
                    >
                      {daysRemaining}일 후 자동 삭제
                    </span>
                  </div>
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{diary.title}</h3>
                  <p style={styles.cardDate}>
                    {formatDate(diary.date)} &bull; 삭제: {formatDate(diary.deletedAt)}
                  </p>
                  <div style={styles.cardActions}>
                    <button className="trash-restore-btn" style={styles.restoreBtn} onClick={() => handleRestore(diary.id)}>
                      복구
                    </button>
                    <button className="trash-delete-btn" style={styles.deleteBtn} onClick={() => setSelectedItem(diary)}>
                      영구 삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty Trash Modal */}
      <Modal isOpen={showEmptyModal} onClose={() => setShowEmptyModal(false)} title="휴지통 비우기">
        <div style={styles.modalContent}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ fontSize: '15px', color: '#5D4E3C', marginBottom: '8px' }}>휴지통을 비우시겠습니까?</p>
          <p style={{ fontSize: '13px', color: '#8B7E6A', marginBottom: '24px' }}>
            모든 항목이 영구적으로 삭제되며, 복구할 수 없습니다.
          </p>
          <div style={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowEmptyModal(false)}>취소</Button>
            <Button variant="danger" onClick={handleEmptyTrash}>비우기</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="영구 삭제">
        <div style={styles.modalContent}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
          <p style={{ fontSize: '15px', color: '#5D4E3C', marginBottom: '8px' }}>이 다이어리를 영구 삭제하시겠습니까?</p>
          <p style={{ fontSize: '13px', color: '#8B7E6A', marginBottom: '24px' }}>이 작업은 되돌릴 수 없습니다.</p>
          <div style={styles.modalActions}>
            <Button variant="secondary" onClick={() => setSelectedItem(null)}>취소</Button>
            <Button variant="danger" onClick={() => handleDelete(selectedItem?.id)}>영구 삭제</Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />

      <style>{`
        .trash-container {
          padding: 32px 48px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .trash-card {
          transition: all 0.3s ease;
        }
        .trash-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(93, 78, 60, 0.1);
        }
        .trash-restore-btn:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .trash-delete-btn:hover {
          background: #FFD4D4 !important;
        }
        @media (max-width: 640px) {
          .trash-container {
            padding: 16px 16px 40px !important;
          }
          .trash-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start !important;
          }
          .trash-grid {
            grid-template-columns: 1fr !important;
          }
          .trash-select-bar {
            flex-wrap: wrap;
            gap: 8px !important;
          }
        }
        @media (max-width: 1024px) {
          .trash-container {
            padding: 24px 24px 48px;
          }
          .trash-grid {
            grid-template-columns: repeat(2, 1fr) !important;
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
    marginBottom: '32px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '700',
    color: '#4A3D2E',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  selectBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '12px 20px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '16px',
  },
  selectAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#5D4E3C',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: '#7BC4A8',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  trashCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    borderRadius: '20px',
    overflow: 'hidden',
    opacity: 0.85,
    border: '1px solid rgba(180, 160, 140, 0.2)',
  },
  preview: {
    height: '160px',
    position: 'relative',
    overflow: 'hidden',
  },
  deleteOverlay: {
    position: 'absolute',
    top: '12px',
    right: '12px',
  },
  cardCheckbox: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    width: '22px',
    height: '22px',
    accentColor: '#7BC4A8',
    cursor: 'pointer',
    zIndex: 1,
  },
  cardInfo: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(180, 160, 140, 0.1)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#4A3D2E',
    marginBottom: '4px',
  },
  cardDate: {
    fontSize: '13px',
    color: '#8B7E6A',
    marginBottom: '12px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  restoreBtn: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#2D5A4A',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    padding: '10px 16px',
    background: '#FFE5E5',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#D64545',
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
};
