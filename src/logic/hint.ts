import type { ArrowBlock } from '../types';
import { canEscape } from './movement';

export function findEscapableBlock(blocks: ArrowBlock[], rows: number, cols: number) {
  return blocks.find((block) => canEscape(block, blocks, rows, cols));
}
