import { ListChecks, Play, Settings, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClearModal } from './components/ClearModal';
import { GameBoard } from './components/GameBoard';
import { TopBar } from './components/TopBar';
import { levels } from './data/levels';
import { detectLocale, localeNames, messages, supportedLocales } from './i18n';
import { findEscapableBlock } from './logic/hint';
import { canEscape } from './logic/movement';
import type { ArrowBlock, LocaleCode, LevelData, RankingEntry } from './types';

type Screen = 'home' | 'game' | 'levels' | 'settings';

const storageKeys = {
  currentLevel: 'awo.currentLevel',
  maxLevel: 'awo.maxLevel',
  clearedLevel: 'awo.clearedLevel',
  totalMoves: 'awo.totalMoves',
  soundOn: 'awo.soundOn',
  locale: 'awo.locale',
  playerName: 'awo.playerName',
};

function getRankingKey(levelId: number) {
  return `awo.rankings.level.${levelId}`;
}

function readNumber(key: string, fallback: number) {
  const raw = localStorage.getItem(key);
  const value = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(value) ? value : fallback;
}

function getTimeLimitMs(level: LevelData) {
  const cells = level.rows * level.cols;
  const seconds = Math.max(18, Math.round(level.blocks.length * 2.7 + cells * 0.65 + 10));
  return seconds * 1000;
}

function formatTime(ms: number) {
  const safeMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}` : `${seconds}.${tenths}s`;
}

function getPlayerKey(name: string) {
  return (name.trim() || 'Player').toLocaleLowerCase();
}

function compareRankingEntries(a: RankingEntry, b: RankingEntry) {
  return a.timeMs - b.timeMs || a.moves - b.moves || a.date.localeCompare(b.date);
}

function compactRankings(levelId: number, entries: RankingEntry[]) {
  const bestByPlayer = new Map<string, RankingEntry>();

  for (const entry of entries) {
    if (entry.levelId !== levelId) {
      continue;
    }

    const normalizedEntry = {
      ...entry,
      levelId,
      name: entry.name.trim() || 'Player',
    };
    const playerKey = getPlayerKey(normalizedEntry.name);
    const previousEntry = bestByPlayer.get(playerKey);

    if (!previousEntry || compareRankingEntries(normalizedEntry, previousEntry) < 0) {
      bestByPlayer.set(playerKey, normalizedEntry);
    }
  }

  return Array.from(bestByPlayer.values()).sort(compareRankingEntries).slice(0, 5);
}

function readRankings(levelId: number): RankingEntry[] {
  try {
    const raw = localStorage.getItem(getRankingKey(levelId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RankingEntry[];
    return Array.isArray(parsed) ? compactRankings(levelId, parsed) : [];
  } catch {
    return [];
  }
}

function writeRankings(levelId: number, rankings: RankingEntry[]) {
  localStorage.setItem(getRankingKey(levelId), JSON.stringify(compactRankings(levelId, rankings)));
}

function playTone(enabled: boolean, type: 'tap' | 'escape' | 'blocked' | 'clear') {
  if (!enabled) return;
  const audioWindow = window as unknown as { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequencies = { tap: 380, escape: 680, blocked: 140, clear: 820 };

  oscillator.frequency.value = frequencies[type];
  oscillator.type = type === 'blocked' ? 'square' : 'sine';
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.14);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.16);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [levelIndex, setLevelIndex] = useState(() => Math.min(readNumber(storageKeys.currentLevel, 1), levels.length) - 1);
  const [maxLevel, setMaxLevel] = useState(() => readNumber(storageKeys.maxLevel, 1));
  const [clearedLevel, setClearedLevel] = useState(() => readNumber(storageKeys.clearedLevel, Math.max(0, readNumber(storageKeys.maxLevel, 1) - 1)));
  const [totalMoves, setTotalMoves] = useState(() => readNumber(storageKeys.totalMoves, 0));
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem(storageKeys.soundOn) !== 'false');
  const [locale, setLocale] = useState<LocaleCode>(() => (localStorage.getItem(storageKeys.locale) as LocaleCode | null) ?? detectLocale());
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(storageKeys.playerName) || '');
  const [moves, setMoves] = useState(0);
  const [blocks, setBlocks] = useState<ArrowBlock[]>(() => levels[levelIndex].blocks.map((block) => ({ ...block })));
  const [escapingId, setEscapingId] = useState<string | null>(null);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [hintedId, setHintedId] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [levelStartedAt, setLevelStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [rankings, setRankings] = useState<RankingEntry[]>(() => readRankings(levels[levelIndex].id));
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [playerNameError, setPlayerNameError] = useState(false);

  const level = levels[levelIndex];
  const copy = messages[locale] ?? messages.en;
  const isLastLevel = levelIndex === levels.length - 1;
  const timeLimitMs = useMemo(() => getTimeLimitMs(level), [level]);
  const timeLeftMs = Math.max(0, timeLimitMs - elapsedMs);
  const progress = useMemo(() => Math.round(((levelIndex + 1) / levels.length) * 100), [levelIndex]);
  const clearedLevelCount = Math.min(clearedLevel, levels.length);
  const levelSelectTitle = locale === 'ko' ? '레벨 선택' : 'Level Select';
  const clearedLevelsText = locale === 'ko' ? '클리어한 레벨' : 'Cleared levels';
  const noClearedLevelsText = locale === 'ko' ? '아직 클리어한 레벨이 없습니다' : 'No cleared levels yet';
  const requiredLabel = locale === 'ko' ? '필수' : 'Required';
  const playerNamePlaceholder = locale === 'ko' ? '이름을 입력하세요' : 'Enter your name';
  const playerNameHintText = locale === 'ko' ? '랭킹에 표시될 이름입니다.' : 'This name will appear on rankings.';
  const playerNameRequiredText = locale === 'ko' ? '이름을 입력해야 플레이할 수 있어요.' : 'Enter your name to play.';

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(storageKeys.locale, locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem(storageKeys.currentLevel, String(levelIndex + 1));
  }, [levelIndex]);

  useEffect(() => {
    localStorage.setItem(storageKeys.maxLevel, String(maxLevel));
  }, [maxLevel]);

  useEffect(() => {
    localStorage.setItem(storageKeys.clearedLevel, String(clearedLevel));
  }, [clearedLevel]);

  useEffect(() => {
    localStorage.setItem(storageKeys.totalMoves, String(totalMoves));
  }, [totalMoves]);

  useEffect(() => {
    localStorage.setItem(storageKeys.soundOn, String(soundOn));
  }, [soundOn]);

  useEffect(() => {
    if (screen !== 'game' || cleared || timeUp) {
      return;
    }

    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(Date.now() - levelStartedAt, timeLimitMs);
      setElapsedMs(nextElapsed);

      if (nextElapsed >= timeLimitMs) {
        setTimeUp(true);
        playTone(soundOn, 'blocked');
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [screen, cleared, timeUp, levelStartedAt, timeLimitMs, soundOn]);

  function loadLevel(nextIndex: number) {
    setLevelIndex(nextIndex);
    setBlocks(levels[nextIndex].blocks.map((block) => ({ ...block })));
    setMoves(0);
    setEscapingId(null);
    setBlockedId(null);
    setHintedId(null);
    setCleared(false);
    setTimeUp(false);
    setLevelStartedAt(Date.now());
    setElapsedMs(0);
    setRankings(readRankings(levels[nextIndex].id));
    setCurrentEntryId(null);
    setNotice(null);
    setMaxLevel((value) => Math.max(value, nextIndex + 1));
  }

  function startGame(nextIndex = levelIndex) {
    const cleanName = playerName.trim();

    if (!cleanName) {
      setPlayerNameError(true);
      setScreen('home');
      return;
    }

    if (nextIndex !== levelIndex) {
      loadLevel(nextIndex);
    }

    setPlayerNameError(false);
    setPlayerName(cleanName);
    localStorage.setItem(storageKeys.playerName, cleanName);
    setLevelStartedAt(Date.now());
    setElapsedMs(0);
    setTimeUp(false);
    setScreen('game');
  }

  function restartLevel() {
    loadLevel(levelIndex);
  }

  function recordClear(finalMs: number, finalMoves: number) {
    const cleanName = playerName.trim() || 'Player';
    const entry: RankingEntry = {
      id: `${level.id}-${Date.now()}`,
      levelId: level.id,
      name: cleanName,
      timeMs: finalMs,
      moves: finalMoves,
      date: new Date().toISOString(),
    };
    const nextRankings = compactRankings(level.id, [...readRankings(level.id), entry]);
    const saved = nextRankings.some((item) => item.id === entry.id);

    writeRankings(level.id, nextRankings);
    setRankings(nextRankings);
    setCurrentEntryId(saved ? entry.id : null);
    setClearedLevel((value) => Math.max(value, level.id));
  }

  function updatePlayerName(nextName: string) {
    setPlayerName(nextName);
    localStorage.setItem(storageKeys.playerName, nextName);

    if (nextName.trim()) {
      setPlayerNameError(false);
    }

    if (!currentEntryId) {
      return;
    }

    const cleanName = nextName.trim() || 'Player';
    const nextRankings = compactRankings(
      level.id,
      rankings.map((entry) => (entry.id === currentEntryId ? { ...entry, name: cleanName } : entry)),
    );
    setRankings(nextRankings);
    writeRankings(level.id, nextRankings);
    setCurrentEntryId(nextRankings.some((entry) => entry.id === currentEntryId) ? currentEntryId : null);
  }

  function handleBlockTap(blockId: string) {
    if (escapingId || cleared || timeUp) return;
    const block = blocks.find((item) => item.id === blockId);
    if (!block) return;
    const nextMovesValue = moves + 1;

    setHintedId(null);
    setMoves(nextMovesValue);
    setTotalMoves((value) => value + 1);
    playTone(soundOn, 'tap');

    if (!canEscape(block, blocks, level.rows, level.cols)) {
      setBlockedId(block.id);
      playTone(soundOn, 'blocked');
      window.setTimeout(() => setBlockedId(null), 260);
      return;
    }

    setEscapingId(block.id);
    playTone(soundOn, 'escape');

    window.setTimeout(() => {
      setBlocks((current) => {
        const nextBlocks = current.filter((item) => item.id !== block.id);
        if (nextBlocks.length === 0) {
          const finalMs = Math.min(Date.now() - levelStartedAt, timeLimitMs);
          setElapsedMs(finalMs);
          setCleared(true);
          recordClear(finalMs, nextMovesValue);
          playTone(soundOn, 'clear');
        }
        return nextBlocks;
      });
      setEscapingId(null);
    }, 230);
  }

  function useHint() {
    const hint = findEscapableBlock(blocks, level.rows, level.cols);
    if (!hint) {
      setNotice(copy.noHint);
      window.setTimeout(() => setNotice(null), 1400);
      return;
    }

    setHintedId(hint.id);
    window.setTimeout(() => setHintedId(null), 1200);
  }

  function nextLevel() {
    if (isLastLevel) {
      setScreen('home');
      return;
    }
    loadLevel(levelIndex + 1);
  }

  function resetProgress() {
    localStorage.removeItem(storageKeys.currentLevel);
    localStorage.removeItem(storageKeys.maxLevel);
    localStorage.removeItem(storageKeys.clearedLevel);
    localStorage.removeItem(storageKeys.totalMoves);
    setMaxLevel(1);
    setClearedLevel(0);
    setTotalMoves(0);
    loadLevel(0);
  }

  function startSelectedLevel(nextIndex: number) {
    startGame(nextIndex);
  }

  if (screen === 'settings') {
    return (
      <main className="app-shell settings-shell">
        <section className="panel settings-panel">
          <div>
            <p className="eyebrow">{copy.settings}</p>
            <h1>{copy.appTitle}</h1>
          </div>

          <label className="setting-row">
            <span>{copy.language}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as LocaleCode)}>
              {supportedLocales.map((code) => (
                <option key={code} value={code}>
                  {localeNames[code]}
                </option>
              ))}
            </select>
          </label>

          <label className="setting-row toggle-row">
            <span>{copy.sound}</span>
            <input checked={soundOn} type="checkbox" onChange={(event) => setSoundOn(event.target.checked)} />
          </label>

          <button className="text-button danger" type="button" onClick={resetProgress}>
            {copy.reset}
          </button>
          <button className="main-button" type="button" onClick={() => setScreen('home')}>
            {copy.close}
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'levels') {
    return (
      <main className="app-shell level-select-shell">
        <section className="panel level-select-panel">
          <div className="level-select-head">
            <div>
              <p className="eyebrow">{clearedLevelsText}</p>
              <h1>{levelSelectTitle}</h1>
            </div>
            <p>
              {clearedLevelCount} / {levels.length}
            </p>
          </div>

          {clearedLevelCount === 0 ? (
            <p className="empty-levels">{noClearedLevelsText}</p>
          ) : (
            <div className="level-grid" aria-label={levelSelectTitle}>
              {Array.from({ length: clearedLevelCount }, (_, index) => (
                <button
                  key={levels[index].id}
                  className={index === levelIndex ? 'level-chip current' : 'level-chip'}
                  type="button"
                  onClick={() => startSelectedLevel(index)}
                >
                  {levels[index].id}
                </button>
              ))}
            </div>
          )}

          <button className="text-button" type="button" onClick={() => setScreen('home')}>
            {copy.home}
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'game') {
    return (
      <main className="app-shell game-shell">
        <TopBar
          copy={copy}
          levelNumber={level.id}
          moves={moves}
          bestLevel={maxLevel}
          timeLeftMs={timeLeftMs}
          timeLimitMs={timeLimitMs}
          onHome={() => setScreen('home')}
          onRestart={restartLevel}
          onHint={useHint}
        />
        <GameBoard
          level={level}
          blocks={blocks}
          escapingId={escapingId}
          blockedId={blockedId}
          hintedId={hintedId}
          onBlockTap={handleBlockTap}
        />
        {notice && <div className="toast">{notice}</div>}
        {timeUp && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="clear-modal timeup-modal">
              <h2>{copy.timeUp}</h2>
              <p>{copy.timeLeft} 0:00</p>
              <div className="modal-actions">
                <button className="text-button" type="button" onClick={() => setScreen('home')}>
                  {copy.home}
                </button>
                <button className="main-button compact" type="button" onClick={restartLevel}>
                  {copy.retry}
                </button>
              </div>
            </div>
          </div>
        )}
        {cleared && (
          <ClearModal
            copy={copy}
            levelNumber={level.id}
            moves={moves}
            elapsedMs={elapsedMs}
            isLastLevel={isLastLevel}
            rankings={rankings}
            currentEntryId={currentEntryId}
            playerName={playerName}
            onPlayerNameChange={updatePlayerName}
            formatTime={formatTime}
            levelSelectLabel={levelSelectTitle}
            onNext={nextLevel}
            onHome={() => setScreen('home')}
            onLevelSelect={() => setScreen('levels')}
          />
        )}
      </main>
    );
  }

  return (
    <main className="app-shell home-shell">
      <section className="hero panel">
        <div className="brand-mark" aria-hidden="true">
          <span><img src="/arrows/right.png" alt="" draggable={false} /></span>
          <span><img src="/arrows/up.png" alt="" draggable={false} /></span>
          <span><img src="/arrows/left.png" alt="" draggable={false} /></span>
        </div>
        <p className="eyebrow">{copy.subtitle}</p>
        <h1>{copy.appTitle}</h1>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="home-meta">
          {copy.level} {levelIndex + 1} / {levels.length}
        </p>
        <label className={playerNameError ? 'player-field invalid' : 'player-field'}>
          <span className="player-field-header">
            <span className="player-field-title">
              <UserRound size={18} strokeWidth={2.4} />
              {copy.playerName}
            </span>
            <span className="required-badge">{requiredLabel}</span>
          </span>
          <input
            aria-describedby="player-name-help"
            aria-invalid={playerNameError}
            maxLength={14}
            required
            value={playerName}
            onChange={(event) => updatePlayerName(event.target.value)}
            placeholder={playerNamePlaceholder}
          />
          <span className="player-hint" id="player-name-help">
            {playerNameError ? playerNameRequiredText : playerNameHintText}
          </span>
        </label>
        <button className="main-button" type="button" onClick={() => startGame()}>
          <Play size={20} fill="currentColor" strokeWidth={2.4} />
          {maxLevel > 1 ? copy.continue : copy.play}
        </button>
        <button className="text-button" type="button" onClick={() => setScreen('levels')}>
          <ListChecks size={18} strokeWidth={2.4} />
          {levelSelectTitle}
        </button>
        <button className="text-button" type="button" onClick={() => setScreen('settings')}>
          <Settings size={18} strokeWidth={2.4} />
          {copy.settings}
        </button>
      </section>
    </main>
  );
}
