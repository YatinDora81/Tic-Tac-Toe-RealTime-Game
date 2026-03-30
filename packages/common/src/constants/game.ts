export const BOARD_SIZE = 9;

export const WIN_CONDITIONS: readonly [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const DEFAULT_RATING = 1000;
export const ELO_K_FACTOR = 32;
export const TURN_DURATION_SECONDS = 30;
export const DISCONNECT_GRACE_PERIOD_MS = 30_000;

export const EMPTY_CELL = -1;
export const SYMBOL_X = 1;
export const SYMBOL_O = 0;
