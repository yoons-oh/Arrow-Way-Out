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
  const largestSide = Math.max(level.rows, level.cols);
  const tileSize = largestSide <= 2 ? 116 : largestSide === 3 ? 100 : largestSide === 4 ? 82 : largestSide === 5 ? 68 : 56;
  const gap = largestSide <= 2 ? 12 : largestSide === 3 ? 10 : largestSide === 4 ? 9 : 8;
  const padding = largestSide <= 3 ? 14 : 12;
  const boardWidth = level.cols * tileSize + (level.cols - 1) * gap + padding * 2;
  const boardHeight = level.rows * tileSize + (level.rows - 1) * gap + padding * 2;

  return (
    <div className="board-wrap">
      <div
        className="game-board"
        style={{
          aspectRatio: `${boardWidth} / ${boardHeight}`,
          gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
          ['--board-width' as string]: `${boardWidth}px`,
          ['--board-gap' as string]: `${gap}px`,
          ['--board-pad' as string]: `${padding}px`,
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
