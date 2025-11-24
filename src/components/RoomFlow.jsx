import { useState, useEffect, useRef } from "react";

// Render 서버 사용
const API_BASE = "https://word-chain-server.onrender.com/api";

// GitHub Pages 배포를 위한 base URL 처리
const BASE_URL = import.meta.env.BASE_URL;
const BASE_PATH = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';

// ===== 한/일 UI 텍스트 =====
const KO_TEXT = {
  // 공통/헤더
  uiToggleToJa: "🌐 日本語",
  uiToggleToKo: "🌐 한국어",

  // 국적 선택 단계
  selectTitle: "국적 선택",
  selectDesc: "한국인인지 일본인인지 선택해주세요.",
  btnKorean: "한국인",
  btnJapanese: "日本人",

  // 방 리스트 단계
  myNationLabel: "내 국적",
  btnChangeNation: "변경",
  roomListTitle: "방 목록",
  btnRefresh: "새로고침",
  noRooms: "아직 만들어진 방이 없습니다.",
  createRoomTitle: "새 방 만들기",
  createRoomBtn: "방 만들기",

  // 방/방 안 정보 라벨
  roomNameLabel: "방 이름",
  roleLabel: "역할",
  roomStatusLabel: "방 상태",
  roomWaitingLabel: "대기 중",

  // 방 입장/생성 관련
  enterRoomTitle: "방 입장",
  selectedRoomLabel: "선택한 방",
  thisIsOppNationRoom: "이 방은 상대 국적의 방입니다.",
  inputPasswordPlaceholder: "비밀번호를 입력하세요",
  btnEnter: "입장",
  noPasswordRoom: "이 방은 비밀번호가 없습니다.",
  btnEnterDirect: "바로 입장",
  roomTitlePlaceholder: "방 제목 (최대 10글자)",
  roomPasswordPlaceholder: "비밀번호 (숫자 4자리 이내, 선택)",

  // 게임
  currentWord: "현재 단어",
  myTime: "내 남은 시간",
  oppTime: "상대 남은 시간",
  turn: "턴",
  myTurn: "내 턴",
  oppTurn: "상대 턴",
  history: "히스토리",
  noHistory: "아직 나온 단어가 없습니다.",
  nextCharKo: "이어야 할 글자 (한국어)",
  nextCharJa: "이어야 할 글자 (일본어)",
  waitingHost: "방장이 게임을 시작하기를 기다리는 중...",
  waitingGuest: "상대방 기다리는 중...",
  startGame: "게임 시작 (방장 전용)",
  inputPlaceholder: "단어를 입력하세요",
  submitLabel: "제출",
  gameOver: "게임 종료",
  winner: "승자",
  leaveRoom: "방 나가기",

  // 규칙 보기
  showRules: "규칙 보기",
  close: "닫기",
};

const JA_TEXT = {
  // 공통/헤더
  uiToggleToJa: "🌐 日本語",
  uiToggleToKo: "🌐 한국어",

  // 국적 선택 단계
  selectTitle: "国籍を選択",
  selectDesc: "韓国人か日本人かを選んでください。",
  btnKorean: "한국인",
  btnJapanese: "日本人",

  // 방 리스트 단계
  myNationLabel: "自分の国籍",
  btnChangeNation: "変更",
  roomListTitle: "部屋リスト",
  btnRefresh: "更新",
  noRooms: "まだ部屋がありません。",
  createRoomTitle: "新しい部屋を作成",
  createRoomBtn: "部屋作成",

  // 방/방 안 정보 라벨
  roomNameLabel: "部屋名",
  roleLabel: "役割",
  roomStatusLabel: "部屋状態",
  roomWaitingLabel: "待機中",

  // 방 입장/생성 관련
  enterRoomTitle: "部屋に入る",
  selectedRoomLabel: "選択した部屋",
  thisIsOppNationRoom: "この部屋は相手の国籍の部屋です。",
  inputPasswordPlaceholder: "パスワードを入力してください",
  btnEnter: "入室",
  noPasswordRoom: "この部屋にはパスワードがありません。",
  btnEnterDirect: "すぐ入室",
  roomTitlePlaceholder: "部屋名（最大10文字）",
  roomPasswordPlaceholder:
    "パスワード（数字4桁まで、未入力でも可）",

  // 게임
  currentWord: "現在の単語",
  myTime: "自分の残り時間",
  oppTime: "相手の残り時間",
  turn: "ターン",
  myTurn: "自分のターン",
  oppTurn: "相手のターン",
  history: "履歴",
  noHistory: "まだ単語がありません。",
  nextCharKo: "次の頭文字（韓国語）",
  nextCharJa: "次の頭文字（日本語）",
  waitingHost: "ホストがゲームを開始するのを待っています…",
  waitingGuest: "相手を待っています…",
  startGame: "ゲーム開始（ホストのみ）",
  inputPlaceholder: "単語を入力してください",
  submitLabel: "送信",
  gameOver: "ゲーム終了",
  winner: "勝者",
  leaveRoom: "部屋から退出",

  // 규칙 보기
  showRules: "ルールを見る",
  close: "閉じる",
};

// ===== 힌트 계산 유틸 =====

// 한국어: 마지막 글자 1개
const getKoreanNextChar = (word) => {
  if (!word) return null;
  const trimmed = word.trim();
  if (!trimmed) return null;
  return trimmed[trimmed.length - 1];
};

// 일본어: 장음/촉음/복합음 규칙
const isKana = (ch) => !!ch && /[ぁ-ゟ゠-ヿー]/.test(ch);

const SOKUON = "っッ"; // 촉음
const LONG_MARK = "ー"; // 장음 기호

// 작은 가나 → 큰 가나 매핑
const SMALL_TO_BIG = {
  "ゃ": "や",
  "ゅ": "ゆ",
  "ょ": "よ",
  "ャ": "ヤ",
  "ュ": "ユ",
  "ョ": "ヨ",
  "ぁ": "あ",
  "ぃ": "い",
  "ぅ": "う",
  "ぇ": "え",
  "ぉ": "お",
  "ァ": "ア",
  "ィ": "イ",
  "ゥ": "ウ",
  "ェ": "エ",
  "ォ": "オ",
  "ゎ": "わ",
  "ヮ": "ワ",
};

const getJapaneseNextChar = (word) => {
  if (!word) return null;

  // 가나만 추출
  const kanaOnly = word.replace(/[^ぁ-ゟ゠-ヿー]/g, "");
  const trimmed = kanaOnly.trim();
  const len = trimmed.length;
  if (len === 0) return null;

  const last = trimmed[len - 1];

  // 1) 장음: 바로 앞 문자로 잇기
  if (last === LONG_MARK) {
    const base = len >= 2 ? trimmed[len - 2] : null;
    return isKana(base) ? base : null;
  }

  // 2) 촉음: っ / ッ 그대로 잇기
  if (SOKUON.includes(last)) {
    return last;
  }

  // 3) 복합음: 작은 가나는 대응하는 큰 가나로 (しゃ → や)
  if (SMALL_TO_BIG[last]) {
    return SMALL_TO_BIG[last];
  }

  // 4) 그 외: 마지막 가나 그대로
  return isKana(last) ? last : null;
};

// 게임 종료 사유(한국어)를 일본어 UI에서 보여줄 때의 매핑
const translateWinnerReasonToJa = (reason) => {
  if (!reason) return "";
  const map = {
    "시간 초과": "時間切れ",
    "규칙 위반": "ルール違反",
    "사전에 없는 단어": "辞書にない単語",
  };
  return map[reason] || reason;
};

export default function RoomFlow() {
  // 1 = 국적 선택, 2 = 방 리스트, 3 = 방 안
  const [step, setStep] = useState(1);

  // UI 언어: "ko" | "ja"
  const [language, setLanguage] = useState("ko");
  // 서버용 플레이어 타입: "korean" | "japanese"
  const [playerType, setPlayerType] = useState(null);
  const [userId, setUserId] = useState(null);

  // 규칙 팝업
  const [showRules, setShowRules] = useState(false);

  // 방 목록 / 선택
  const [rooms, setRooms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [roomTitleInput, setRoomTitleInput] = useState("");
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [titleError, setTitleError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinPasswordInput, setJoinPasswordInput] = useState("");

  // 현재 들어간 방
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const prevGuestIdRef = useRef(null);
  const prevRoomStatusRef = useRef(null);
  const rulesScrollRef = useRef(null);
  const rulesScrollTopRef = useRef(0);

  // 방 안 상태: waiting / playing / finished
  const [roomStage, setRoomStage] = useState("waiting");

  // 게임 상태
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [inputWord, setInputWord] = useState("");

  // 중복 입력 방지용 플래그들
  const [isCreatingRoomRequest, setIsCreatingRoomRequest] = useState(false);
  const [isJoiningRoomRequest, setIsJoiningRoomRequest] = useState(false);
  const [isStartingGameRequest, setIsStartingGameRequest] = useState(false);
  const [isSubmittingWordRequest, setIsSubmittingWordRequest] = useState(false);

  // 모바일 뷰 여부 (간단한 브레이크포인트)
  const [isMobile, setIsMobile] = useState(false);
  
  // 서버 기동 안내 표시 여부 (처음 로드시에만 표시)
  const [showServerNotice, setShowServerNotice] = useState(true);

  // ===== 공통 유틸 =====
  const getPlayerTypeLabel = (type) => {
    if (type === "korean")
      return language === "ja" ? "韓国人" : "한국인";
    if (type === "japanese")
      return language === "ja" ? "日本人" : "일본인";
    return language === "ja" ? "不明" : "알 수 없음";
  };

  const resetGameStateAll = () => {
    setGameId(null);
    setGameState(null);
    setRoomStage("waiting");
    setInputWord("");
  };

  const resetRoomAndGame = () => {
    setCurrentRoom(null);
    setRoomInfo(null);
    setIsHost(false);
    resetGameStateAll();
  };

  const T = language === "ko" ? KO_TEXT : JA_TEXT;

  // ===== 1. 국적 선택 & 로그인 =====
  const handleSelectLanguage = async (lang) => {
    setLanguage(lang);
    const type = lang === "ko" ? "korean" : "japanese";

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerType: type }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "로그인 실패");
        return;
      }

      setPlayerType(data.playerType);
      setUserId(data.userId);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("서버 연결 실패 (로그인)");
    }
  };

  // ===== 뷰포트 변화 감지 (모바일 여부) =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== 규칙 모달 스크롤 위치 저장 (강제 복원은 하지 않음) =====
  useEffect(() => {
    if (!showRules) return;
    const el = rulesScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      rulesScrollTopRef.current = el.scrollTop;
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [showRules]);

  const handleChangeLanguageAll = () => {
    setStep(1);
    setPlayerType(null);
    setUserId(null);
    setRooms([]);
    resetRoomAndGame();
    setIsCreating(false);
    setRoomTitleInput("");
    setRoomPasswordInput("");
    setTitleError("");
    setPasswordError("");
    // 언어는 그대로 유지
  };

  const handleToggleUiLanguage = () => {
    setLanguage((prev) => (prev === "ko" ? "ja" : "ko"));
  };

  // ===== 2. 방 목록 =====
  const fetchRooms = async () => {
    if (!playerType) return;
    try {
      const res = await fetch(
        `${API_BASE}/rooms?playerType=${encodeURIComponent(playerType)}`
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "방 목록 불러오기 실패");
        return;
      }
      setRooms(data);
      // 방 목록을 성공적으로 불러왔으면 서버 안내 박스 숨김
      setShowServerNotice(false);
    } catch (e) {
      console.error(e);
      alert("방 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    if (step === 2 && playerType) {
      fetchRooms();
    }
  }, [step, playerType]);

  const handleRefreshRooms = () => {
    fetchRooms();
  };

  // ===== 방 만들기 =====
  const handleToggleCreateRoom = () => {
    setIsCreating((prev) => !prev);
  };

  const handleRoomTitleChange = (e) => {
    const value = e.target.value;
    setRoomTitleInput(value);
    const length = value.trim().length;
    if (length > 10) {
      setTitleError(`제목은 최대 10글자까지 가능합니다. (현재 ${length}글자)`);
    } else {
      setTitleError("");
    }
  };

  const handleRoomPasswordChange = (e) => {
    const value = e.target.value;
    setRoomPasswordInput(value);
    if (value && !/^[0-9]*$/.test(value)) {
      setPasswordError("비밀번호는 숫자만 입력 가능합니다.");
    } else if (value.length > 4) {
      setPasswordError("비밀번호는 최대 4자리까지 가능합니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleCreateRoom = async () => {
    if (isCreatingRoomRequest) return;

    const trimmedTitle = roomTitleInput.trim();
    const password = roomPasswordInput;

    if (!trimmedTitle) {
      alert("방 제목을 입력해주세요.");
      return;
    }
    if (trimmedTitle.length > 10) {
      alert("제목은 최대 10글자까지 가능합니다.");
      return;
    }
    if (password) {
      if (!/^[0-9]+$/.test(password) || password.length > 4) {
        alert("비밀번호는 숫자만, 최대 4자리까지 가능합니다.");
        return;
      }
    }
    if (!userId || !playerType) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    setIsCreatingRoomRequest(true);
    try {
      const res = await fetch(`${API_BASE}/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          playerType,
          roomName: trimmedTitle,
          password: password || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "방 생성 실패");
        return;
      }

      const newRoom = {
        roomId: data.roomId,
        roomName: trimmedTitle,
        creatorType: playerType,
        hasPassword: !!password,
      };

      setCurrentRoom(newRoom);
      setIsHost(true);
      setIsCreating(false);
      setRoomTitleInput("");
      setRoomPasswordInput("");
      setTitleError("");
      setPasswordError("");
      resetGameStateAll();
      setStep(3);
    } catch (e) {
      console.error(e);
      alert("서버 오류 (방 생성)");
    } finally {
      setIsCreatingRoomRequest(false);
    }
  };

  // ===== 방 입장 =====
  const handleSelectRoomForJoin = (room) => {
    // 이미 선택된 방을 다시 클릭하면 선택 해제
    if (selectedRoom?.roomId === room.roomId) {
      setSelectedRoom(null);
      setJoinPasswordInput("");
    } else {
      setSelectedRoom(room);
      setJoinPasswordInput("");
    }
  };

  const handleJoinRoom = async () => {
    if (isJoiningRoomRequest) return;
    if (!selectedRoom) return;
    if (!userId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    setIsJoiningRoomRequest(true);
    try {
      const res = await fetch(`${API_BASE}/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom.roomId,
          userId,
          password: joinPasswordInput || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "입장 실패");
        return;
      }

      setCurrentRoom(selectedRoom);
      setIsHost(false);
      setSelectedRoom(null);
      setJoinPasswordInput("");
      resetGameStateAll();
      setStep(3);
    } catch (e) {
      console.error(e);
      alert("서버 오류 (방 입장)");
    } finally {
      setIsJoiningRoomRequest(false);
    }
  };

  const handleLeaveRoom = () => {
    resetRoomAndGame();
    setStep(2);
  };

  // ===== 3. 방 정보 폴링 =====
  useEffect(() => {
    if (step !== 3 || !currentRoom) {
      // 방에서 완전히 나갔을 때만 상태를 정리
      setRoomInfo(null);
      prevGuestIdRef.current = null;
      prevRoomStatusRef.current = null;
      return;
    }

    // 규칙 모달을 보고 있을 때는 방 폴링을 잠시 멈춰
    // 불필요한 리렌더링으로 인한 스크롤 튐을 막는다.
    if (showRules) {
      return;
    }

    const roomId = currentRoom.roomId;
    let stopped = false;

    const pollRoom = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${roomId}`);

        // ===== 상황 1: 방장이 나가서 방이 없어진 경우 =====
        // 서버에서 실제로 HTTP 404를 주지만, 방 정보 조회 실패(404 포함) 전체를
        // "방이 해산됨"으로 처리하면, 상태코드에 관계없이 항상 사용자 화면에 반영됨.
        if (!res.ok) {
          // 아직 게임을 시작하지 않은 대기 상태에서만 알림/로비 이동 처리
          const shouldAlertAndLeave =
            !stopped && !gameId && roomStage === "waiting";
          if (shouldAlertAndLeave) {
            alert("방장이 퇴장하여 방이 해산되었습니다.");
            window.location.href = BASE_PATH;
          }
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          console.error(data.error || "방 정보 조회 실패");
          return;
        }
        if (stopped) return;

        // ===== 상황 2: 게스트가 나가서 방이 빈 경우 (방장 화면) =====
        const prevGuestId = prevGuestIdRef.current;
        const currentGuestId = data.guestId ?? null;

        // 게스트가 없었다가(null) 새로 들어온 경우 (방장에게 입장 알림음)
        if (!stopped && isHost && !prevGuestId && currentGuestId) {
          try {
            // public/sounds/enter.mp3 에 위치한 효과음 재생
            const audio = new Audio(`${BASE_PATH}sounds/enter.mp3`);
            audio.play().catch((err) => {
              console.error("입장 알림음 재생 실패:", err);
            });
          } catch (err) {
            console.error("입장 알림음 초기화 실패:", err);
          }
        }

        if (
          !stopped &&
          isHost &&
          prevGuestId &&
          !currentGuestId &&
          !gameId && // 게임 시작 전 대기 상태에서만 처리
          roomStage === "waiting"
        ) {
          // 게스트가 나간 경우 (방장 화면) - 알림 후 다시 대기
          alert("게스트가 나갔습니다. 다시 대기합니다.");
          resetGameStateAll();
          setRoomStage("waiting");
        }
        prevGuestIdRef.current = currentGuestId;

        // ===== 방 상태가 waiting 으로 바뀐 경우 (게스트 화면에서 방 나가기) =====
        const prevStatus = prevRoomStatusRef.current;
        const currentStatus = data.status ?? null;
        if (
          !stopped &&
          !isHost &&
          prevStatus &&
          prevStatus !== "waiting" &&
          currentStatus === "waiting" &&
          !gameId // 게임이 연결되기 전(대기 방)에서만 처리
        ) {
          // 방 상태가 다시 waiting 이 된 경우 (게스트 화면) - 알림 후 로비로 이동
          alert("방 상태가 대기 상태로 변경되어 로비로 이동합니다.");
          resetRoomAndGame();
          setStep(2);
          prevRoomStatusRef.current = currentStatus;
          return;
        }
        prevRoomStatusRef.current = currentStatus;

        setRoomInfo(data);

        if (data.gameId && !gameId) {
          setGameId(data.gameId);
          setRoomStage("playing");
        }
      } catch (e) {
        if (!stopped) console.error("방 폴링 실패:", e);
      }
    };

    pollRoom();
    const intervalId = setInterval(pollRoom, 1000);

    return () => {
      stopped = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentRoom?.roomId, roomStage, isHost, showRules]);

  // ===== 게임 시작 (1판) =====
  const handleGameStart = async () => {
    if (isStartingGameRequest) return;
    if (!currentRoom || !userId || !playerType) return;
    if (!isHost) return;

    const roomId = currentRoom.roomId;

    setIsStartingGameRequest(true);
    try {
      const roomRes = await fetch(`${API_BASE}/rooms/${roomId}`);
      const roomData = await roomRes.json();
      if (!roomRes.ok) {
        alert(roomData.error || "방 정보 조회 실패");
        return;
      }

      if (!roomData.guestId) {
        alert("아직 상대가 입장하지 않았습니다.");
        return;
      }

      const koreanPlayerId =
        roomData.creatorType === "korean"
          ? roomData.creatorId
          : roomData.guestId;
      const japanesePlayerId =
        roomData.creatorType === "japanese"
          ? roomData.creatorId
          : roomData.guestId;

      const gameRes = await fetch(`${API_BASE}/games/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          koreanPlayerId,
          japanesePlayerId,
        }),
      });

      const gameData = await gameRes.json();
      if (!gameRes.ok) {
        alert(gameData.error || "게임 시작 실패");
        return;
      }

      await fetch(`${API_BASE}/rooms/${roomId}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: gameData.gameId }),
      });

      setGameId(gameData.gameId);
      setGameState(gameData.gameData);
      setRoomStage("playing");
    } catch (e) {
      console.error(e);
      alert("서버 오류 (게임 시작)");
    } finally {
      setIsStartingGameRequest(false);
    }
  };

  // ===== 게임 상태 폴링 =====
  useEffect(() => {
    // 규칙 모달을 보고 있을 때는 게임 상태 폴링을 잠시 멈춰
    // 불필요한 리렌더링과 스크롤 튐 현상을 방지한다.
    if (!gameId || roomStage !== "playing" || !playerType || showRules) return;

    let stopped = false;

    const pollGame = async () => {
      try {
        const url = `${API_BASE}/games/${gameId}/status?${
          playerType ? `playerType=${encodeURIComponent(playerType)}` : ""
        }`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error || "게임 상태 조회 실패");
          return;
        }
        if (stopped) return;

        setGameState(data);

        if (data.status === "finished") {
          // 게임 종료 UI로 전환 (알림창 대신 프론트 UI에서 표시)
          setRoomStage("finished");
        }
      } catch (e) {
        if (!stopped) console.error("게임 상태 폴링 실패:", e);
      }
    };

    pollGame();
    const intervalId = setInterval(pollGame, 1000);

    return () => {
      stopped = true;
      clearInterval(intervalId);
    };
  }, [gameId, roomStage, playerType, showRules]);

  // ===== 파생 값 (표시용) =====
  const myTime =
    gameState && playerType && gameState.timers
      ? Math.max(0, Math.floor(gameState.timers[playerType] ?? 0))
      : null;

  const oppType =
    playerType === "korean"
      ? "japanese"
      : playerType === "japanese"
      ? "korean"
      : null;

  const oppTime =
    gameState && oppType && gameState.timers
      ? Math.max(0, Math.floor(gameState.timers[oppType] ?? 0))
      : null;

  const isMyTurn = gameState?.currentTurn === playerType;

  const winnerType = gameState?.winner;
  const winnerLabel =
    winnerType == null
      ? ""
      : winnerType === playerType
      ? (language === "ja" ? "自分" : "나")
      : winnerType === "korean"
      ? language === "ja"
        ? "韓国人"
        : "한국인"
      : language === "ja"
      ? "日本人"
      : "일본인";

  const timerUnit = language === "ja" ? "秒" : "초";

  const winnerReasonRaw = gameState?.winnerReason;
  const winnerReasonText =
    winnerReasonRaw &&
    (language === "ja"
      ? `理由: ${translateWinnerReasonToJa(winnerReasonRaw)}`
      : `사유: ${winnerReasonRaw}`);

  const nextKoChar = getKoreanNextChar(gameState?.currentWord?.ko);
  const nextJaChar = getJapaneseNextChar(gameState?.currentWord?.ja || "");

  const showKoHint = gameState?.currentTurn === "korean";
  const showJaHint = gameState?.currentTurn === "japanese";

  const hintColumnCount =
    showKoHint && showJaHint ? 2 : showKoHint || showJaHint ? 1 : 0;

  // ===== 단어 제출 =====
  const handleSubmitWord = async (e) => {
    e.preventDefault();
    if (isSubmittingWordRequest) return;
    const word = inputWord.trim();
    if (!word || !gameId || !gameState) return;
    if (roomStage !== "playing") return;

    if (gameState.currentTurn !== playerType) {
      alert("지금은 내 턴이 아닙니다.");
      return;
    }

    setIsSubmittingWordRequest(true);
    try {
      const res = await fetch(`${API_BASE}/games/${gameId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          playerType,
          word,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "단어 제출 실패");
        return;
      }

      setInputWord("");
      setGameState(data.gameData);

      if (data.gameData.status === "finished") {
        setRoomStage("finished");
      }
    } catch (e) {
      console.error(e);
      alert("서버 오류 (단어 제출)");
    } finally {
      setIsSubmittingWordRequest(false);
    }
  };

  // ===== 스타일 =====
  const pageStyle = {
    maxWidth: "900px",
    margin: "20px auto",
    padding: "0 12px",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#111827",
  };

  const cardStyle = {
    border: "1px solid #d1d5db",
    padding: "16px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.06)",
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f3f4f6",
    cursor: "pointer",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
    color: "white",
  };

  const inputStyle = {
    padding: "8px",
    width: "100%",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  };

  const closeIconStyle = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 4px",
    color: "#6b7280",
  };

  // ===== 규칙 팝업 내용 (한/일 버전) =====
  const renderRulesContent = () => {
    if (language === "ja") {
      // 일본어 설명
      return (
        <div>
          {/* 상단 제목은 RulesModal 헤더에서 공통으로 표시 */}
          {/* 1. 基本説明 */}
          <div
            style={{
              marginBottom: "6px",
              padding: "4px 10px 6px",
              borderRadius: "8px",
              backgroundColor: "#fff7ed", // 더 옅은 따뜻한 노랑
            }}
          >
            <p
              style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
            >
              1. 基本説明
            </p>
            <p style={{ fontSize: "12px", margin: 0 }}>
              1-1. このゲームは韓国人と日本人が1対1で対戦するしりとりゲームです。
              <br />
              1-2. 韓国人は韓国語の単語、日本人は日本語の単語を使います。
              <br />
              1-3. ゲーム開始時に、韓国語と日本語のランダムな開始単語が一緒に表示されます。
              <br />
              1-4. 각プレイヤーは持ち時間90秒でゲームを進行します。
              <br />
              1-5. ゲーム開始時にどちらが先に単語を入力するかはランダムで決まります。
            </p>
          </div>

          {/* 2. 単語をつなぐルール */}
          <div
            style={{
              marginBottom: "6px",
              padding: "4px 10px 6px",
              borderRadius: "8px",
              backgroundColor: "#f0f9ff", // 더 옅은 파랑
            }}
          >
            <p
              style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
            >
              2. 単語をつなぐルール
            </p>
            <p style={{ fontSize: "12px", margin: 0 }}>
              2-1. 韓国人：前の単語の「韓国語の最後の文字」から始まる単語を出さなければなりません。
              <br />
              2-2. 日本人：前の単語の「日本語で終わる音」に合わせて単語をつなぎます。
              <br />
              2-3. 長音（ー）は直前の文字で、促音（っ）はその文字自体でつなぎます。
              <br />
              2-4. 画面の「次に続く文字」に、現在のターンでつなぐべき文字が表示されます。
            </p>
          </div>

          {/* 3. 言語別の特別ルール */}
          <div
            style={{
              marginBottom: "6px",
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: "#f0fdf4", // 더 옅은 초록
            }}
          >
            <p
              style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
            >
              3. 言語別の特別ルール
            </p>
            <p style={{ fontSize: "12px", margin: 0 }}>
              3-1. 韓国語：頭音法則（두음법칙）は適用されません。
              <br />
              3-2. 日本語：カタカナや漢字の単語は、それぞれの文字で入力してください。
            </p>
          </div>

          {/* 4. 単語の有効性 */}
          <div
            style={{
              marginBottom: "6px",
              padding: "4px 10px 6px",
              borderRadius: "8px",
              backgroundColor: "#fdf2ff", // 더 옅은 보라/핑크
            }}
          >
            <p
              style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
            >
              4. 単語の有効性
            </p>
            <p style={{ fontSize: "12px", margin: 0 }}>
              4-1. 辞書に登録されている単語のみ提出できます。
              <br />
              4-2. 辞書にない単語を使うと、ペナルティ（-5秒）を受けます。
            </p>
          </div>

          {/* 5. 勝利条件 */}
          <div
            style={{
              marginBottom: "6px",
              padding: "4px 10px 6px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2", // 더 옅은 레드
            }}
          >
            <p
              style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
            >
              5. 勝利条件
            </p>
            <p style={{ fontSize: "12px", margin: 0 }}>
              5-1. 相手の残り時間が0秒になると勝利します。
              <br />
              5-2. 相手がルールに合わない単語を提出した場合も勝利します。
            </p>
          </div>

          {/* 6. 敗北条件 */}
          <div
            style={{
              marginBottom: "0px",
              padding: "4px 10px 6px",
              borderRadius: "8px",
              backgroundColor: "#f5f5f4", // 더 옅은 세피아 톤 그레이
            }}
          >
            <p
              style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
            >
              6. 敗北条件
            </p>
            <p style={{ fontSize: "12px", margin: 0 }}>
              6-1. 自分の残り時間が0秒になると敗北します。
              <br />
              6-2. 韓国人が出した単語の日本語訳が「ん」で終わる場合、韓国人は即座に敗北します。
            </p>
          </div>
        </div>
      );
    }

    // 한국어 설명
    return (
      <div>
        {/* 상단 제목은 RulesModal 헤더에서 공통으로 표시 */}
        {/* 1. 기본 설명 */}
        <div
          style={{
            marginBottom: "6px",
            padding: "4px 10px 6px",
            borderRadius: "8px",
            backgroundColor: "#fff7ed", // 더 옅은 따뜻한 노랑
          }}
        >
          <p
            style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
          >
            1. 기본 설명
          </p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            1-1. 이 게임은 한국인과 일본인이 1대1로 겨루는 끝말잇기 게임입니다.
            <br />
            1-2. 한국인은 한국어 단어, 일본인은 일본어 단어를 사용합니다.
            <br />
            1-3. 게임 시작 시 한국어/일본어 랜덤 시작 단어가 함께 표시됩니다.
            <br />
            1-4. 각 플레이어는 개인 시간 90초를 가지고 게임을 진행합니다.
            <br />
            1-5. 게임 시작 시 어느 쪽이 먼저 단어를 입력할지는 랜덤으로 결정됩니다.
          </p>
        </div>

        {/* 2. 단어 잇기 규칙 */}
        <div
          style={{
            marginBottom: "6px",
            padding: "4px 10px 6px",
            borderRadius: "8px",
            backgroundColor: "#f0f9ff", // 더 옅은 파랑
          }}
        >
          <p
            style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
          >
            2. 단어 잇기 규칙
          </p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            2-1. 한국인: 이전 단어의 "한국어 마지막 글자"로 시작하는 단어를 제출해야 합니다.
            <br />
            2-2. 일본인: 이전 단어의 "일본어 끝나는 소리"에 맞게 이어야 합니다.
            <br />
            2-3. 장음(ー)은 장음부호 앞의 문자로, 촉음(っ)은 촉음 문자로 잇습니다.
            <br />
            2-4. 화면의 "이어야 할 글자"에 현재 턴에서 이어야 할 글자가 표시됩니다.
          </p>
        </div>

        {/* 3. 언어별 특수 규칙 */}
        <div
          style={{
            marginBottom: "6px",
            padding: "6px 10px",
            borderRadius: "8px",
            backgroundColor: "#f0fdf4", // 더 옅은 초록
          }}
        >
          <p
            style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
          >
            3. 언어별 특수 규칙
          </p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            3-1. 한국어: 두음법칙은 적용되지 않습니다.
            <br />
            3-2. 일본어: 가타카나와 한자 단어는 해당 문자로 입력하세요.
          </p>
        </div>

        {/* 4. 단어 유효성 */}
        <div
          style={{
            marginBottom: "6px",
            padding: "4px 10px 6px",
            borderRadius: "8px",
            backgroundColor: "#fdf2ff", // 더 옅은 보라/핑크
          }}
        >
          <p
            style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
          >
            4. 단어 유효성
          </p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            4-1. 사전에 등재된 단어만 제출 가능합니다.
            <br />
            4-2. 사전에 없는 단어를 사용하면 페널티(-5초)를 받습니다.
          </p>
        </div>

        {/* 5. 승리 조건 */}
        <div
          style={{
            marginBottom: "6px",
            padding: "4px 10px 6px",
            borderRadius: "8px",
            backgroundColor: "#fef2f2", // 더 옅은 레드
          }}
        >
          <p
            style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
          >
            5. 승리 조건
          </p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            5-1. 상대방의 시간이 0초가 되면 승리합니다.
            <br />
            5-2. 상대가 규칙에 맞지 않는 단어를 제출하면 승리합니다.
          </p>
        </div>

        {/* 6. 패배 조건 */}
        <div
          style={{
            marginBottom: "0px",
            padding: "4px 10px 6px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f4", // 더 옅은 세피아 톤 그레이
          }}
        >
          <p
            style={{ fontSize: "13px", marginTop: 0, marginBottom: "4px" }}
          >
            6. 패배 조건
          </p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            6-1. 자신의 남은 시간이 0초가 되면 패배합니다.
            <br />
            6-2. 한국인이 낸 단어의 일본어 번역이 'ん'으로 끝나면 한국인이 즉시 패배합니다.
          </p>
        </div>
      </div>
    );
  };

  // ===== 규칙 팝업 컴포넌트 =====
  const RulesModal = () =>
    showRules ? (
      <div
        onClick={() => setShowRules(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 300,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            ...cardStyle,
            maxWidth: "520px",
            width: "90%",
            maxHeight: "95vh",
            overflowY: "auto",
            position: "relative",
          }}
          ref={rulesScrollRef}
        >
          <div
            style={{
              position: "relative",
              marginBottom: "0px",
              paddingTop: "4px",
              paddingBottom: "4px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 0,
                textAlign: "center",
              }}
            >
              {language === "ja" ? "ゲームルール" : "게임 규칙"}
            </h3>
            <button
              onClick={() => setShowRules(false)}
              style={{
                ...closeIconStyle,
                position: "absolute",
                top: 0,
                right: 0,
              }}
              aria-label="규칙 닫기"
            >
              ✕
            </button>
          </div>
          {renderRulesContent()}
        </div>
      </div>
    ) : null;

  // ===== 히스토리 섹션 공통 렌더링 =====
  const renderHistorySection = () => (
    <div
      style={{
        marginTop: "12px",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        maxHeight: isMobile ? "180px" : "240px",
        overflowY: "auto",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "4px",
        }}
      >
        {T.history}
      </div>
      {!gameState?.history || gameState.history.length === 0 ? (
        <p
          style={{
            fontSize: "13px",
            marginTop: "4px",
          }}
        >
          {T.noHistory}
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {[...gameState.history].reverse().map((h, idx) => {
            const isMine = h.player === playerType;
            const playerLabel = getPlayerTypeLabel(h.player);

            const wordLang =
              h.player === "korean"
                ? language === "ja"
                  ? "韓国語"
                  : "한국어"
                : language === "ja"
                ? "日本語"
                : "일본어";

            const translatedLang =
              h.player === "korean"
                ? language === "ja"
                  ? "日本語"
                  : "일본어"
                : language === "ja"
                ? "韓国語"
                : "한국어";

            return (
              <div
                key={idx}
                style={{
                  padding: "6px 8px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: isMine ? "#eff6ff" : "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "2px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#4b5563",
                    }}
                  >
                    #{gameState.history.length - idx} · {playerLabel}
                  </span>
                  <span
                    style={{
                      padding: "0 6px",
                      borderRadius: "999px",
                      border: "1px solid #d1d5db",
                      fontSize: "11px",
                      backgroundColor: isMine ? "#dbeafe" : "#f3f4f6",
                    }}
                  >
                    {isMine
                      ? language === "ja"
                        ? "自分"
                        : "나"
                      : language === "ja"
                      ? "相手"
                      : "상대"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                  }}
                >
                  <div>
                    <strong>{wordLang}:</strong> {h.word}
                  </div>
                  <div>
                    <strong>{translatedLang}:</strong> {h.translated}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ===== 렌더링 =====

  // 1단계: 국적 선택
  if (step === 1) {
    return (
      <div
        style={{
          ...pageStyle,
          position: "relative",
          padding: isMobile ? "0 8px" : pageStyle.padding,
          margin: isMobile ? "12px auto" : pageStyle.margin,
        }}
      >
        {/* 좌상단 규칙 보기 */}
        <button
          onClick={() => setShowRules(true)}
          style={{
            ...buttonStyle,
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 120,
            fontSize: "12px",
          }}
        >
          {T.showRules}
        </button>

        {/* 우상단 언어 토글 */}
        <button
          onClick={handleToggleUiLanguage}
          style={{
            ...buttonStyle,
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 120,
          }}
        >
          {language === "ko" ? T.uiToggleToJa : T.uiToggleToKo}
        </button>

        <RulesModal />

        <div style={{ textAlign: "center", marginTop: "80px" }}>
          {/* 게임 이름 */}
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "40px",
              color: "#111827",
            }}
          >
            {language === "ko" ? "한・일 끝말잇기" : "日・韓しりとり"}
          </h1>

          <div style={{ ...cardStyle, maxWidth: "400px", margin: "0 auto" }}>
            <h2 style={{ marginTop: 0 }}>{T.selectTitle}</h2>
            <p>{T.selectDesc}</p>
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={() => handleSelectLanguage("ko")}
                style={{ ...primaryButtonStyle, marginRight: "8px" }}
              >
                {T.btnKorean}
              </button>
              <button
                onClick={() => handleSelectLanguage("ja")}
                style={primaryButtonStyle}
              >
                {T.btnJapanese}
              </button>
            </div>
          </div>

          {/* 서버 안내문 - 방 목록 로드 전에만 표시 */}
          {showServerNotice && (
            <div
              style={{
                maxWidth: "400px",
                margin: "16px auto 0",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fcd34d",
                fontSize: "13px",
                color: "#92400e",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>
                {language === "ko" ? "⏱️ 서버 기동 안내" : "⏱️ サーバー起動のご案内"}
              </p>
              <p style={{ margin: 0, lineHeight: "1.5" }}>
                {language === "ko"
                  ? "처음 접속 시 서버 기동에 30초~1분 정도 소요될 수 있습니다. 국적 선택 버튼을 누른 후 잠시 기다려주세요."
                  : "初回接続時、サーバー起動に30秒～1分程度かかる場合があります。国籍選択ボタンを押した後、しばらくお待ちください。"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2단계: 방 리스트
  if (step === 2) {
    return (
      <div
        style={{
          ...pageStyle,
          position: "relative",
          padding: isMobile ? "0 8px" : pageStyle.padding,
          margin: isMobile ? "12px auto" : pageStyle.margin,
        }}
      >
        {/* 좌상단 규칙 보기 */}
        <button
          onClick={() => setShowRules(true)}
          style={{
            ...buttonStyle,
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 120,
            fontSize: "12px",
          }}
        >
          {T.showRules}
        </button>

        {/* 우상단 언어 토글 */}
        <button
          onClick={handleToggleUiLanguage}
          style={{
            ...buttonStyle,
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 120,
          }}
        >
          {language === "ko" ? T.uiToggleToJa : T.uiToggleToKo}
        </button>

        <RulesModal />

        {/* 상단 바 */}
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>{T.myNationLabel}: </strong>
            {getPlayerTypeLabel(playerType)}
            <button
              onClick={handleChangeLanguageAll}
              style={{ ...buttonStyle, marginLeft: "8px", fontSize: "12px" }}
            >
              {T.btnChangeNation}
            </button>
          </div>
          <button
            onClick={handleToggleCreateRoom}
            style={primaryButtonStyle}
            disabled={isCreatingRoomRequest}
          >
            {T.createRoomBtn}
          </button>
        </div>

        {/* 방 만들기 (방 목록 위로 이동) */}
        {isCreating && (
          <div
            style={{
              ...cardStyle,
              marginBottom: "12px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsCreating(false)}
              style={{
                ...closeIconStyle,
                position: "absolute",
                top: 8,
                right: 8,
              }}
              aria-label="방 만들기 닫기"
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0 }}>{T.createRoomTitle}</h3>
            <input
              type="text"
              placeholder={T.roomTitlePlaceholder}
              value={roomTitleInput}
              onChange={handleRoomTitleChange}
              style={inputStyle}
            />
            {titleError && (
              <p style={{ color: "#b91c1c", fontSize: "12px" }}>{titleError}</p>
            )}

            <input
              type="password"
              placeholder={T.roomPasswordPlaceholder}
              value={roomPasswordInput}
              onChange={handleRoomPasswordChange}
              style={{ ...inputStyle, marginTop: "6px" }}
            />
            {passwordError && (
              <p style={{ color: "#b91c1c", fontSize: "12px" }}>
                {passwordError}
              </p>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={isCreatingRoomRequest}
              style={{
                ...primaryButtonStyle,
                width: "100%",
                marginTop: "4px",
                opacity: isCreatingRoomRequest ? 0.6 : 1,
                cursor: isCreatingRoomRequest ? "not-allowed" : "pointer",
              }}
            >
              {T.createRoomBtn}
            </button>
          </div>
        )}

        {/* 방 목록 헤더 */}
        <div
          style={{
            marginBottom: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>{T.roomListTitle}</h2>
          <button
            onClick={handleRefreshRooms}
            style={{ ...buttonStyle, fontSize: "12px" }}
          >
            {T.btnRefresh}
          </button>
        </div>

        {/* 방 리스트 */}
        <div style={{ ...cardStyle, marginBottom: "12px" }}>
          {rooms.length === 0 ? (
            <p>{T.noRooms}</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {rooms.map((room) => (
                <div key={room.roomId}>
                  {/* 방 항목 */}
                  <div
                    onClick={() => handleSelectRoomForJoin(room)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor:
                        selectedRoom?.roomId === room.roomId
                          ? "#f0f9ff"
                          : "transparent",
                      userSelect: "none",
                    }}
                  >
                    <div>
                      <strong>{room.roomName}</strong>{" "}
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        ({getPlayerTypeLabel(room.creatorType)})
                      </span>
                      {room.hasPassword && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#b91c1c",
                            marginLeft: "6px",
                          }}
                        >
                          🔒
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {T.roomWaitingLabel}
                    </div>
                  </div>

                  {/* 방 입장 (클릭한 방 바로 아래) */}
                  {selectedRoom?.roomId === room.roomId && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(15, 23, 42, 0.06)",
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(null);
                        }}
                        style={{
                          ...closeIconStyle,
                          position: "absolute",
                          top: 8,
                          right: 8,
                        }}
                        aria-label="방 입장 닫기"
                      >
                        ✕
                      </button>
                      <h4
                        style={{
                          marginTop: 0,
                          marginBottom: "8px",
                        }}
                      >
                        {T.enterRoomTitle}
                      </h4>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "8px",
                        }}
                      >
                        {T.thisIsOppNationRoom}
                      </p>

                      {selectedRoom.hasPassword ? (
                        <>
                          <input
                            type="password"
                            placeholder={T.inputPasswordPlaceholder}
                            value={joinPasswordInput}
                            onChange={(e) =>
                              setJoinPasswordInput(e.target.value)
                            }
                            style={inputStyle}
                          />
                          <button
                            onClick={handleJoinRoom}
                            disabled={isJoiningRoomRequest}
                            style={{
                              ...primaryButtonStyle,
                              width: "100%",
                              marginTop: "6px",
                              opacity: isJoiningRoomRequest ? 0.6 : 1,
                              cursor: isJoiningRoomRequest
                                ? "not-allowed"
                                : "pointer",
                            }}
                          >
                            {T.btnEnter}
                          </button>
                        </>
                      ) : (
                        <>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginBottom: "8px",
                            }}
                          >
                            {T.noPasswordRoom}
                          </p>
                          <button
                            onClick={handleJoinRoom}
                            disabled={isJoiningRoomRequest}
                            style={{
                              ...primaryButtonStyle,
                              width: "100%",
                              opacity: isJoiningRoomRequest ? 0.6 : 1,
                              cursor: isJoiningRoomRequest
                                ? "not-allowed"
                                : "pointer",
                            }}
                          >
                            {T.btnEnterDirect}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3단계: 방 안
  if (step === 3 && currentRoom) {
    // 게임 결과 fallback 문구 (언어별)
    const resultFallback =
      language === "ja"
        ? "結果を読み込めませんでした。"
        : "결과를 불러오지 못했습니다.";

    const replayHint =
      language === "ja"
        ? "もう一度プレイするには、部屋を退出して新しい部屋を作成するか、他の部屋に入室してください。"
        : "(다시 하려면 방을 나갔다가 새 방을 만들거나 입장해주세요.)";

    return (
      <div
        style={{
          ...pageStyle,
          position: "relative",
          padding: isMobile ? "0 8px" : pageStyle.padding,
          margin: isMobile ? "12px auto" : pageStyle.margin,
        }}
      >
        {/* 좌상단 규칙 보기 */}
        <button
          onClick={() => setShowRules(true)}
          style={{
            ...buttonStyle,
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 120,
            fontSize: "12px",
          }}
        >
          {T.showRules}
        </button>

        {/* 우상단 언어 토글 */}
        <button
          onClick={handleToggleUiLanguage}
          style={{
            ...buttonStyle,
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 120,
          }}
        >
          {language === "ko" ? T.uiToggleToJa : T.uiToggleToKo}
        </button>

        <RulesModal />

        {/* 방 정보 (가로 배치) */}
        <div style={{ ...cardStyle, marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{T.roomNameLabel}: </strong>
              {currentRoom.roomName}
            </div>
            <div>
              <strong>{T.myNationLabel}: </strong>
              {getPlayerTypeLabel(playerType)}
            </div>
            <div>
              <strong>{T.roleLabel}: </strong>
              {isHost
                ? language === "ja"
                  ? "ホスト"
                  : "방장"
                : language === "ja"
                ? "ゲスト"
                : "게스트"}
            </div>
            <div>
              <strong>{T.roomStatusLabel}: </strong>
              {roomInfo?.status ||
                (language === "ja" ? "不明" : "알 수 없음")}
            </div>
          </div>
        </div>

        {/* 방 안 메인 */}
        <div style={cardStyle}>
          {/* 게임 전 */}
          {roomStage === "waiting" && (
            <div style={{ textAlign: "center" }}>
              <p>
                {isHost
                  ? roomInfo?.guestId
                    ? language === "ja"
                      ? "相手が入室しました。ゲームを開始できます。"
                      : "상대가 입장했습니다. 게임을 시작할 수 있습니다."
                    : T.waitingGuest
                  : T.waitingHost}
              </p>

              {/* 방장 + 게스트가 있을 때만 버튼 표시 */}
              {isHost && roomInfo?.guestId && (
                <button
                  onClick={handleGameStart}
                  style={{
                    ...primaryButtonStyle,
                    width: isMobile ? "100%" : "auto",
                    marginTop: isMobile ? "4px" : 0,
                    opacity: isStartingGameRequest ? 0.6 : 1,
                    cursor: isStartingGameRequest ? "not-allowed" : "pointer",
                  }}
                  disabled={isStartingGameRequest}
                >
                  {T.startGame}
                </button>
              )}
            </div>
          )}

          {/* 게임 중 */}
          {roomStage === "playing" && gameState && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* 상단 정보 4개 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, minmax(0, 1fr))"
                    : "repeat(4, minmax(0, 1fr))",
                  gap: "8px",
                }}
              >
                {/* 현재 단어 */}
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    order: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {T.currentWord}
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "13px" }}>
                    <div>
                      <strong>KO:</strong> {gameState?.currentWord?.ko || "-"}
                    </div>
                    <div>
                      <strong>JA:</strong> {gameState?.currentWord?.ja || "-"}
                    </div>
                  </div>
                </div>

                {/* 내 시간 */}
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    order: isMobile ? 2 : 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {T.myTime}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: "4px",
                      color: "#b91c1c",
                    }}
                  >
                    {myTime != null ? myTime : "-"}
                    {timerUnit}
                  </div>
                </div>

                {/* 상대 시간 */}
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    order: isMobile ? 3 : 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {T.oppTime}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: "4px",
                      color: "#dc2626",
                    }}
                  >
                    {oppTime != null ? oppTime : "-"}
                    {timerUnit}
                  </div>
                </div>

                {/* 턴 */}
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    order: isMobile ? 1 : 3,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {T.turn}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    {isMyTurn ? T.myTurn : T.oppTurn}
                  </div>
                </div>
              </div>

              {/* 이어야 할 글자 – 한쪽만일 땐 전체폭 사용 */}
              {hintColumnCount > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : `repeat(${hintColumnCount}, minmax(0, 1fr))`,
                    gap: "8px",
                  }}
                >
                  {showKoHint && (
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {T.nextCharKo}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          marginTop: "4px",
                        }}
                      >
                        {nextKoChar || "-"}
                      </div>
                    </div>
                  )}

                  {showJaHint && (
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {T.nextCharJa}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          marginTop: "4px",
                        }}
                      >
                        {nextJaChar || "-"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 입력 폼 */}
              <form
                onSubmit={handleSubmitWord}
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder={T.inputPlaceholder}
                  disabled={!isMyTurn || isSubmittingWordRequest}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  disabled={!isMyTurn}
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      isMyTurn && !isSubmittingWordRequest
                        ? 1
                        : isSubmittingWordRequest
                        ? 0.6
                        : 0.5,
                    cursor:
                      isMyTurn && !isSubmittingWordRequest
                        ? "pointer"
                        : "not-allowed",
                    whiteSpace: "nowrap",
                  }}
                >
                  {T.submitLabel}
                </button>
              </form>

              {/* 히스토리 */}
              {renderHistorySection()}
            </div>
          )}

          {/* 게임 종료 */}
          {roomStage === "finished" && gameState && (
            <div>
              <div style={{ textAlign: "center" }}>
                <h3>{T.gameOver}</h3>
                <p>
                  {T.winner}:{" "}
                  <strong>{winnerLabel || resultFallback}</strong>
                </p>
                {winnerReasonText && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4b5563",
                      marginTop: "4px",
                    }}
                  >
                    {winnerReasonText}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  {replayHint}
                </p>
              </div>

              {/* 종료 후 히스토리 표시 */}
              {renderHistorySection()}
            </div>
          )}

          {/* 방 나가기 – 게임 중에는 숨김 */}
          {roomStage !== "playing" && (
            <div
              style={{
                marginTop: "16px",
                textAlign: "right",
              }}
            >
              <button onClick={handleLeaveRoom} style={buttonStyle}>
                {T.leaveRoom}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 안전망
  return (
    <div
      style={{
        ...pageStyle,
        textAlign: "center",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          ...cardStyle,
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <p>오류가 발생했습니다. 처음으로 돌아갑니다.</p>
        <button onClick={() => setStep(1)} style={primaryButtonStyle}>
          처음으로
        </button>
      </div>
    </div>
  );
}
