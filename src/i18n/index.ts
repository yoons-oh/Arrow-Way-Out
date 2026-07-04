import type { LocaleCode } from '../types';

export const localeNames: Record<LocaleCode, string> = {
  ko: '한국어',
  en: 'English',
  es: 'Español',
  ja: '日本語',
  'zh-CN': '简体中文',
  'pt-BR': 'Português (BR)',
};

export const supportedLocales = Object.keys(localeNames) as LocaleCode[];

type Messages = {
  appTitle: string;
  subtitle: string;
  play: string;
  continue: string;
  settings: string;
  level: string;
  restart: string;
  hint: string;
  moves: string;
  best: string;
  clear: string;
  next: string;
  home: string;
  sound: string;
  language: string;
  reset: string;
  close: string;
  noHint: string;
  lastLevel: string;
  time: string;
  timeLeft: string;
  timeUp: string;
  retry: string;
  ranking: string;
  playerName: string;
  yourTime: string;
  noRecords: string;
  rankIn: string;
};

export const messages: Record<LocaleCode, Messages> = {
  ko: {
    appTitle: 'Arrow Way Out',
    subtitle: '탭해서 길을 열어라',
    play: '플레이',
    continue: '계속하기',
    settings: '설정',
    level: '레벨',
    restart: '다시하기',
    hint: '힌트',
    moves: '이동',
    best: '최고',
    clear: '클리어!',
    next: '다음',
    home: '홈',
    sound: '사운드',
    language: '언어',
    reset: '진행 초기화',
    close: '닫기',
    noHint: '가능한 화살표가 없어요',
    lastLevel: '모든 레벨 완료',
    time: '시간',
    timeLeft: '남은 시간',
    timeUp: '시간 종료',
    retry: '다시 도전',
    ranking: '빠른 기록 TOP 5',
    playerName: '이름',
    yourTime: '내 기록',
    noRecords: '아직 기록이 없어요',
    rankIn: '순위 진입!',
  },
  en: {
    appTitle: 'Arrow Way Out',
    subtitle: 'Tap a path to freedom',
    play: 'Play',
    continue: 'Continue',
    settings: 'Settings',
    level: 'Level',
    restart: 'Restart',
    hint: 'Hint',
    moves: 'Moves',
    best: 'Best',
    clear: 'Clear!',
    next: 'Next',
    home: 'Home',
    sound: 'Sound',
    language: 'Language',
    reset: 'Reset progress',
    close: 'Close',
    noHint: 'No arrow can move',
    lastLevel: 'All levels cleared',
    time: 'Time',
    timeLeft: 'Time left',
    timeUp: 'Time up',
    retry: 'Try again',
    ranking: 'Fastest Top 5',
    playerName: 'Name',
    yourTime: 'Your time',
    noRecords: 'No records yet',
    rankIn: 'New ranking!',
  },
  es: {
    appTitle: 'Arrow Way Out',
    subtitle: 'Toca y abre el camino',
    play: 'Jugar',
    continue: 'Continuar',
    settings: 'Ajustes',
    level: 'Nivel',
    restart: 'Reiniciar',
    hint: 'Pista',
    moves: 'Movs.',
    best: 'Mejor',
    clear: '¡Listo!',
    next: 'Siguiente',
    home: 'Inicio',
    sound: 'Sonido',
    language: 'Idioma',
    reset: 'Borrar progreso',
    close: 'Cerrar',
    noHint: 'Ninguna flecha puede salir',
    lastLevel: 'Niveles completados',
    time: 'Tiempo',
    timeLeft: 'Tiempo restante',
    timeUp: 'Tiempo agotado',
    retry: 'Reintentar',
    ranking: 'Top 5 más rápidos',
    playerName: 'Nombre',
    yourTime: 'Tu tiempo',
    noRecords: 'Sin récords',
    rankIn: '¡Nuevo puesto!',
  },
  ja: {
    appTitle: 'Arrow Way Out',
    subtitle: 'タップで道を開けよう',
    play: 'プレイ',
    continue: '続きから',
    settings: '設定',
    level: 'レベル',
    restart: 'リスタート',
    hint: 'ヒント',
    moves: '手数',
    best: '最高',
    clear: 'クリア!',
    next: '次へ',
    home: 'ホーム',
    sound: 'サウンド',
    language: '言語',
    reset: '進行をリセット',
    close: '閉じる',
    noHint: '動ける矢印がありません',
    lastLevel: '全レベルクリア',
    time: '時間',
    timeLeft: '残り時間',
    timeUp: '時間切れ',
    retry: 'もう一度',
    ranking: '最速トップ5',
    playerName: '名前',
    yourTime: '記録',
    noRecords: '記録はまだありません',
    rankIn: 'ランクイン!',
  },
  'zh-CN': {
    appTitle: 'Arrow Way Out',
    subtitle: '点击打开出路',
    play: '开始',
    continue: '继续',
    settings: '设置',
    level: '关卡',
    restart: '重来',
    hint: '提示',
    moves: '步数',
    best: '最高',
    clear: '过关!',
    next: '下一关',
    home: '主页',
    sound: '音效',
    language: '语言',
    reset: '重置进度',
    close: '关闭',
    noHint: '没有可移动箭头',
    lastLevel: '全部通关',
    time: '时间',
    timeLeft: '剩余时间',
    timeUp: '时间到',
    retry: '重试',
    ranking: '最快前5名',
    playerName: '名字',
    yourTime: '你的时间',
    noRecords: '暂无记录',
    rankIn: '进入排行!',
  },
  'pt-BR': {
    appTitle: 'Arrow Way Out',
    subtitle: 'Toque e abra caminho',
    play: 'Jogar',
    continue: 'Continuar',
    settings: 'Ajustes',
    level: 'Nível',
    restart: 'Reiniciar',
    hint: 'Dica',
    moves: 'Jogadas',
    best: 'Melhor',
    clear: 'Completo!',
    next: 'Próximo',
    home: 'Início',
    sound: 'Som',
    language: 'Idioma',
    reset: 'Zerar progresso',
    close: 'Fechar',
    noHint: 'Nenhuma seta pode sair',
    lastLevel: 'Todos os níveis concluídos',
    time: 'Tempo',
    timeLeft: 'Tempo restante',
    timeUp: 'Tempo esgotado',
    retry: 'Tentar de novo',
    ranking: 'Top 5 mais rápidos',
    playerName: 'Nome',
    yourTime: 'Seu tempo',
    noRecords: 'Sem recordes ainda',
    rankIn: 'Novo ranking!',
  },
};

export function detectLocale(): LocaleCode {
  const browserLocales = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];

  for (const locale of browserLocales) {
    if (!locale) continue;
    if (locale.toLowerCase().startsWith('zh')) return 'zh-CN';
    if (locale.toLowerCase().startsWith('pt')) return 'pt-BR';
    const short = locale.split('-')[0] as LocaleCode;
    if (supportedLocales.includes(short)) return short;
  }

  return 'en';
}
