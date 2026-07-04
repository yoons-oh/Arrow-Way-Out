import { levels } from '../data/levels';
import { analyzeLevel } from '../logic/solver';

const failures = levels
  .map((level) => ({ level, analysis: analyzeLevel(level) }))
  .filter((result) => !result.analysis.solvable);

if (failures.length > 0) {
  const report = failures.map(({ level }) => `Level ${level.id}`).join(', ');
  throw new Error(`Unsolvable levels found: ${report}`);
}

function expectedBlocks(level: (typeof levels)[number]) {
  const cells = level.rows * level.cols;

  if (level.rows === 2 && level.cols === 2) {
    return cells;
  }

  if (level.rows === 3 && level.cols === 3) {
    return cells;
  }

  if (level.rows >= 4 && level.cols >= 4) {
    return cells - 1;
  }

  return level.blocks.length;
}

const densityFailures = levels.filter((level) => level.blocks.length !== expectedBlocks(level));

if (densityFailures.length > 0) {
  const report = densityFailures
    .map((level) => `Level ${level.id} ${level.rows}x${level.cols}: blocks=${level.blocks.length}, expected=${expectedBlocks(level)}`)
    .join('\n');
  throw new Error(`Level density rule failed:\n${report}`);
}

const summaries = levels.map((level) => {
  const analysis = analyzeLevel(level);
  const empty = level.rows * level.cols - level.blocks.length;
  return `L${level.id}: ${level.rows}x${level.cols}, blocks=${level.blocks.length}, empty=${empty}, open=${analysis.initialEscapable}, avg=${analysis.averageEscapable.toFixed(1)}, choke=${analysis.chokeSteps}`;
});

console.log(`Checked ${levels.length} levels. All levels are solvable and density rules passed.`);
console.log(summaries.join('\n'));
