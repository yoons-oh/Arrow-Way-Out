import type { ArrowBlock, Direction, LevelData } from '../types';
import { canEscape } from '../logic/movement';

const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

const fixedLevels: LevelData[] = [
  { id: 1, rows: 1, cols: 1, blocks: [{ id: 'b1', row: 0, col: 0, direction: 'RIGHT' }] },
  {
    id: 2,
    rows: 1,
    cols: 2,
    blocks: [
      { id: 'b1', row: 0, col: 0, direction: 'RIGHT' },
      { id: 'b2', row: 0, col: 1, direction: 'RIGHT' },
    ],
  },
  {
    id: 3,
    rows: 2,
    cols: 1,
    blocks: [
      { id: 'b1', row: 0, col: 0, direction: 'DOWN' },
      { id: 'b2', row: 1, col: 0, direction: 'DOWN' },
    ],
  },
  {
    id: 4,
    rows: 2,
    cols: 3,
    blocks: [
      { id: 'b1', row: 0, col: 0, direction: 'RIGHT' },
      { id: 'b2', row: 0, col: 1, direction: 'RIGHT' },
      { id: 'b3', row: 0, col: 2, direction: 'DOWN' },
    ],
  },
  {
    id: 5,
    rows: 2,
    cols: 2,
    blocks: [
      { id: 'b1', row: 0, col: 0, direction: 'DOWN' },
      { id: 'b2', row: 0, col: 1, direction: 'RIGHT' },
      { id: 'b3', row: 1, col: 0, direction: 'RIGHT' },
      { id: 'b4', row: 1, col: 1, direction: 'DOWN' },
    ],
  },
];

type DifficultySpec = {
  rows: number;
  cols: number;
  blocks: number;
  maxInitialEscapable: number;
  maxAverageEscapable: number;
};

type Candidate = {
  row: number;
  col: number;
  direction: Direction;
  score: number;
};

type LevelStats = {
  solvable: boolean;
  order: string[];
  escapeCounts: number[];
  initialEscapable: number;
  averageEscapable: number;
  chokeSteps: number;
};

function createRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function getDifficultySpec(id: number): DifficultySpec {
  if (id <= 8) {
    return { rows: 3, cols: 3, blocks: 9, maxInitialEscapable: 3, maxAverageEscapable: 3.4 };
  }

  if (id <= 12) {
    return { rows: 3, cols: 3, blocks: 9, maxInitialEscapable: 3, maxAverageEscapable: 3.2 };
  }

  if (id <= 18) {
    return { rows: 4, cols: 4, blocks: 15, maxInitialEscapable: 3, maxAverageEscapable: 4.2 };
  }

  if (id <= 24) {
    return { rows: 4, cols: 4, blocks: 15, maxInitialEscapable: 3, maxAverageEscapable: 4.5 };
  }

  return { rows: 5, cols: 5, blocks: 24, maxInitialEscapable: 4, maxAverageEscapable: 5.8 };
}

function getDirectionDelta(direction: Direction) {
  if (direction === 'UP') return { dr: -1, dc: 0 };
  if (direction === 'DOWN') return { dr: 1, dc: 0 };
  if (direction === 'LEFT') return { dr: 0, dc: -1 };
  return { dr: 0, dc: 1 };
}

function isInside(row: number, col: number, rows: number, cols: number) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function hasClearPath(row: number, col: number, direction: Direction, blocks: ArrowBlock[], rows: number, cols: number) {
  const occupied = new Set(blocks.map((block) => `${block.row}:${block.col}`));
  const { dr, dc } = getDirectionDelta(direction);
  let r = row + dr;
  let c = col + dc;

  while (isInside(r, c, rows, cols)) {
    if (occupied.has(`${r}:${c}`)) {
      return false;
    }
    r += dr;
    c += dc;
  }

  return true;
}

function cellBlocksArrow(row: number, col: number, block: ArrowBlock, rows: number, cols: number) {
  const { dr, dc } = getDirectionDelta(block.direction);
  let r = block.row + dr;
  let c = block.col + dc;

  while (isInside(r, c, rows, cols)) {
    if (r === row && c === col) {
      return true;
    }
    r += dr;
    c += dc;
  }

  return false;
}

function distanceToExit(row: number, col: number, direction: Direction, rows: number, cols: number) {
  if (direction === 'UP') return row + 1;
  if (direction === 'DOWN') return rows - row;
  if (direction === 'LEFT') return col + 1;
  return cols - col;
}

function centerScore(row: number, col: number, rows: number, cols: number) {
  const centerRow = (rows - 1) / 2;
  const centerCol = (cols - 1) / 2;
  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  return Math.max(0, rows + cols - distance);
}

function getDirectionCount(blocks: ArrowBlock[], direction: Direction) {
  return blocks.filter((block) => block.direction === direction).length;
}

function getCandidates(blocks: ArrowBlock[], spec: DifficultySpec, rng: () => number) {
  const occupied = new Set(blocks.map((block) => `${block.row}:${block.col}`));
  const candidates: Candidate[] = [];

  for (let row = 0; row < spec.rows; row += 1) {
    for (let col = 0; col < spec.cols; col += 1) {
      if (occupied.has(`${row}:${col}`)) {
        continue;
      }

      for (const direction of directions) {
        if (!hasClearPath(row, col, direction, blocks, spec.rows, spec.cols)) {
          continue;
        }

        const blockedExisting = blocks.filter((block) => cellBlocksArrow(row, col, block, spec.rows, spec.cols)).length;
        const directionPenalty = getDirectionCount(blocks, direction) * 0.85;
        const score =
          blockedExisting * 8 +
          centerScore(row, col, spec.rows, spec.cols) * 0.45 +
          distanceToExit(row, col, direction, spec.rows, spec.cols) * 0.65 -
          directionPenalty +
          rng();

        candidates.push({ row, col, direction, score });
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function analyzeBlocks(blocks: ArrowBlock[], rows: number, cols: number): LevelStats {
  const remaining = blocks.map((block) => ({ ...block }));
  const order: string[] = [];
  const escapeCounts: number[] = [];

  while (remaining.length > 0) {
    const escapable = remaining.filter((block) => canEscape(block, remaining, rows, cols));
    escapeCounts.push(escapable.length);

    if (escapable.length === 0) {
      return {
        solvable: false,
        order,
        escapeCounts,
        initialEscapable: escapeCounts[0] ?? 0,
        averageEscapable: 0,
        chokeSteps: 0,
      };
    }

    const nextIndex = remaining.findIndex((block) => block.id === escapable[0].id);
    const [nextBlock] = remaining.splice(nextIndex, 1);
    order.push(nextBlock.id);
  }

  const averageEscapable = escapeCounts.reduce((sum, count) => sum + count, 0) / escapeCounts.length;

  return {
    solvable: true,
    order,
    escapeCounts,
    initialEscapable: escapeCounts[0] ?? 0,
    averageEscapable,
    chokeSteps: escapeCounts.filter((count) => count <= 2).length,
  };
}

function normalizeBlocks(blocks: ArrowBlock[]) {
  return blocks
    .map((block, index) => ({ ...block, id: `b${index + 1}` }))
    .sort((a, b) => a.row - b.row || a.col - b.col || a.direction.localeCompare(b.direction))
    .map((block, index) => ({ ...block, id: `b${index + 1}` }));
}

function buildCandidateLevel(id: number, attempt: number, spec: DifficultySpec) {
  const rng = createRng(id * 100_003 + attempt * 9_973);
  const blocks: ArrowBlock[] = [];

  while (blocks.length < spec.blocks) {
    const candidates = getCandidates(blocks, spec, rng);

    if (candidates.length === 0) {
      break;
    }

    const topCount = Math.min(candidates.length, Math.max(3, Math.floor(candidates.length * 0.22)));
    const choice = candidates[Math.floor(rng() * topCount)];
    blocks.push({ id: `b${blocks.length + 1}`, row: choice.row, col: choice.col, direction: choice.direction });
  }

  return normalizeBlocks(blocks);
}

function scoreLevel(blocks: ArrowBlock[], spec: DifficultySpec) {
  const stats = analyzeBlocks(blocks, spec.rows, spec.cols);

  if (!stats.solvable || blocks.length < spec.blocks) {
    return Number.NEGATIVE_INFINITY;
  }

  const startBlocked = blocks.length - stats.initialEscapable;
  const tooManyInitial = Math.max(0, stats.initialEscapable - spec.maxInitialEscapable);
  const tooOpenAverage = Math.max(0, stats.averageEscapable - spec.maxAverageEscapable);

  return (
    blocks.length * 3 +
    startBlocked * 9 +
    stats.chokeSteps * 7 -
    stats.initialEscapable * 8 -
    stats.averageEscapable * 4 -
    tooManyInitial * 90 -
    tooOpenAverage * 35
  );
}

function generateLevel(id: number): LevelData {
  const spec = getDifficultySpec(id);
  let bestBlocks: ArrowBlock[] | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let attempt = 0; attempt < 240; attempt += 1) {
    const blocks = buildCandidateLevel(id, attempt, spec);
    const score = scoreLevel(blocks, spec);

    if (score > bestScore) {
      bestScore = score;
      bestBlocks = blocks;
    }
  }

  if (!bestBlocks) {
    throw new Error(`Failed to generate level ${id}`);
  }

  return {
    id,
    rows: spec.rows,
    cols: spec.cols,
    blocks: bestBlocks,
  };
}

export const levels: LevelData[] = [
  ...fixedLevels,
  ...Array.from({ length: 25 }, (_, index) => generateLevel(index + 6)),
];
