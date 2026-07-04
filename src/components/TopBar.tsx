import { Home, Lightbulb, RotateCcw } from 'lucide-react';
import type { messages } from '../i18n';

type Props = {
  copy: (typeof messages)['en'];
  levelNumber: number;
  moves: number;
  bestLevel: number;
  timeLeftMs: number;
  timeLimitMs: number;
  onHome: () => void;
  onRestart: () => void;
  onHint: () => void;
};

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TopBar({ copy, levelNumber, moves, bestLevel, timeLeftMs, timeLimitMs, onHome, onRestart, onHint }: Props) {
  const timerLevel = timeLeftMs <= 10000 ? 'danger' : timeLeftMs <= timeLimitMs * 0.35 ? 'warn' : '';

  return (
    <header className="topbar">
      <button className="icon-button" type="button" onClick={onHome} aria-label={copy.home} title={copy.home}>
        <Home size={21} strokeWidth={2.5} />
      </button>
      <div className="level-meta">
        <strong>
          {copy.level} {levelNumber}
        </strong>
        <span>
          {copy.moves} {moves} · {copy.best} {bestLevel}
        </span>
        <span className={`timer-chip ${timerLevel}`}>
          {copy.time} {formatClock(timeLeftMs)}
        </span>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" onClick={onRestart} aria-label={copy.restart} title={copy.restart}>
          <RotateCcw size={21} strokeWidth={2.5} />
        </button>
        <button className="icon-button primary" type="button" onClick={onHint} aria-label={copy.hint} title={copy.hint}>
          <Lightbulb size={22} strokeWidth={2.6} />
        </button>
      </div>
    </header>
  );
}
