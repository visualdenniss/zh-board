import { useState, useCallback, useMemo } from 'react';
import { parseFen, makeFen } from 'chessops/fen';
import { Crazyhouse } from 'chessops/variant';
import { parseSquare } from 'chessops';
import type { Role, Move } from 'chessops/types';
import { parseCrazyhouseFen } from '../logic/fen';

export const useCrazyhouse = (initialFen: string) => {
  const [fen, setFen] = useState(initialFen);

  const gameState = useMemo(() => {
    try {
      return parseCrazyhouseFen(fen);
    } catch (e) {
      return parseCrazyhouseFen(initialFen);
    }
  }, [fen, initialFen]);

  const makeMove = useCallback(
    (orig: string, dest: string) => {
      const setup = parseFen(fen).value;
      if (!setup) return false;

      const pos = Crazyhouse.fromSetup(setup).value;
      if (!pos) return false;

      let move: Move;

      if (orig.length === 1) {
        const roleMap: Record<string, Role> = {
          p: 'pawn',
          n: 'knight',
          b: 'bishop',
          r: 'rook',
          q: 'queen',
        };
        move = {
          role: roleMap[orig.toLowerCase()],
          to: parseSquare(dest)!,
        };
      } else {
        const from = parseSquare(orig);
        const to = parseSquare(dest);
        if (from === undefined || to === undefined) return false;

        move = { from, to };
      }

      if (pos.isLegal(move)) {
        pos.play(move);
        const newFen = makeFen(pos.toSetup());
        setFen(newFen);
        return true;
      }
      return false;
    },
    [fen],
  );

  return { fen, setFen, gameState, makeMove };
};
