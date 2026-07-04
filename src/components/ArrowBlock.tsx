import type { ArrowBlock as ArrowBlockType } from '../types';
import { getEscapeTransform } from '../logic/movement';

type Props = {
  block: ArrowBlockType;
  rowCount: number;
  colCount: number;
  isEscaping: boolean;
  isBlocked: boolean;
  isHinted: boolean;
  onTap: (id: string) => void;
};

const arrowImage = {
  UP: '/arrows/up.png',
  DOWN: '/arrows/down.png',
  LEFT: '/arrows/left.png',
  RIGHT: '/arrows/right.png',
};

export function ArrowBlock({ block, rowCount, colCount, isEscaping, isBlocked, isHinted, onTap }: Props) {
  return (
    <button
      className={`arrow-block direction-${block.direction.toLowerCase()} ${isBlocked ? 'blocked' : ''} ${isHinted ? 'hinted' : ''}`}
      style={{
        gridRow: block.row + 1,
        gridColumn: block.col + 1,
        transform: isEscaping ? getEscapeTransform(block.direction) : undefined,
        opacity: isEscaping ? 0 : 1,
        ['--rows' as string]: rowCount,
        ['--cols' as string]: colCount,
      }}
      type="button"
      onClick={() => onTap(block.id)}
      aria-label={block.direction.toLowerCase()}
    >
      <span className="arrow-glyph" aria-hidden="true">
        <img src={arrowImage[block.direction]} alt="" draggable={false} />
      </span>
    </button>
  );
}
