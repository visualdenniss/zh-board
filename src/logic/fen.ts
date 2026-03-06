import { makeFen, parseFen } from 'chessops/fen';

export type PocketRole = 'p' | 'n' | 'b' | 'r' | 'q';
export type PocketCounts = Record<PocketRole, number>;

interface PocketMaterialSide {
  pawn: number;
  knight: number;
  bishop: number;
  rook: number;
  queen: number;
}

export interface GameState {
  fen: string;
  pockets: {
    white: PocketCounts;
    black: PocketCounts;
  };
  turn: 'white' | 'black';
}

export const parseCrazyhouseFen = (fen: string): GameState => {
  const setup = parseFen(fen).unwrap();

  const getPocket = (side: PocketMaterialSide | undefined): PocketCounts => {
    return {
      p: side?.pawn ?? 0,
      n: side?.knight ?? 0,
      b: side?.bishop ?? 0,
      r: side?.rook ?? 0,
      q: side?.queen ?? 0,
    };
  };

  return {
    fen: makeFen(setup),
    pockets: {
      white: getPocket(setup.pockets?.white),
      black: getPocket(setup.pockets?.black),
    },
    turn: setup.turn === 'white' ? 'white' : 'black',
  };
};
