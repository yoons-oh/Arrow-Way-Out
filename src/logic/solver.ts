import type { LevelData } from '../types';
import { canEscape } from './movement';

export type LevelAnalysis = {
  solvable: boolean;
  order: string[];
  escapeCounts: number[];
  initialEscapable: number;
  averageEscapable: number;
  chokeSteps: number;
};

export function analyzeLevel(level: LevelData): LevelAnalysis {
  const remaining = level.blocks.map((block) => ({ ...block }));
  const order: string[] = [];
  const escapeCounts: number[] = [];

  while (remaining.length > 0) {
    const escapable = remaining.filter((block) => canEscape(block, remaining, level.rows, level.cols));
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

export function getEscapeOrder(level: LevelData) {
  const analysis = analyzeLevel(level);
  return analysis.solvable ? analysis.order : null;
}

export function isLevelSolvable(level: LevelData) {
  return getEscapeOrder(level) !== null;
}
