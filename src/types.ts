export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type ArrowBlock = {
  id: string;
  row: number;
  col: number;
  direction: Direction;
};

export type LevelData = {
  id: number;
  rows: number;
  cols: number;
  blocks: ArrowBlock[];
};

export type LocaleCode = 'ko' | 'en' | 'es' | 'ja' | 'zh-CN' | 'pt-BR';

export type RankingEntry = {
  id: string;
  levelId: number;
  name: string;
  timeMs: number;
  moves: number;
  date: string;
};
