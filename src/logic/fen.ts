import { parseFen } from 'chessops/fen';

export interface GameState {
  fen: string;
  pockets: {
    white: Record<string, number>;
    black: Record<string, number>;
  };
  turn: 'white' | 'black';
}

export const parseCrazyhouseFen = (fen: string): GameState => {
  const setup = parseFen(fen).unwrap();

  // Chessops pockets are [white, black]
  // We access roles by name: pawn, knight, bishop, rook, queen
  const getPocket = (index: number) => {
    const p = setup.pockets?.[index];
    return {
      p: p?.pawn || 0,
      n: p?.knight || 0,
      b: p?.bishop || 0,
      r: p?.rook || 0,
      q: p?.queen || 0,
    };
  };

  return {
    fen,
    pockets: {
      white: getPocket(0),
      black: getPocket(1),
    },
    turn: setup.turn === 'white' ? 'white' : 'black',
  };
};
