import { useCallback, useMemo, useState } from 'react';
import type { Key } from 'chessground/types';
import { chessgroundDests } from 'chessops/compat';
import { parseFen, makeFen } from 'chessops/fen';
import { Crazyhouse } from 'chessops/variant';
import { parseSquare } from 'chessops';
import type { Role, Move } from 'chessops/types';
import { parseCrazyhouseFen } from '../logic/fen';

const parsePosition = (fen: string): Crazyhouse | undefined => {
  try {
    const setup = parseFen(fen).unwrap();
    return Crazyhouse.fromSetup(setup).unwrap();
  } catch {
    return undefined;
  }
};

export const useCrazyhouse = (initialFen: string) => {
  const [fen, setFen] = useState(initialFen);

  const fallbackFen = useMemo(() => {
    const initialPos = parsePosition(initialFen);
    return makeFen((initialPos ?? Crazyhouse.default()).toSetup());
  }, [initialFen]);

  const position = useMemo(() => {
    return parsePosition(fen) ?? parsePosition(fallbackFen)!;
  }, [fen, fallbackFen]);

  const boardFen = useMemo(() => makeFen(position.toSetup()), [position]);

  const gameState = useMemo(() => {
    return parseCrazyhouseFen(boardFen);
  }, [boardFen]);

  const legalDests = useMemo(() => {
    return chessgroundDests(position) as Map<Key, Key[]>;
  }, [position]);

  const applyLegalMove = useCallback(
    (currentFen: string, move: Move): string => {
      const currentPos = parsePosition(currentFen) ?? parsePosition(fallbackFen);
      if (!currentPos) return currentFen;
      if (!currentPos.isLegal(move)) return currentFen;

      currentPos.play(move);
      return makeFen(currentPos.toSetup());
    },
    [fallbackFen],
  );

  const makeMove = useCallback(
    (orig: string, dest: string) => {
      const from = parseSquare(orig);
      const to = parseSquare(dest);
      if (from === undefined || to === undefined) return;

      setFen((currentFen) => applyLegalMove(currentFen, { from, to }));
    },
    [applyLegalMove],
  );

  const makeDrop = useCallback(
    (role: Role, dest: string) => {
      const to = parseSquare(dest);
      if (to === undefined) return;

      setFen((currentFen) => applyLegalMove(currentFen, { role, to }));
    },
    [applyLegalMove],
  );

  return { fen, setFen, boardFen, gameState, legalDests, makeMove, makeDrop };
};
