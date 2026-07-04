import type { ArrowBlock, Direction } from '../types';

const directionDelta: Record<Direction, { dr: number; dc: number }> = {
  UP: { dr: -1, dc: 0 },
  DOWN: { dr: 1, dc: 0 },
  LEFT: { dr: 0, dc: -1 },
  RIGHT: { dr: 0, dc: 1 },
};

export function canEscape(block: ArrowBlock, blocks: ArrowBlock[], rows: number, cols: number) {
  const occupied = new Set(blocks.filter((item) => item.id !== block.id).map((item) => `${item.row}:${item.col}`));
  const { dr, dc } = directionDelta[block.direction];
  let row = block.row + dr;
  let col = block.col + dc;

  while (row >= 0 && row < rows && col >= 0 && col < cols) {
    if (occupied.has(`${row}:${col}`)) {
      return false;
    }
    row += dr;
    col += dc;
  }

  return true;
}

export function getEscapeTransform(direction: Direction) {
  switch (direction) {
    case 'UP':
      return 'translate3d(0, -150%, 0) scale(0.82)';
    case 'DOWN':
      return 'translate3d(0, 150%, 0) scale(0.82)';
    case 'LEFT':
      return 'translate3d(-150%, 0, 0) scale(0.82)';
    case 'RIGHT':
      return 'translate3d(150%, 0, 0) scale(0.82)';
  }
}
