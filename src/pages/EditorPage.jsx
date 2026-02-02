import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiary } from '../contexts/DiaryContext';
import { cardRepo } from '../repo';
import { Button, Modal } from '../components/ui';

const stickerCategories = {
  emoji: { name: '이모지', icon: '😊', stickers: ['😍', '🥰', '😭', '🤣', '😎', '🥺', '✨', '💕'] },
  deco: { name: '데코', icon: '✨', stickers: ['⭐', '🌙', '☁️', '🌈', '🎀', '🌸', '🍀', '💫'] },
  text: { name: '텍스트', icon: '💬', stickers: ['최고', '대박', '감동', '재밌어', '눈물', '심쿵', '완결!', '정주행'] },
  reaction: { name: '반응', icon: '💭', stickers: ['👍', '❤️', '🔥', '😢', '😱', '🤔', '👏', '💯'] },
};

const backgrounds = [
  { id: 'plain', name: '무지', color: '#FDF8F3' },
  { id: 'grid', name: '모눈', pattern: 'grid' },
  { id: 'dots', name: '도트', pattern: 'dots' },
  { id: 'lines', name: '줄노트', pattern: 'lines' },
  { id: 'mint', name: '민트', color: '#E8F5F1' },
  { id: 'peach', name: '피치', color: '#FFF0E5' },
];

// 저장 상태 타입
const SaveStatus = {
  SAVED: 'saved',
  SAVING: 'saving',
  UNSAVED: 'unsaved',
  ERROR: 'error',
};

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDiaryById, createDiary, updateDiary } = useDiary();
  const canvasRef = useRef(null);

  const isNew = id === 'new';

  // State
  const [diaryId, setDiaryId] = useState(isNew ? null : id);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeCategory, setActiveCategory] = useState('emoji');
  const [selectedBackground, setSelectedBackground] = useState('plain');
  const [placedStickers, setPlacedStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [memo, setMemo] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 웹툰 카드 관련 상태
  const [libraryCards, setLibraryCards] = useState([]);
  const [placedCards, setPlacedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [cardDragOffset, setCardDragOffset] = useState({ x: 0, y: 0 });

  // 댓글 모달
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeCommentCard, setActiveCommentCard] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  // 저장 상태
  const [saveStatus, setSaveStatus] = useState(SaveStatus.SAVED);
  const [lastSaved, setLastSaved] = useState(null);

  // 스냅/가이드 옵션
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [guideLines, setGuideLines] = useState({ x: null, y: null });

  // Mobile bottom tab state
  const [mobileTab, setMobileTab] = useState(null);

  // Tablet right sidebar overlay state
  const [tabletRightOpen, setTabletRightOpen] = useState(false);

  // 라이브러리 카드 로드
  useEffect(() => {
    setLibraryCards(cardRepo.getAll());
  }, []);

  // 스냅 그리드 사이즈
  const SNAP_SIZE = 20;
  const CANVAS_CENTER_X = 240;
  const CANVAS_CENTER_Y = 320;

  // Load existing diary
  useEffect(() => {
    if (!isNew && id) {
      const diary = getDiaryById(id);
      if (diary) {
        setTitle(diary.title);
        setDate(diary.date);
        setSelectedBackground(diary.background);
        setPlacedStickers(diary.stickers || []);
        setPlacedCards(diary.cards || []);
        setComments(diary.comments || {});
        setMemo(diary.memo || '');
        setSaveStatus(SaveStatus.SAVED);
      } else {
        navigate('/');
      }
    }
  }, [id, isNew, getDiaryById, navigate]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S: 저장
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Ctrl+Z: 되돌리기
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z 또는 Ctrl+Y: 다시 실행
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete/Backspace: 선택된 스티커 삭제
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSticker && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        deleteSelectedSticker();
        return;
      }

      // Escape: 선택 해제
      if (e.key === 'Escape') {
        setSelectedSticker(null);
        return;
      }

      // 화살표 키: 선택된 스티커 이동
      if (selectedSticker && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const delta = {
          ArrowUp: { x: 0, y: -step },
          ArrowDown: { x: 0, y: step },
          ArrowLeft: { x: -step, y: 0 },
          ArrowRight: { x: step, y: 0 },
        }[e.key];

        moveSelectedSticker(delta.x, delta.y);
      }

      // [ ]: zIndex 조절
      if (selectedSticker && (e.key === '[' || e.key === ']')) {
        e.preventDefault();
        changeZIndex(e.key === ']' ? 1 : -1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSticker, historyIndex, history]);

  // 자동 저장 (30초)
  useEffect(() => {
    if (saveStatus !== SaveStatus.UNSAVED) return;

    const timer = setTimeout(() => {
      handleSave(true); // silent save
    }, 30000);

    return () => clearTimeout(timer);
  }, [saveStatus, placedStickers, memo, title]);

  // 스냅 함수
  const snapToGrid = (value) => {
    if (!snapEnabled) return value;
    return Math.round(value / SNAP_SIZE) * SNAP_SIZE;
  };

  // 가이드라인 계산
  const calculateGuides = (x, y) => {
    if (!showGuides) {
      setGuideLines({ x: null, y: null });
      return;
    }

    const threshold = 10;
    let guideX = null;
    let guideY = null;

    // 중앙 가이드
    if (Math.abs(x - CANVAS_CENTER_X) < threshold) guideX = CANVAS_CENTER_X;
    if (Math.abs(y - CANVAS_CENTER_Y) < threshold) guideY = CANVAS_CENTER_Y;

    // 다른 스티커와 정렬
    placedStickers.forEach((s) => {
      if (s.id === selectedSticker) return;
      if (Math.abs(x - s.x) < threshold) guideX = s.x;
      if (Math.abs(y - s.y) < threshold) guideY = s.y;
    });

    setGuideLines({ x: guideX, y: guideY });
  };

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(placedStickers));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, placedStickers]);

  // Add sticker
  const addSticker = (emoji, isText = false) => {
    saveToHistory();
    const maxZIndex = placedStickers.length > 0
      ? Math.max(...placedStickers.map(s => s.zIndex || 0)) + 1
      : 1;

    const newSticker = {
      id: Date.now(),
      emoji,
      x: snapToGrid(150 + Math.random() * 100),
      y: snapToGrid(150 + Math.random() * 100),
      rotation: 0,
      scale: 1,
      isText,
      zIndex: maxZIndex,
    };
    setPlacedStickers([...placedStickers, newSticker]);
    setSelectedSticker(newSticker.id);
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Update sticker property
  const updateStickerProperty = (property, value) => {
    if (!selectedSticker) return;
    saveToHistory();
    setPlacedStickers(
      placedStickers.map((s) =>
        s.id === selectedSticker ? { ...s, [property]: value } : s
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Delete selected sticker
  const deleteSelectedSticker = () => {
    if (!selectedSticker) return;
    saveToHistory();
    setPlacedStickers(placedStickers.filter((s) => s.id !== selectedSticker));
    setSelectedSticker(null);
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Move selected sticker
  const moveSelectedSticker = (dx, dy) => {
    if (!selectedSticker) return;
    const sticker = placedStickers.find(s => s.id === selectedSticker);
    if (!sticker) return;

    saveToHistory();
    const newX = Math.max(0, Math.min(sticker.x + dx, 430));
    const newY = Math.max(0, Math.min(sticker.y + dy, 590));

    setPlacedStickers(
      placedStickers.map((s) =>
        s.id === selectedSticker ? { ...s, x: newX, y: newY } : s
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Change zIndex
  const changeZIndex = (direction) => {
    if (!selectedSticker) return;
    saveToHistory();

    const sorted = [...placedStickers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const currentIndex = sorted.findIndex(s => s.id === selectedSticker);
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap zIndex
    const currentZIndex = sorted[currentIndex].zIndex || currentIndex;
    const targetZIndex = sorted[targetIndex].zIndex || targetIndex;

    setPlacedStickers(
      placedStickers.map((s) => {
        if (s.id === selectedSticker) return { ...s, zIndex: targetZIndex };
        if (s.id === sorted[targetIndex].id) return { ...s, zIndex: currentZIndex };
        return s;
      })
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Bring to front / Send to back
  const bringToFront = () => {
    if (!selectedSticker) return;
    saveToHistory();
    const maxZIndex = Math.max(...placedStickers.map(s => s.zIndex || 0)) + 1;
    setPlacedStickers(
      placedStickers.map((s) =>
        s.id === selectedSticker ? { ...s, zIndex: maxZIndex } : s
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  const sendToBack = () => {
    if (!selectedSticker) return;
    saveToHistory();
    const minZIndex = Math.min(...placedStickers.map(s => s.zIndex || 0)) - 1;
    setPlacedStickers(
      placedStickers.map((s) =>
        s.id === selectedSticker ? { ...s, zIndex: minZIndex } : s
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPlacedStickers(JSON.parse(history[historyIndex - 1]));
      setSelectedSticker(null);
      setSaveStatus(SaveStatus.UNSAVED);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setPlacedStickers([]);
      setSelectedSticker(null);
      setSaveStatus(SaveStatus.UNSAVED);
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPlacedStickers(JSON.parse(history[historyIndex + 1]));
      setSelectedSticker(null);
      setSaveStatus(SaveStatus.UNSAVED);
    }
  };

  // Reset canvas
  const resetCanvas = () => {
    if (placedStickers.length === 0) return;
    saveToHistory();
    setPlacedStickers([]);
    setSelectedSticker(null);
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // Mouse handlers
  const handleMouseDown = (e, stickerId) => {
    e.stopPropagation();
    const sticker = placedStickers.find((s) => s.id === stickerId);
    if (!sticker) return;

    setIsDragging(true);
    setSelectedSticker(stickerId);

    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - sticker.x,
      y: e.clientY - rect.top - sticker.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedSticker) return;

    const canvas = document.getElementById('diary-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    // 스냅 적용
    newX = snapToGrid(Math.max(0, Math.min(newX, rect.width - 50)));
    newY = snapToGrid(Math.max(0, Math.min(newY, rect.height - 50)));

    // 가이드라인 계산
    calculateGuides(newX, newY);

    // 가이드에 스냅
    if (guideLines.x !== null && Math.abs(newX - guideLines.x) < 15) newX = guideLines.x;
    if (guideLines.y !== null && Math.abs(newY - guideLines.y) < 15) newY = guideLines.y;

    setPlacedStickers(
      placedStickers.map((s) =>
        s.id === selectedSticker ? { ...s, x: newX, y: newY } : s
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      saveToHistory();
      setGuideLines({ x: null, y: null });
    }
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    setSelectedSticker(null);
  };

  // Save diary
  const handleSave = async (silent = false) => {
    setSaveStatus(SaveStatus.SAVING);
    try {
      const diaryData = {
        title: title || '새 다이어리',
        date,
        background: selectedBackground,
        stickers: placedStickers,
        cards: placedCards,
        comments,
        memo,
      };

      if (isNew || !diaryId) {
        const newDiary = createDiary(diaryData);
        if (newDiary) {
          setDiaryId(newDiary.id);
          navigate(`/editor/${newDiary.id}`, { replace: true });
        }
      } else {
        updateDiary(diaryId, diaryData);
      }
      setSaveStatus(SaveStatus.SAVED);
      setLastSaved(new Date());
    } catch (error) {
      setSaveStatus(SaveStatus.ERROR);
      if (!silent) {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // Mobile tab toggle handler
  const handleMobileTabClick = (tab) => {
    setMobileTab(prev => prev === tab ? null : tab);
  };

  // === 웹툰 카드 관련 함수 ===

  // 카드를 캔버스에 추가
  const addCardToCanvas = (card) => {
    const newPlacedCard = {
      id: `placed_${Date.now()}`,
      cardId: card.id,
      cardData: card,
      x: 50 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      rotation: Math.random() * 10 - 5,
      scale: 0.6,
      zIndex: placedCards.length + 100,
    };
    setPlacedCards([...placedCards, newPlacedCard]);
    setSelectedCard(newPlacedCard.id);
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // 카드 선택
  const handleCardSelect = (placedCardId) => {
    setSelectedCard(placedCardId);
    setSelectedSticker(null); // 스티커 선택 해제
  };

  // 카드 더블클릭 (플립)
  const handleCardDoubleClick = (placedCardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [placedCardId]: !prev[placedCardId]
    }));
  };

  // 카드 드래그 시작
  const handleCardMouseDown = (e, placedCardId) => {
    e.stopPropagation();
    const card = placedCards.find(c => c.id === placedCardId);
    if (!card) return;

    setIsDraggingCard(true);
    setSelectedCard(placedCardId);
    setSelectedSticker(null);

    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setCardDragOffset({
      x: e.clientX - rect.left - card.x,
      y: e.clientY - rect.top - card.y,
    });
  };

  // 카드 드래그 이동
  const handleCardMouseMove = (e) => {
    if (!isDraggingCard || !selectedCard) return;

    const canvas = document.getElementById('diary-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let newX = e.clientX - rect.left - cardDragOffset.x;
    let newY = e.clientY - rect.top - cardDragOffset.y;

    newX = snapToGrid(Math.max(0, Math.min(newX, rect.width - 100)));
    newY = snapToGrid(Math.max(0, Math.min(newY, rect.height - 150)));

    setPlacedCards(
      placedCards.map((c) =>
        c.id === selectedCard ? { ...c, x: newX, y: newY } : c
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // 카드 드래그 종료
  const handleCardMouseUp = () => {
    setIsDraggingCard(false);
  };

  // 카드 삭제
  const deleteSelectedCard = () => {
    if (!selectedCard) return;
    setPlacedCards(placedCards.filter(c => c.id !== selectedCard));
    setSelectedCard(null);
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // 카드 속성 업데이트
  const updateCardProperty = (property, value) => {
    if (!selectedCard) return;
    setPlacedCards(
      placedCards.map((c) =>
        c.id === selectedCard ? { ...c, [property]: value } : c
      )
    );
    setSaveStatus(SaveStatus.UNSAVED);
  };

  // 댓글 모달 열기
  const openCommentModal = (card) => {
    setActiveCommentCard(card);
    setShowCommentModal(true);
  };

  // 댓글 추가
  const handleAddComment = () => {
    if (!newComment.trim() || !activeCommentCard) return;

    const cardId = activeCommentCard.cardId || activeCommentCard.id;
    setComments(prev => ({
      ...prev,
      [cardId]: [
        ...(prev[cardId] || []),
        {
          id: Date.now(),
          text: newComment,
          author: '나',
          createdAt: new Date().toISOString(),
        }
      ]
    }));
    setNewComment('');
  };

  // 선택된 카드 데이터
  const selectedCardData = placedCards.find((c) => c.id === selectedCard);

  // Get selected sticker data
  const selectedStickerData = placedStickers.find((s) => s.id === selectedSticker);

  // Background style
  const getBackgroundStyle = () => {
    const bg = backgrounds.find((b) => b.id === selectedBackground);
    if (!bg) return { backgroundColor: '#FDF8F3' };

    if (bg.color) return { backgroundColor: bg.color };

    switch (bg.pattern) {
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
      default:
        return { backgroundColor: '#FDF8F3' };
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

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const { formatted: formattedDate, weekday } = formatDate(date);

  const styles = {
    container: {
      display: 'flex',
      height: 'calc(100vh - 70px)',
      backgroundColor: '#FAF7F2',
    },
    leftSidebar: {
      width: '220px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E8E4DF',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      overflowY: 'auto',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#5D4E3C',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    categoryTabs: {
      display: 'flex',
      gap: '6px',
      marginBottom: '12px',
    },
    categoryTab: (active) => ({
      padding: '8px 12px',
      fontSize: '12px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: active ? '#B0E0D2' : '#F5F2ED',
      color: active ? '#2D5A4A' : '#8B7E6A',
      fontWeight: active ? '600' : '400',
      transition: 'all 0.2s ease',
    }),
    stickerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
    },
    stickerItem: {
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAF7F2',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '22px',
      border: '2px solid transparent',
      transition: 'all 0.2s ease',
    },
    textStickerItem: {
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAF7F2',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '10px',
      fontWeight: '600',
      color: '#5D4E3C',
      border: '2px solid transparent',
      transition: 'all 0.2s ease',
    },
    backgroundGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
    },
    backgroundItem: (selected) => ({
      width: '56px',
      height: '56px',
      borderRadius: '10px',
      cursor: 'pointer',
      border: selected ? '2px solid #7BC4A8' : '2px solid #E8E4DF',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }),
    optionRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
    },
    optionLabel: {
      fontSize: '13px',
      color: '#5D4E3C',
    },
    toggle: (active) => ({
      width: '40px',
      height: '22px',
      borderRadius: '11px',
      backgroundColor: active ? '#7BC4A8' : '#E8E4DF',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    toggleKnob: (active) => ({
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: 'white',
      position: 'absolute',
      top: '2px',
      left: active ? '20px' : '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }),
    mainArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    toolbarLeft: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    toolbarRight: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    toolButton: (disabled) => ({
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: '500',
      border: 'none',
      borderRadius: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: disabled ? '#E8E4DF' : '#FFFFFF',
      color: disabled ? '#B8AFA0' : '#5D4E3C',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: disabled ? 'none' : '0 2px 8px rgba(93,78,60,0.08)',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.6 : 1,
    }),
    saveStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: '#8B7E6A',
      padding: '8px 12px',
      background: '#F5F2ED',
      borderRadius: '8px',
    },
    saveStatusDot: (status) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: {
        [SaveStatus.SAVED]: '#7BC4A8',
        [SaveStatus.SAVING]: '#FFB84D',
        [SaveStatus.UNSAVED]: '#FFB84D',
        [SaveStatus.ERROR]: '#E85A5A',
      }[status],
    }),
    canvasWrapper: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    canvas: {
      width: '480px',
      height: '640px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(93,78,60,0.12)',
      position: 'relative',
      cursor: 'default',
      overflow: 'hidden',
      ...getBackgroundStyle(),
    },
    guideLine: (type, position) => ({
      position: 'absolute',
      backgroundColor: '#7BC4A8',
      opacity: 0.7,
      zIndex: 1000,
      ...(type === 'vertical'
        ? { width: '1px', height: '100%', left: position, top: 0 }
        : { height: '1px', width: '100%', top: position, left: 0 }),
    }),
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
    memoArea: {
      fontFamily: 'var(--font-handwriting)',
      fontSize: '16px',
      color: '#6B5E4C',
      lineHeight: '1.8',
      minHeight: '80px',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      width: '100%',
      resize: 'none',
    },
    placedSticker: (sticker, isSelected) => ({
      position: 'absolute',
      left: sticker.x,
      top: sticker.y,
      fontSize: sticker.isText ? '16px' : '32px',
      fontWeight: sticker.isText ? '700' : '400',
      fontFamily: sticker.isText ? 'var(--font-handwriting)' : 'inherit',
      color: sticker.isText ? '#5D4E3C' : 'inherit',
      transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      padding: '8px',
      borderRadius: '8px',
      border: isSelected ? '2px dashed #7BC4A8' : '2px solid transparent',
      backgroundColor: isSelected ? 'rgba(176,224,210,0.2)' : 'transparent',
      transition: isDragging ? 'none' : 'border 0.15s ease, background-color 0.15s ease',
      zIndex: sticker.zIndex || 1,
    }),
    rightSidebar: {
      width: '240px',
      backgroundColor: '#FFFFFF',
      borderLeft: '1px solid #E8E4DF',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflowY: 'auto',
    },
    propertySection: {
      backgroundColor: '#FAF7F2',
      borderRadius: '12px',
      padding: '16px',
    },
    propertyLabel: {
      fontSize: '12px',
      color: '#8B7E6A',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    propertyValue: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#5D4E3C',
    },
    zIndexButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px',
    },
    zIndexBtn: {
      flex: 1,
      padding: '8px',
      fontSize: '11px',
      border: '1px solid #E8E4DF',
      borderRadius: '6px',
      background: 'white',
      cursor: 'pointer',
      color: '#5D4E3C',
      transition: 'all 0.2s ease',
    },
    deleteButton: {
      padding: '12px',
      fontSize: '13px',
      fontWeight: '500',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      backgroundColor: '#FFE5E5',
      color: '#D64545',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#B8AFA0',
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyText: {
      fontSize: '14px',
      lineHeight: '1.6',
    },
    layerList: {
      marginTop: '8px',
    },
    layerItem: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      backgroundColor: isSelected ? '#E8F5F1' : 'transparent',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '4px',
      border: isSelected ? '1px solid #B0E0D2' : '1px solid transparent',
    }),
    layerEmoji: {
      fontSize: '18px',
    },
    layerName: {
      fontSize: '13px',
      color: '#5D4E3C',
      flex: 1,
    },
    layerIndex: {
      fontSize: '11px',
      color: '#B8AFA0',
    },
    titleInput: {
      fontFamily: 'var(--font-serif)',
      fontSize: '16px',
      color: '#5D4E3C',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      padding: '8px 0',
    },
    dateInput: {
      fontSize: '14px',
      color: '#8B7E6A',
      border: '1px solid #E8E4DF',
      borderRadius: '8px',
      padding: '8px 12px',
      outline: 'none',
      background: 'white',
    },
    shortcutHint: {
      fontSize: '10px',
      color: '#A89880',
      marginTop: '4px',
    },
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case SaveStatus.SAVED: return lastSaved ? `저장됨 · ${formatLastSaved()}` : '저장됨';
      case SaveStatus.SAVING: return '저장 중...';
      case SaveStatus.UNSAVED: return '저장되지 않음';
      case SaveStatus.ERROR: return '저장 실패';
      default: return '';
    }
  };

  // Render sticker panel content (shared between sidebar and mobile bottom sheet)
  const renderStickerPanel = () => (
    <div>
      <div style={styles.sectionTitle}>
        <span>🎨</span> 스티커
      </div>
      <div style={styles.categoryTabs}>
        {Object.entries(stickerCategories).map(([key, cat]) => (
          <button
            key={key}
            className="editor-category-tab"
            style={styles.categoryTab(activeCategory === key)}
            onClick={() => setActiveCategory(key)}
          >
            {cat.icon}
          </button>
        ))}
      </div>
      <div style={styles.stickerGrid}>
        {stickerCategories[activeCategory].stickers.map((sticker, idx) => (
          <div
            key={idx}
            className="editor-sticker-item"
            style={activeCategory === 'text' ? styles.textStickerItem : styles.stickerItem}
            onClick={() => addSticker(sticker, activeCategory === 'text')}
          >
            {sticker}
          </div>
        ))}
      </div>
    </div>
  );

  // Render cards panel content (웹툰/웹소설 카드)
  const renderCardsPanel = () => (
    <div>
      <div style={styles.sectionTitle}>
        <span>📚</span> 내 카드
      </div>
      {libraryCards.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {libraryCards.map((card) => (
            <div
              key={card.id}
              className="editor-card-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                background: '#FAF7F2',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => addCardToCanvas(card)}
            >
              <div style={{
                width: '40px',
                height: '55px',
                borderRadius: '6px',
                overflow: 'hidden',
                background: '#E8E4DF',
                flexShrink: 0,
              }}>
                {card.coverImage ? (
                  <img src={card.coverImage} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📚</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#3D3024', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '10px', color: '#8B7E6A' }}>
                  {card.author || '작가 미상'}
                </div>
              </div>
              <span style={{ fontSize: '16px' }}>➕</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#A89880', fontSize: '13px' }}>
          라이브러리에 카드를 추가해주세요
        </div>
      )}
      <div style={{ marginTop: '12px', fontSize: '11px', color: '#A89880', lineHeight: '1.5' }}>
        💡 카드를 클릭하면 캔버스에 추가됩니다.<br />
        더블클릭으로 카드를 뒤집을 수 있어요.
      </div>
    </div>
  );

  // Render background panel content
  const renderBackgroundPanel = () => (
    <div>
      <div style={styles.sectionTitle}>
        <span>🖼️</span> 배경
      </div>
      <div style={styles.backgroundGrid}>
        {backgrounds.map((bg) => (
          <div
            key={bg.id}
            style={styles.backgroundItem(selectedBackground === bg.id)}
            onClick={() => {
              setSelectedBackground(bg.id);
              setSaveStatus(SaveStatus.UNSAVED);
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                ...(bg.color ? { backgroundColor: bg.color } : {}),
                ...(bg.pattern === 'grid'
                  ? {
                      backgroundColor: '#FDF8F3',
                      backgroundImage: 'linear-gradient(#E8E4DF 1px, transparent 1px), linear-gradient(90deg, #E8E4DF 1px, transparent 1px)',
                      backgroundSize: '8px 8px',
                    }
                  : {}),
                ...(bg.pattern === 'dots'
                  ? {
                      backgroundColor: '#FDF8F3',
                      backgroundImage: 'radial-gradient(#D4CFC8 1px, transparent 1px)',
                      backgroundSize: '6px 6px',
                    }
                  : {}),
                ...(bg.pattern === 'lines'
                  ? {
                      backgroundColor: '#FDF8F3',
                      backgroundImage: 'linear-gradient(transparent 7px, #E8E4DF 8px)',
                      backgroundSize: '100% 8px',
                    }
                  : {}),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Render settings panel content (options + settings + shortcuts)
  const renderSettingsPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Options */}
      <div>
        <div style={styles.sectionTitle}>
          <span>⚙️</span> 옵션
        </div>
        <div style={styles.optionRow}>
          <span style={styles.optionLabel}>스냅</span>
          <div style={styles.toggle(snapEnabled)} onClick={() => setSnapEnabled(!snapEnabled)}>
            <div style={styles.toggleKnob(snapEnabled)} />
          </div>
        </div>
        <div style={styles.optionRow}>
          <span style={styles.optionLabel}>가이드</span>
          <div style={styles.toggle(showGuides)} onClick={() => setShowGuides(!showGuides)}>
            <div style={styles.toggleKnob(showGuides)} />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <div style={styles.sectionTitle}>
          <span>📅</span> 설정
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#8B7E6A', display: 'block', marginBottom: '6px' }}>
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveStatus(SaveStatus.UNSAVED);
              }}
              placeholder="다이어리 제목"
              style={styles.titleInput}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#8B7E6A', display: 'block', marginBottom: '6px' }}>
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSaveStatus(SaveStatus.UNSAVED);
              }}
              style={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div style={{ fontSize: '11px', color: '#A89880', lineHeight: '1.8' }}>
        <strong>단축키</strong><br />
        Ctrl+S 저장 · Ctrl+Z 되돌리기<br />
        Delete 삭제 · [ ] 레이어 순서<br />
        화살표 이동 · Shift+화살표 10px
      </div>
    </div>
  );

  // Render properties panel content (properties + layers)
  const renderPropertiesPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={styles.sectionTitle}>
        <span>⚙️</span> 속성 조절
      </div>

      {selectedStickerData ? (
        <>
          {/* Preview */}
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#FAF7F2', borderRadius: '12px' }}>
            <div style={{
              fontSize: selectedStickerData.isText ? '24px' : '48px',
              fontFamily: selectedStickerData.isText ? 'var(--font-handwriting)' : 'inherit',
              fontWeight: selectedStickerData.isText ? '700' : '400',
              marginBottom: '8px',
            }}>
              {selectedStickerData.emoji}
            </div>
            <div style={{ fontSize: '13px', color: '#5D4E3C', fontWeight: '500' }}>
              {selectedStickerData.isText ? '텍스트 스티커' : '이모지 스티커'}
            </div>
          </div>

          {/* Rotation */}
          <div style={styles.propertySection}>
            <div style={styles.propertyLabel}>
              <span>🔄 회전</span>
              <span style={styles.propertyValue}>{selectedStickerData.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedStickerData.rotation}
              onChange={(e) => updateStickerProperty('rotation', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Scale */}
          <div style={styles.propertySection}>
            <div style={styles.propertyLabel}>
              <span>📐 크기</span>
              <span style={styles.propertyValue}>{selectedStickerData.scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={selectedStickerData.scale}
              onChange={(e) => updateStickerProperty('scale', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* zIndex */}
          <div style={styles.propertySection}>
            <div style={styles.propertyLabel}>
              <span>📚 레이어</span>
              <span style={styles.propertyValue}>z: {selectedStickerData.zIndex || 0}</span>
            </div>
            <div style={styles.zIndexButtons}>
              <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={sendToBack}>맨 뒤로</button>
              <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={() => changeZIndex(-1)}>뒤로</button>
              <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={() => changeZIndex(1)}>앞으로</button>
              <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={bringToFront}>맨 앞으로</button>
            </div>
          </div>

          {/* Position */}
          <div style={styles.propertySection}>
            <div style={styles.propertyLabel}>
              <span>📍 위치</span>
            </div>
            <div style={{ fontSize: '12px', color: '#8B7E6A' }}>
              X: {Math.round(selectedStickerData.x)}px, Y: {Math.round(selectedStickerData.y)}px
            </div>
          </div>

          {/* Delete */}
          <button className="editor-tool-btn" style={styles.deleteButton} onClick={deleteSelectedSticker}>
            <span>🗑️</span> 삭제 (Delete)
          </button>
        </>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👆</div>
          <div style={styles.emptyText}>
            스티커를 선택하면<br />여기서 편집할 수 있어요
          </div>
        </div>
      )}

      {/* Layer List */}
      <div>
        <div style={styles.sectionTitle}>
          <span>📚</span> 레이어
        </div>
        {placedStickers.length > 0 ? (
          <div style={styles.layerList}>
            {[...placedStickers]
              .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
              .map((sticker, idx) => (
                <div
                  key={sticker.id}
                  style={styles.layerItem(selectedSticker === sticker.id)}
                  onClick={() => setSelectedSticker(sticker.id)}
                >
                  <span style={styles.layerEmoji}>{sticker.emoji}</span>
                  <span style={styles.layerName}>{sticker.isText ? '텍스트' : '스티커'}</span>
                  <span style={styles.layerIndex}>z:{sticker.zIndex || 0}</span>
                </div>
              ))}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#B8AFA0', textAlign: 'center', padding: '20px' }}>
            아직 스티커가 없어요
          </div>
        )}
      </div>
    </div>
  );

  // Render mobile bottom sheet content based on active tab
  const renderMobileBottomSheetContent = () => {
    switch (mobileTab) {
      case 'cards': return renderCardsPanel();
      case 'stickers': return renderStickerPanel();
      case 'background': return renderBackgroundPanel();
      case 'settings': return renderSettingsPanel();
      case 'properties': return renderPropertiesPanel();
      default: return null;
    }
  };

  // Combined mouse move handler
  const handleCombinedMouseMove = (e) => {
    handleMouseMove(e);
    handleCardMouseMove(e);
  };

  // Combined mouse up handler
  const handleCombinedMouseUp = () => {
    handleMouseUp();
    handleCardMouseUp();
  };

  return (
    <div className="editor-container" style={styles.container} onMouseMove={handleCombinedMouseMove} onMouseUp={handleCombinedMouseUp}>
      {/* Left Sidebar */}
      <div className="editor-left-sidebar" style={styles.leftSidebar}>
        {/* Cards Section */}
        {renderCardsPanel()}

        {/* Sticker Section */}
        {renderStickerPanel()}

        {/* Background Section */}
        {renderBackgroundPanel()}

        {/* Options */}
        <div>
          <div style={styles.sectionTitle}>
            <span>⚙️</span> 옵션
          </div>
          <div style={styles.optionRow}>
            <span style={styles.optionLabel}>스냅</span>
            <div style={styles.toggle(snapEnabled)} onClick={() => setSnapEnabled(!snapEnabled)}>
              <div style={styles.toggleKnob(snapEnabled)} />
            </div>
          </div>
          <div style={styles.optionRow}>
            <span style={styles.optionLabel}>가이드</span>
            <div style={styles.toggle(showGuides)} onClick={() => setShowGuides(!showGuides)}>
              <div style={styles.toggleKnob(showGuides)} />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <div style={styles.sectionTitle}>
            <span>📅</span> 설정
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#8B7E6A', display: 'block', marginBottom: '6px' }}>
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaveStatus(SaveStatus.UNSAVED);
                }}
                placeholder="다이어리 제목"
                style={styles.titleInput}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#8B7E6A', display: 'block', marginBottom: '6px' }}>
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSaveStatus(SaveStatus.UNSAVED);
                }}
                style={styles.dateInput}
              />
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div style={{ fontSize: '11px', color: '#A89880', lineHeight: '1.8' }}>
          <strong>단축키</strong><br />
          Ctrl+S 저장 · Ctrl+Z 되돌리기<br />
          Delete 삭제 · [ ] 레이어 순서<br />
          화살표 이동 · Shift+화살표 10px
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="editor-main" style={styles.mainArea}>
        {/* Toolbar */}
        <div className="editor-toolbar" style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <button
              className="editor-tool-btn"
              style={styles.toolButton(historyIndex < 0)}
              onClick={undo}
              disabled={historyIndex < 0}
              title="되돌리기 (Ctrl+Z)"
            >
              <span>↩️</span> <span className="editor-tool-btn-label">되돌리기</span>
            </button>
            <button
              className="editor-tool-btn"
              style={styles.toolButton(historyIndex >= history.length - 1)}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="다시 실행 (Ctrl+Y)"
            >
              <span>↪️</span> <span className="editor-tool-btn-label">다시 실행</span>
            </button>
            <button
              className="editor-tool-btn"
              style={styles.toolButton(placedStickers.length === 0)}
              onClick={resetCanvas}
              disabled={placedStickers.length === 0}
            >
              <span>🗑️</span> <span className="editor-tool-btn-label">초기화</span>
            </button>
          </div>

          <div style={styles.toolbarRight}>
            <div className="editor-save-status" style={styles.saveStatus}>
              <div style={styles.saveStatusDot(saveStatus)} />
              <span>{getSaveStatusText()}</span>
            </div>
            <Button className="editor-cancel-btn" variant="secondary" onClick={() => navigate(-1)}>
              취소
            </Button>
            <Button onClick={() => handleSave()} disabled={saveStatus === SaveStatus.SAVING}>
              {saveStatus === SaveStatus.SAVING ? '저장 중...' : '💾 저장 (Ctrl+S)'}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div style={styles.canvasWrapper}>
          <div id="diary-canvas" className="editor-canvas" ref={canvasRef} style={styles.canvas} onClick={handleCanvasClick}>
            {/* Guide Lines */}
            {showGuides && guideLines.x !== null && (
              <div style={styles.guideLine('vertical', guideLines.x)} />
            )}
            {showGuides && guideLines.y !== null && (
              <div style={styles.guideLine('horizontal', guideLines.y)} />
            )}

            {/* Date Header */}
            <div style={styles.canvasHeader}>
              <span style={styles.dateText}>{formattedDate}</span>
              <span style={styles.dayText}>{weekday}</span>
            </div>

            {/* Memo Area */}
            <div style={styles.canvasContent}>
              <textarea
                style={styles.memoArea}
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                  setSaveStatus(SaveStatus.UNSAVED);
                }}
                placeholder="오늘 읽은 웹툰이나 감상을 적어보세요..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Placed Stickers */}
            {[...placedStickers]
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((sticker) => (
                <div
                  key={sticker.id}
                  style={styles.placedSticker(sticker, selectedSticker === sticker.id)}
                  onMouseDown={(e) => handleMouseDown(e, sticker.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSticker(sticker.id);
                  }}
                >
                  {sticker.emoji}
                </div>
              ))}

            {/* Placed Cards (웹툰/웹소설 카드) */}
            {[...placedCards]
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((placedCard) => (
                <div
                  key={placedCard.id}
                  className={`placed-card ${selectedCard === placedCard.id ? 'placed-card--selected' : ''} ${flippedCards[placedCard.id] ? 'placed-card--flipped' : ''}`}
                  style={{
                    position: 'absolute',
                    left: placedCard.x,
                    top: placedCard.y,
                    transform: `rotate(${placedCard.rotation || 0}deg) scale(${placedCard.scale || 0.6})`,
                    zIndex: placedCard.zIndex || 100,
                    cursor: isDraggingCard ? 'grabbing' : 'grab',
                    transition: isDraggingCard ? 'none' : 'box-shadow 0.2s ease',
                  }}
                  onMouseDown={(e) => handleCardMouseDown(e, placedCard.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardSelect(placedCard.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleCardDoubleClick(placedCard.id);
                  }}
                >
                  <div className="placed-card__inner">
                    {/* 앞면 */}
                    <div className="placed-card__front">
                      <div className="placed-card__cover">
                        {placedCard.cardData?.coverImage ? (
                          <img src={placedCard.cardData.coverImage} alt={placedCard.cardData.title} />
                        ) : (
                          <div className="placed-card__cover-placeholder">📚</div>
                        )}
                      </div>
                      <div className="placed-card__title">{placedCard.cardData?.title}</div>
                    </div>
                    {/* 뒷면 */}
                    <div className="placed-card__back">
                      <h4>{placedCard.cardData?.title}</h4>
                      <p className="placed-card__author">{placedCard.cardData?.author}</p>
                      <p className="placed-card__genre">{placedCard.cardData?.genre?.join(', ')}</p>
                      <p className="placed-card__desc">{placedCard.cardData?.description}</p>
                      <button
                        className="placed-card__comment-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCommentModal(placedCard);
                        }}
                      >
                        💬 댓글 {(comments[placedCard.cardId] || []).length}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Tablet: floating button to open right sidebar overlay */}
        <button
          className="editor-tablet-properties-btn"
          onClick={() => setTabletRightOpen(!tabletRightOpen)}
          title="속성 패널"
        >
          ⚙️
        </button>
      </div>

      {/* Right Sidebar */}
      <div className={`editor-right-sidebar ${tabletRightOpen ? 'editor-right-sidebar--open' : ''}`} style={styles.rightSidebar}>
        {/* Close button for tablet overlay */}
        <button
          className="editor-right-sidebar-close"
          onClick={() => setTabletRightOpen(false)}
        >
          ✕
        </button>

        <div style={styles.sectionTitle}>
          <span>⚙️</span> 속성 조절
        </div>

        {selectedStickerData ? (
          <>
            {/* Preview */}
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#FAF7F2', borderRadius: '12px' }}>
              <div style={{
                fontSize: selectedStickerData.isText ? '24px' : '48px',
                fontFamily: selectedStickerData.isText ? 'var(--font-handwriting)' : 'inherit',
                fontWeight: selectedStickerData.isText ? '700' : '400',
                marginBottom: '8px',
              }}>
                {selectedStickerData.emoji}
              </div>
              <div style={{ fontSize: '13px', color: '#5D4E3C', fontWeight: '500' }}>
                {selectedStickerData.isText ? '텍스트 스티커' : '이모지 스티커'}
              </div>
            </div>

            {/* Rotation */}
            <div style={styles.propertySection}>
              <div style={styles.propertyLabel}>
                <span>🔄 회전</span>
                <span style={styles.propertyValue}>{selectedStickerData.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedStickerData.rotation}
                onChange={(e) => updateStickerProperty('rotation', parseInt(e.target.value))}
              />
            </div>

            {/* Scale */}
            <div style={styles.propertySection}>
              <div style={styles.propertyLabel}>
                <span>📐 크기</span>
                <span style={styles.propertyValue}>{selectedStickerData.scale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={selectedStickerData.scale}
                onChange={(e) => updateStickerProperty('scale', parseFloat(e.target.value))}
              />
            </div>

            {/* zIndex */}
            <div style={styles.propertySection}>
              <div style={styles.propertyLabel}>
                <span>📚 레이어</span>
                <span style={styles.propertyValue}>z: {selectedStickerData.zIndex || 0}</span>
              </div>
              <div style={styles.zIndexButtons}>
                <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={sendToBack}>맨 뒤로</button>
                <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={() => changeZIndex(-1)}>뒤로</button>
                <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={() => changeZIndex(1)}>앞으로</button>
                <button className="editor-tool-btn" style={styles.zIndexBtn} onClick={bringToFront}>맨 앞으로</button>
              </div>
            </div>

            {/* Position */}
            <div style={styles.propertySection}>
              <div style={styles.propertyLabel}>
                <span>📍 위치</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8B7E6A' }}>
                X: {Math.round(selectedStickerData.x)}px, Y: {Math.round(selectedStickerData.y)}px
              </div>
            </div>

            {/* Delete */}
            <button className="editor-tool-btn" style={styles.deleteButton} onClick={deleteSelectedSticker}>
              <span>🗑️</span> 삭제 (Delete)
            </button>
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👆</div>
            <div style={styles.emptyText}>
              스티커를 선택하면<br />여기서 편집할 수 있어요
            </div>
          </div>
        )}

        {/* Layer List */}
        <div>
          <div style={styles.sectionTitle}>
            <span>📚</span> 레이어
          </div>
          {placedStickers.length > 0 ? (
            <div style={styles.layerList}>
              {[...placedStickers]
                .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                .map((sticker, idx) => (
                  <div
                    key={sticker.id}
                    style={styles.layerItem(selectedSticker === sticker.id)}
                    onClick={() => setSelectedSticker(sticker.id)}
                  >
                    <span style={styles.layerEmoji}>{sticker.emoji}</span>
                    <span style={styles.layerName}>{sticker.isText ? '텍스트' : '스티커'}</span>
                    <span style={styles.layerIndex}>z:{sticker.zIndex || 0}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#B8AFA0', textAlign: 'center', padding: '20px' }}>
              아직 스티커가 없어요
            </div>
          )}
        </div>
      </div>

      {/* Tablet overlay backdrop */}
      {tabletRightOpen && (
        <div
          className="editor-tablet-overlay-backdrop"
          onClick={() => setTabletRightOpen(false)}
        />
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="editor-mobile-bottom-bar">
        <button
          className={`editor-mobile-tab ${mobileTab === 'cards' ? 'editor-mobile-tab--active' : ''}`}
          onClick={() => handleMobileTabClick('cards')}
        >
          <span className="editor-mobile-tab-icon">📚</span>
          <span className="editor-mobile-tab-label">카드</span>
        </button>
        <button
          className={`editor-mobile-tab ${mobileTab === 'stickers' ? 'editor-mobile-tab--active' : ''}`}
          onClick={() => handleMobileTabClick('stickers')}
        >
          <span className="editor-mobile-tab-icon">🎨</span>
          <span className="editor-mobile-tab-label">스티커</span>
        </button>
        <button
          className={`editor-mobile-tab ${mobileTab === 'background' ? 'editor-mobile-tab--active' : ''}`}
          onClick={() => handleMobileTabClick('background')}
        >
          <span className="editor-mobile-tab-icon">🖼️</span>
          <span className="editor-mobile-tab-label">배경</span>
        </button>
        <button
          className={`editor-mobile-tab ${mobileTab === 'settings' ? 'editor-mobile-tab--active' : ''}`}
          onClick={() => handleMobileTabClick('settings')}
        >
          <span className="editor-mobile-tab-icon">⚙️</span>
          <span className="editor-mobile-tab-label">설정</span>
        </button>
        <button
          className={`editor-mobile-tab ${mobileTab === 'properties' ? 'editor-mobile-tab--active' : ''}`}
          onClick={() => handleMobileTabClick('properties')}
        >
          <span className="editor-mobile-tab-icon">📐</span>
          <span className="editor-mobile-tab-label">속성</span>
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`editor-mobile-bottom-sheet ${mobileTab ? 'editor-mobile-bottom-sheet--open' : ''}`}>
        <div className="editor-mobile-bottom-sheet-handle" onClick={() => setMobileTab(null)}>
          <div className="editor-mobile-bottom-sheet-handle-bar" />
        </div>
        <div className="editor-mobile-bottom-sheet-content">
          {renderMobileBottomSheetContent()}
        </div>
      </div>

      {/* Mobile bottom sheet backdrop */}
      {mobileTab && (
        <div
          className="editor-mobile-sheet-backdrop"
          onClick={() => setMobileTab(null)}
        />
      )}

      {/* 댓글 모달 */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setActiveCommentCard(null);
        }}
        title={`💬 ${activeCommentCard?.cardData?.title || '카드'} 댓글`}
      >
        <div className="comment-modal">
          <div className="comment-list">
            {(comments[activeCommentCard?.cardId] || []).length > 0 ? (
              (comments[activeCommentCard?.cardId] || []).map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="comment-empty">
                <span>💬</span>
                <p>아직 댓글이 없어요</p>
              </div>
            )}
          </div>
          <div className="comment-input-area">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="comment-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddComment();
              }}
            />
            <button className="comment-submit" onClick={handleAddComment}>
              등록
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        /* ===== Base hover effects (CSS replaces onMouseEnter/onMouseLeave) ===== */
        .editor-sticker-item:hover {
          background-color: #E8F5F1 !important;
          border-color: #B0E0D2 !important;
          transform: scale(1.1);
        }

        .editor-card-item:hover {
          background-color: #E8F5F1 !important;
          transform: translateX(4px);
        }

        .editor-tool-btn:hover:not(:disabled) {
          background-color: #F0EDE8 !important;
          box-shadow: 0 2px 8px rgba(93,78,60,0.12);
        }

        .editor-category-tab:hover {
          opacity: 0.85;
        }

        /* ===== Placed Card Styles ===== */
        .placed-card {
          width: 120px;
          height: 170px;
          perspective: 800px;
        }

        .placed-card--selected .placed-card__inner {
          box-shadow: 0 0 0 3px #7BC4A8, 0 8px 24px rgba(123, 196, 168, 0.3);
        }

        .placed-card__inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s ease;
          transform-style: preserve-3d;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(93, 78, 60, 0.15);
        }

        .placed-card--flipped .placed-card__inner {
          transform: rotateY(180deg);
        }

        .placed-card__front,
        .placed-card__back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 10px;
          overflow: hidden;
        }

        .placed-card__front {
          background: white;
        }

        .placed-card__cover {
          width: 100%;
          height: 130px;
          overflow: hidden;
        }

        .placed-card__cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placed-card__cover-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #E8E4DF 0%, #D4CFC8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .placed-card__title {
          padding: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #3D3024;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        .placed-card__back {
          background: linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 100%);
          transform: rotateY(180deg);
          padding: 12px;
          display: flex;
          flex-direction: column;
        }

        .placed-card__back h4 {
          font-size: 11px;
          font-weight: 700;
          color: #3D3024;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .placed-card__author {
          font-size: 9px;
          color: #8B7E6A;
          margin: 0 0 6px 0;
        }

        .placed-card__genre {
          font-size: 9px;
          color: #7BC4A8;
          margin: 0 0 6px 0;
        }

        .placed-card__desc {
          font-size: 9px;
          color: #6B5A42;
          line-height: 1.4;
          margin: 0;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .placed-card__comment-btn {
          margin-top: 8px;
          padding: 6px 8px;
          border: none;
          border-radius: 6px;
          background: linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%);
          color: #1D4A3A;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .placed-card__comment-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(123, 196, 168, 0.3);
        }

        /* ===== Comment Modal Styles ===== */
        .comment-modal {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .comment-list {
          max-height: 300px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment-item {
          background: #FAF7F2;
          padding: 12px;
          border-radius: 10px;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .comment-author {
          font-weight: 600;
          color: #3D3024;
          font-size: 13px;
        }

        .comment-date {
          font-size: 11px;
          color: #A89880;
        }

        .comment-text {
          font-size: 14px;
          color: #5D4E3C;
          margin: 0;
          line-height: 1.5;
        }

        .comment-empty {
          text-align: center;
          padding: 40px 20px;
          color: #A89880;
        }

        .comment-empty span {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }

        .comment-empty p {
          margin: 0;
        }

        .comment-input-area {
          display: flex;
          gap: 8px;
        }

        .comment-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #E8E4DF;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
        }

        .comment-input:focus {
          border-color: #7BC4A8;
        }

        .comment-submit {
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #B0E0D2 0%, #7BC4A8 100%);
          color: #1D4A3A;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .comment-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(123, 196, 168, 0.3);
        }

        /* ===== Tablet overlay: right sidebar close button (hidden by default) ===== */
        .editor-right-sidebar-close {
          display: none;
        }

        /* ===== Tablet: properties toggle button (hidden by default) ===== */
        .editor-tablet-properties-btn {
          display: none;
        }

        /* ===== Tablet overlay backdrop (hidden by default) ===== */
        .editor-tablet-overlay-backdrop {
          display: none;
        }

        /* ===== Mobile bottom bar (hidden by default) ===== */
        .editor-mobile-bottom-bar {
          display: none;
        }

        /* ===== Mobile bottom sheet (hidden by default) ===== */
        .editor-mobile-bottom-sheet {
          display: none;
        }

        /* ===== Mobile bottom sheet backdrop (hidden by default) ===== */
        .editor-mobile-sheet-backdrop {
          display: none;
        }

        /* ===================================================
           TABLET BREAKPOINT (max-width: 1024px)
           - Right sidebar collapses, shown as overlay
           =================================================== */
        @media (max-width: 1024px) {
          .editor-right-sidebar {
            position: fixed !important;
            top: 70px;
            right: 0;
            bottom: 0;
            width: 280px !important;
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: -4px 0 24px rgba(93,78,60,0.15);
          }

          .editor-right-sidebar--open {
            transform: translateX(0);
          }

          .editor-right-sidebar-close {
            display: block;
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            border: none;
            background: #F5F2ED;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            color: #5D4E3C;
            z-index: 10;
            line-height: 1;
          }

          .editor-right-sidebar-close:hover {
            background: #E8E4DF;
          }

          .editor-tablet-properties-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: #FFFFFF;
            box-shadow: 0 4px 16px rgba(93,78,60,0.15);
            font-size: 20px;
            cursor: pointer;
            z-index: 100;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .editor-tablet-properties-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(93,78,60,0.2);
          }

          .editor-tablet-overlay-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.3);
            z-index: 1999;
          }

          .editor-toolbar {
            flex-wrap: wrap;
            gap: 8px;
          }

          .editor-tool-btn-label {
            display: none;
          }

          .editor-save-status span {
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        /* ===================================================
           MOBILE BREAKPOINT (max-width: 640px)
           - Hide left & right sidebars entirely
           - Show bottom tab bar + bottom sheet
           - Canvas responsive
           =================================================== */
        @media (max-width: 640px) {
          .editor-container {
            flex-direction: column !important;
            height: 100vh !important;
            height: 100dvh !important;
            padding-bottom: 56px;
          }

          .editor-left-sidebar {
            display: none !important;
          }

          .editor-right-sidebar {
            display: none !important;
          }

          .editor-tablet-properties-btn {
            display: none !important;
          }

          .editor-tablet-overlay-backdrop {
            display: none !important;
          }

          .editor-main {
            padding: 12px !important;
            flex: 1;
            min-height: 0;
          }

          /* Toolbar mobile adjustments */
          .editor-toolbar {
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 10px !important;
          }

          .editor-tool-btn-label {
            display: none;
          }

          .editor-cancel-btn {
            display: none;
          }

          .editor-save-status {
            padding: 4px 8px !important;
            font-size: 11px !important;
          }

          /* Canvas responsive */
          .editor-canvas {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 3 / 4;
            max-height: calc(100vh - 200px);
            max-height: calc(100dvh - 200px);
          }

          /* ===== Mobile Bottom Tab Bar ===== */
          .editor-mobile-bottom-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: #FFFFFF;
            border-top: 1px solid #E8E4DF;
            z-index: 3000;
            align-items: center;
            justify-content: space-around;
            padding: 0 8px;
            box-shadow: 0 -2px 12px rgba(93,78,60,0.08);
          }

          .editor-mobile-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            border: none;
            background: none;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 8px;
            transition: all 0.2s ease;
            color: #8B7E6A;
            min-width: 56px;
          }

          .editor-mobile-tab--active {
            color: #2D5A4A;
            background: #E8F5F1;
          }

          .editor-mobile-tab:hover {
            background: #F5F2ED;
          }

          .editor-mobile-tab--active:hover {
            background: #E8F5F1;
          }

          .editor-mobile-tab-icon {
            font-size: 20px;
            line-height: 1;
          }

          .editor-mobile-tab-label {
            font-size: 10px;
            font-weight: 500;
          }

          /* ===== Mobile Bottom Sheet ===== */
          .editor-mobile-bottom-sheet {
            display: block;
            position: fixed;
            bottom: 56px;
            left: 0;
            right: 0;
            max-height: 40vh;
            background: #FFFFFF;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            box-shadow: 0 -4px 24px rgba(93,78,60,0.15);
            z-index: 2999;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            overflow: hidden;
          }

          .editor-mobile-bottom-sheet--open {
            transform: translateY(0);
          }

          .editor-mobile-bottom-sheet-handle {
            display: flex;
            justify-content: center;
            padding: 10px 0 6px;
            cursor: pointer;
          }

          .editor-mobile-bottom-sheet-handle-bar {
            width: 36px;
            height: 4px;
            background: #D4CFC8;
            border-radius: 2px;
          }

          .editor-mobile-bottom-sheet-content {
            padding: 8px 20px 20px;
            overflow-y: auto;
            max-height: calc(40vh - 30px);
          }

          /* ===== Mobile sheet backdrop ===== */
          .editor-mobile-sheet-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            bottom: 56px;
            background: rgba(0,0,0,0.2);
            z-index: 2998;
          }
        }
      `}</style>
    </div>
  );
}
