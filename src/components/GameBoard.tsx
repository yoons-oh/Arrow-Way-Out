import type { ArrowBlock as ArrowBlockType, LevelData } from '../types';
import { ArrowBlock } from './ArrowBlock';

type Props = {
  level: LevelData;
  blocks: ArrowBlockType[];
  escapingId: string | null;
  blockedId: string | null;
  hintedId: string | null;
  onBlockTap: (id: string) => void;
};

export function GameBoard({ level, blocks, escapingId, blockedId, hintedId, onBlockTap }: Props) {
  return (
    <div className="board-wrap">
      <div
        className="game-board"
        style={{
          gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
        }}
      >
        {blocks.map((block) => (
          <ArrowBlock
            key={block.id}
            block={block}
            rowCount={level.rows}
            colCount={level.cols}
            isEscaping={escapingId === block.id}
            isBlocked={blockedId === block.id}
            isHinted={hintedId === block.id}
            onTap={onBlockTap}
          />
        ))}
      </div>
    </div>
  );
}
