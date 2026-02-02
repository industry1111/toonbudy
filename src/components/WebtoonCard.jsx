import { useState, forwardRef } from 'react';

// 플랫폼 정보
const platformInfo = {
  naver: { name: '네이버', color: '#00C73C', icon: 'N' },
  kakao: { name: '카카오', color: '#FFE812', icon: 'K' },
  lezhin: { name: '레진', color: '#E53935', icon: 'L' },
  toptoon: { name: '탑툰', color: '#FF6B35', icon: 'T' },
  ridi: { name: '리디', color: '#1F8CE6', icon: 'R' },
  other: { name: '기타', color: '#9E9E9E', icon: '?' },
};

// 상태 정보
const statusInfo = {
  watching: { label: '보는 중', color: '#7BC4A8', bg: '#E8F5F1' },
  planToWatch: { label: '볼 예정', color: '#F5A623', bg: '#FFF8E5' },
  completed: { label: '완결', color: '#5D4E3C', bg: '#F5EDE4' },
  onHold: { label: '보류', color: '#9E9E9E', bg: '#F5F5F5' },
};

const WebtoonCard = forwardRef(({
  card,
  isSelected = false,
  isDraggable = false,
  showComments = true,
  onSelect,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onStatusChange,
  onComment,
  style,
  className = '',
}, ref) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.(card);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
    onDoubleClick?.(card, !isFlipped);
  };

  const handleDragStart = (e) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardId', card.id);
    onDragStart?.(e, card);
  };

  const handleDragEnd = (e) => {
    onDragEnd?.(e, card);
  };

  const platform = platformInfo[card.platform] || platformInfo.other;
  const status = statusInfo[card.status] || statusInfo.planToWatch;

  return (
    <div
      ref={ref}
      className={`webtoon-card ${isSelected ? 'webtoon-card--selected' : ''} ${isFlipped ? 'webtoon-card--flipped' : ''} ${className}`}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="webtoon-card__inner">
        {/* 앞면 */}
        <div className="webtoon-card__front">
          <div className="webtoon-card__cover">
            {card.coverImage ? (
              <img src={card.coverImage} alt={card.title} />
            ) : (
              <div className="webtoon-card__cover-placeholder">
                <span>📚</span>
              </div>
            )}
            {/* 플랫폼 뱃지 */}
            <div
              className="webtoon-card__platform"
              style={{ backgroundColor: platform.color }}
            >
              {platform.icon}
            </div>
            {/* 상태 뱃지 */}
            <div
              className="webtoon-card__status"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </div>
          </div>
          <div className="webtoon-card__title">{card.title}</div>
        </div>

        {/* 뒷면 */}
        <div className="webtoon-card__back">
          <div className="webtoon-card__back-header">
            <h4 className="webtoon-card__back-title">{card.title}</h4>
            <span className="webtoon-card__back-author">{card.author}</span>
          </div>

          <div className="webtoon-card__back-info">
            <div className="webtoon-card__back-row">
              <span className="webtoon-card__back-label">플랫폼</span>
              <span
                className="webtoon-card__back-value"
                style={{ color: platform.color }}
              >
                {platform.name}
              </span>
            </div>
            <div className="webtoon-card__back-row">
              <span className="webtoon-card__back-label">장르</span>
              <span className="webtoon-card__back-value">
                {card.genre?.join(', ') || '-'}
              </span>
            </div>
            <div className="webtoon-card__back-row">
              <span className="webtoon-card__back-label">평점</span>
              <span className="webtoon-card__back-value">
                {'⭐'.repeat(card.rating || 0)}{'☆'.repeat(5 - (card.rating || 0))}
              </span>
            </div>
          </div>

          <p className="webtoon-card__back-desc">
            {card.description || '설명이 없습니다.'}
          </p>

          {/* 상태 변경 버튼 */}
          {onStatusChange && (
            <div className="webtoon-card__back-actions">
              <select
                className="webtoon-card__status-select"
                value={card.status}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(card.id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="watching">보는 중</option>
                <option value="planToWatch">볼 예정</option>
                <option value="completed">완결</option>
                <option value="onHold">보류</option>
              </select>
            </div>
          )}

          {/* 댓글 버튼 */}
          {showComments && (
            <button
              className="webtoon-card__comment-btn"
              onClick={(e) => {
                e.stopPropagation();
                onComment?.(card);
              }}
            >
              💬 댓글 보기
            </button>
          )}

          {/* 뒤집기 힌트 */}
          <div className="webtoon-card__flip-hint">
            더블클릭으로 뒤집기
          </div>
        </div>
      </div>

      <style>{`
        .webtoon-card {
          width: 160px;
          height: 240px;
          perspective: 1000px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .webtoon-card:hover {
          transform: scale(1.05);
          z-index: 10;
        }

        .webtoon-card--selected {
          transform: scale(1.05);
        }

        .webtoon-card--selected .webtoon-card__inner {
          box-shadow: 0 0 0 3px #7BC4A8, 0 12px 40px rgba(123, 196, 168, 0.3);
        }

        .webtoon-card__inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(93, 78, 60, 0.12);
        }

        .webtoon-card--flipped .webtoon-card__inner {
          transform: rotateY(180deg);
        }

        .webtoon-card__front,
        .webtoon-card__back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
        }

        .webtoon-card__front {
          background: white;
        }

        .webtoon-card__back {
          background: linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 100%);
          transform: rotateY(180deg);
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .webtoon-card__cover {
          position: relative;
          width: 100%;
          height: 190px;
          overflow: hidden;
        }

        .webtoon-card__cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .webtoon-card__cover-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #E8E4DF 0%, #D4CFC8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .webtoon-card__platform {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .webtoon-card__status {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .webtoon-card__title {
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #3D3024;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: white;
        }

        /* 뒷면 스타일 */
        .webtoon-card__back-header {
          margin-bottom: 12px;
        }

        .webtoon-card__back-title {
          font-size: 14px;
          font-weight: 700;
          color: #3D3024;
          margin: 0 0 4px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .webtoon-card__back-author {
          font-size: 11px;
          color: #8B7E6A;
        }

        .webtoon-card__back-info {
          margin-bottom: 8px;
        }

        .webtoon-card__back-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 11px;
        }

        .webtoon-card__back-label {
          color: #8B7E6A;
        }

        .webtoon-card__back-value {
          color: #5D4E3C;
          font-weight: 500;
        }

        .webtoon-card__back-desc {
          font-size: 11px;
          color: #6B5A42;
          line-height: 1.5;
          margin: 0;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .webtoon-card__back-actions {
          margin-top: 8px;
        }

        .webtoon-card__status-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #E8E4DF;
          border-radius: 6px;
          font-size: 11px;
          color: #5D4E3C;
          background: white;
          cursor: pointer;
        }

        .webtoon-card__comment-btn {
          margin-top: 8px;
          padding: 8px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%);
          color: #1D4A3A;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .webtoon-card__comment-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(123, 196, 168, 0.3);
        }

        .webtoon-card__flip-hint {
          position: absolute;
          bottom: 8px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 9px;
          color: #A89880;
        }

        /* 드래그 가능 상태 */
        .webtoon-card[draggable="true"] {
          cursor: grab;
        }

        .webtoon-card[draggable="true"]:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
});

WebtoonCard.displayName = 'WebtoonCard';

export default WebtoonCard;
