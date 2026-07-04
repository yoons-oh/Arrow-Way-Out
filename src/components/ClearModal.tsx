import { ArrowRight, Check, Home, Sparkles } from 'lucide-react';
import type { messages } from '../i18n';
import type { RankingEntry } from '../types';

type Props = {
  copy: (typeof messages)['en'];
  moves: number;
  elapsedMs: number;
  isLastLevel: boolean;
  rankings: RankingEntry[];
  currentEntryId: string | null;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  formatTime: (ms: number) => string;
  onNext: () => void;
  onHome: () => void;
};

export function ClearModal({
  copy,
  moves,
  elapsedMs,
  isLastLevel,
  rankings,
  currentEntryId,
  playerName,
  onPlayerNameChange,
  formatTime,
  onNext,
  onHome,
}: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="clear-modal">
        <div className="clear-burst">
          <Check size={34} strokeWidth={3} />
        </div>
        <div className="clear-sparkles" aria-hidden="true">
          <Sparkles size={18} />
          <Sparkles size={14} />
        </div>
        <h2>{isLastLevel ? copy.lastLevel : copy.clear}</h2>
        <p>
          {copy.yourTime} {formatTime(elapsedMs)} · {copy.moves} {moves}
        </p>
        {currentEntryId && <strong className="rank-badge">{copy.rankIn}</strong>}
        {currentEntryId && (
          <label className="name-field">
            <span>{copy.playerName}</span>
            <input maxLength={14} value={playerName} onChange={(event) => onPlayerNameChange(event.target.value)} />
          </label>
        )}
        <section className="ranking-board">
          <h3>{copy.ranking}</h3>
          {rankings.length === 0 ? (
            <p className="empty-ranking">{copy.noRecords}</p>
          ) : (
            <ol>
              {rankings.map((entry, index) => (
                <li key={entry.id} className={entry.id === currentEntryId ? 'current' : ''}>
                  <span>{index + 1}</span>
                  <strong>{entry.name}</strong>
                  <em>{formatTime(entry.timeMs)}</em>
                </li>
              ))}
            </ol>
          )}
        </section>
        <div className="modal-actions">
          <button className="text-button" type="button" onClick={onHome}>
            <Home size={18} strokeWidth={2.5} />
            {copy.home}
          </button>
          {!isLastLevel && (
            <button className="main-button compact" type="button" onClick={onNext}>
              {copy.next}
              <ArrowRight size={19} strokeWidth={2.6} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
