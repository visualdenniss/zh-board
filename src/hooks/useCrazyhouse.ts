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

const getPosition = (fen: string, fallbackFen: string): Crazyhouse | undefined => {
  return parsePosition(fen) ?? parsePosition(fallbackFen);
};

export type PromotionRole = Extract<Role, 'queen' | 'rook' | 'bishop' | 'knight'>;

export interface PendingPromotion {
  orig: string;
  dest: string;
  color: 'white' | 'black';
}

export const useCrazyhouse = (initialFen: string) => {
  const [fen, setFenState] = useState(initialFen);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [boardSyncKey, setBoardSyncKey] = useState(0);

  const fallbackFen = useMemo(() => {
    const initialPos = parsePosition(initialFen);
    return makeFen((initialPos ?? Crazyhouse.default()).toSetup());
  }, [initialFen]);

  const position = useMemo(() => {
    return getPosition(fen, fallbackFen) ?? parsePosition(fallbackFen)!;
  }, [fen, fallbackFen]);

  const boardFen = useMemo(() => makeFen(position.toSetup()), [position]);

  const gameState = useMemo(() => {
    return parseCrazyhouseFen(boardFen);
  }, [boardFen]);

  const legalDests = useMemo(() => {
    return chessgroundDests(position) as Map<Key, Key[]>;
  }, [position]);

  const syncBoard = useCallback(() => {
    setBoardSyncKey((value) => value + 1);
  }, []);

  const setFen = useCallback((nextFen: string) => {
    setPendingPromotion(null);
    setFenState(nextFen);
  }, []);

  const applyLegalMove = useCallback(
    (move: Move): boolean => {
      const currentPos = getPosition(fen, fallbackFen);
      if (!currentPos || !currentPos.isLegal(move)) {
        syncBoard();
        return false;
      }

      currentPos.play(move);
      setFenState(makeFen(currentPos.toSetup()));
      return true;
    },
    [fen, fallbackFen, syncBoard],
  );

  const makeMove = useCallback(
    (orig: string, dest: string) => {
      if (pendingPromotion) return;

      const from = parseSquare(orig);
      const to = parseSquare(dest);
      if (from === undefined || to === undefined) return;

      const piece = position.board.get(from);
      if (!piece || piece.color !== position.turn) {
        syncBoard();
        return;
      }

      const promotionRank = piece.color === 'white' ? '8' : '1';
      const isPromotion = piece.role === 'pawn' && dest[1] === promotionRank;
      if (isPromotion) {
        setPendingPromotion({
          orig,
          dest,
          color: piece.color,
        });
        return;
      }

      applyLegalMove({ from, to });
    },
    [applyLegalMove, pendingPromotion, position, syncBoard],
  );

  const makeDrop = useCallback(
    (role: Role, dest: string) => {
      if (pendingPromotion) return;

      const to = parseSquare(dest);
      if (to === undefined) return;

      applyLegalMove({ role, to });
    },
    [applyLegalMove, pendingPromotion],
  );

  const confirmPromotion = useCallback(
    (promotion: PromotionRole) => {
      if (!pendingPromotion) return;

      const from = parseSquare(pendingPromotion.orig);
      const to = parseSquare(pendingPromotion.dest);
      setPendingPromotion(null);

      if (from === undefined || to === undefined) {
        syncBoard();
        return;
      }

      applyLegalMove({ from, to, promotion });
    },
    [applyLegalMove, pendingPromotion, syncBoard],
  );

  const cancelPromotion = useCallback(() => {
    if (!pendingPromotion) return;

    setPendingPromotion(null);
    syncBoard();
  }, [pendingPromotion, syncBoard]);

  return {
    fen,
    setFen,
    boardFen,
    boardSyncKey,
    gameState,
    legalDests,
    pendingPromotion,
    makeMove,
    makeDrop,
    confirmPromotion,
    cancelPromotion,
  };
};
