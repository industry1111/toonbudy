import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiary } from '../contexts/DiaryContext';
import { Card, Button, EmptyState } from '../components/ui';

const TAGS = [
  { id: 'romance', label: '로맨스', emoji: '💕' },
  { id: 'action', label: '액션', emoji: '⚔️' },
  { id: 'fantasy', label: '판타지', emoji: '🧙' },
  { id: 'comedy', label: '코미디', emoji: '😂' },
  { id: 'drama', label: '드라마', emoji: '🎭' },
  { id: 'horror', label: '공포', emoji: '👻' },
  { id: 'daily', label: '일상', emoji: '☀️' },
  { id: 'sports', label: '스포츠', emoji: '⚽' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { diaries, refreshDiaries } = useDiary();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    refreshDiaries();
  }, [refreshDiaries]);

  const filteredDiaries = useMemo(() => {
    let results = [...diaries];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (diary) =>
          diary.title.toLowerCase().includes(query) ||
          diary.memo?.toLowerCase().includes(query) ||
          diary.date.includes(query)
      );
    }

    if (dateFrom) {
      results = results.filter((diary) => diary.date >= dateFrom);
    }
    if (dateTo) {
      results = results.filter((diary) => diary.date <= dateTo);
    }

    if (selectedTags.length > 0) {
      results = results.filter((diary) => {
        if (diary.tags) {
          return selectedTags.some((tag) => diary.tags.includes(tag));
        }
        const tagLabels = selectedTags.map((id) => TAGS.find((t) => t.id === id)?.label || '');
        return tagLabels.some(
          (label) => diary.title.includes(label) || diary.memo?.includes(label)
        );
      });
    }

    switch (sortBy) {
      case 'oldest':
        results.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'mostStickers':
        results.sort((a, b) => (b.stickers?.length || 0) - (a.stickers?.length || 0));
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return results;
  }, [diaries, searchQuery, dateFrom, dateTo, selectedTags, sortBy]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedTags([]);
    setSortBy('newest');
  };

  const hasFilters = dateFrom || dateTo || selectedTags.length > 0 || sortBy !== 'newest';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
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
      case 'mint':
        return { backgroundColor: '#E8F5F1' };
      case 'peach':
        return { backgroundColor: '#FFF0E5' };
      default:
        return { backgroundColor: '#FDF8F3' };
    }
  };

  return (
    <div className="search-container" style={styles.container}>
      {/* Search Box */}
      <div className="search-bar-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div
          className="search-box"
          style={{
            ...styles.searchBox,
            flex: 1,
            marginBottom: 0,
            borderColor: searchQuery ? '#B0E0D2' : 'transparent',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.6 }}>🔍</span>
          <input
            type="text"
            placeholder="다이어리 제목, 메모, 날짜로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ flex: 1, padding: '14px 0' }}
            autoFocus
          />
          {searchQuery && (
            <button
              style={styles.clearBtn}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        <button
          className="search-filter-btn"
          style={{
            ...styles.filterToggle,
            background: hasFilters ? '#E8F5F1' : 'white',
            borderColor: hasFilters ? '#7BC4A8' : '#EDE4D8',
            color: hasFilters ? '#2D5A4A' : '#5D4E3C',
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span>🎛️</span>
          <span className="filter-label">필터</span>
          {hasFilters && <span style={{ fontSize: '12px' }}>({selectedTags.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)})</span>}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="search-filter-panel" style={styles.filterPanel}>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.filterLabel}><span>📅</span> 날짜 범위</label>
            <div className="search-date-inputs" style={styles.dateInputs}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={styles.dateInput} />
              <span style={{ color: '#8B7E6A', fontSize: '14px' }}>~</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={styles.dateInput} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.filterLabel}><span>🏷️</span> 장르 태그</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {TAGS.map((tag) => (
                <button
                  key={tag.id}
                  className={`tag ${selectedTags.includes(tag.id) ? 'tag--active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  <span>{tag.emoji}</span>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.filterLabel}><span>📊</span> 정렬</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.sortSelect}>
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="mostStickers">스티커 많은순</option>
            </select>
          </div>

          <div style={styles.filterActions}>
            <span style={{ fontSize: '13px', color: '#8B7E6A' }}>
              {filteredDiaries.length}개의 다이어리
            </span>
            {hasFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>필터 초기화</Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasFilters && !showFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {dateFrom && (
            <span className="badge badge--mint">
              📅 {dateFrom} 부터
              <button style={styles.removeFilter} onClick={() => setDateFrom('')}>✕</button>
            </span>
          )}
          {dateTo && (
            <span className="badge badge--mint">
              📅 {dateTo} 까지
              <button style={styles.removeFilter} onClick={() => setDateTo('')}>✕</button>
            </span>
          )}
          {selectedTags.map((tagId) => {
            const tag = TAGS.find((t) => t.id === tagId);
            return (
              <span key={tagId} className="badge badge--mint">
                {tag?.emoji} {tag?.label}
                <button style={styles.removeFilter} onClick={() => toggleTag(tagId)}>✕</button>
              </span>
            );
          })}
          {sortBy !== 'newest' && (
            <span className="badge badge--mint">
              📊 {sortBy === 'oldest' ? '오래된순' : '스티커 많은순'}
              <button style={styles.removeFilter} onClick={() => setSortBy('newest')}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {searchQuery.trim() === '' && !hasFilters ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <EmptyState
            icon="🔍"
            title="다이어리 검색"
            description="제목, 메모 내용, 또는 날짜로 검색해보세요"
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
            {['오늘', '웹툰', '감동', '재밌', '완결'].map((term) => (
              <button
                key={term}
                className="search-suggestion"
                style={styles.suggestionChip}
                onClick={() => setSearchQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </Card>
      ) : filteredDiaries.length === 0 ? (
        <Card>
          <EmptyState
            icon="😢"
            title="검색 결과가 없어요"
            description={hasFilters ? '필터 조건을 변경해보세요' : '다른 키워드로 검색해보세요'}
          />
        </Card>
      ) : (
        <>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>검색 결과</h2>
            <span style={styles.resultsCount}>{filteredDiaries.length}건</span>
          </div>
          <div className="search-grid" style={styles.grid}>
            {filteredDiaries.map((diary) => (
              <div
                key={diary.id}
                className="search-card"
                style={styles.resultCard}
                onClick={() => navigate(`/view/${diary.id}`)}
              >
                <div style={{ ...styles.preview, ...getBackgroundStyle(diary.background) }}>
                  {diary.stickers?.slice(0, 4).map((sticker) => (
                    <span
                      key={sticker.id}
                      style={{
                        position: 'absolute',
                        left: sticker.x * 0.5,
                        top: sticker.y * 0.22,
                        fontSize: sticker.isText ? '11px' : '22px',
                        fontWeight: sticker.isText ? '700' : '400',
                        fontFamily: sticker.isText ? 'var(--font-handwriting)' : 'inherit',
                        color: sticker.isText ? '#5D4E3C' : 'inherit',
                        transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale * 0.7})`,
                      }}
                    >
                      {sticker.emoji}
                    </span>
                  ))}
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{diary.title}</h3>
                  <p style={styles.cardDate}>
                    {formatDate(diary.date)} &bull; 스티커 {diary.stickers?.length || 0}개
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .search-container {
          padding: 32px 48px 60px;
          max-width: 900px;
          margin: 0 auto;
        }
        .search-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .search-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(93, 78, 60, 0.12);
        }
        .search-suggestion:hover {
          background: #E8F5F1 !important;
          transform: translateY(-2px);
        }
        .search-filter-btn:hover {
          background: #F5EDE4 !important;
        }
        @media (max-width: 640px) {
          .search-container {
            padding: 16px 16px 40px !important;
          }
          .search-grid {
            grid-template-columns: 1fr !important;
          }
          .search-date-inputs {
            flex-direction: column;
          }
          .filter-label {
            display: none;
          }
          .search-filter-panel {
            padding: 16px !important;
          }
        }
        @media (max-width: 1024px) {
          .search-container {
            padding: 24px 24px 48px;
          }
          .search-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {},
  searchBox: {
    background: 'white',
    borderRadius: '20px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 20px rgba(93, 78, 60, 0.08)',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  clearBtn: {
    width: '28px',
    height: '28px',
    background: 'rgba(93, 78, 60, 0.1)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#8B7E6A',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: '2px solid',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minHeight: '48px',
  },
  filterPanel: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(93, 78, 60, 0.08)',
    animation: 'fadeInUp 0.3s ease-out',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dateInputs: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    padding: '12px 14px',
    border: '2px solid #EDE4D8',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#5D4E3C',
    outline: 'none',
  },
  sortSelect: {
    padding: '12px 14px',
    border: '2px solid #EDE4D8',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#5D4E3C',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #EDE4D8',
  },
  removeFilter: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#5D9B84',
    padding: '0',
    marginLeft: '4px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  resultsTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '600',
    color: '#4A3D2E',
  },
  resultsCount: {
    fontSize: '14px',
    color: '#7BC4A8',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  resultCard: {
    background: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  preview: {
    height: '140px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardInfo: {
    padding: '14px 18px',
    borderTop: '1px solid rgba(180, 160, 140, 0.1)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#4A3D2E',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardDate: {
    fontSize: '12px',
    color: '#8B7E6A',
  },
  suggestionChip: {
    padding: '10px 18px',
    background: 'white',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#5D4E3C',
    boxShadow: '0 2px 8px rgba(93, 78, 60, 0.08)',
    transition: 'all 0.2s ease',
  },
};
