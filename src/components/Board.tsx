import { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key, Role } from 'chessground/types';

import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

interface BoardProps {
  fen: string;
  turn: 'white' | 'black';
  legalDests: Map<Key, Key[]>;
  onMove: (orig: string, dest: string) => void;
  onDrop: (role: Role, dest: string) => void;
  onInit?: (api: Api) => void;
}

export const Board = ({ fen, turn, legalDests, onMove, onDrop, onInit }: BoardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const moveHandlerRef = useRef(onMove);
  const dropHandlerRef = useRef(onDrop);
  const initHandlerRef = useRef(onInit);

  useEffect(() => {
    moveHandlerRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    dropHandlerRef.current = onDrop;
  }, [onDrop]);

  useEffect(() => {
    initHandlerRef.current = onInit;
  }, [onInit]);

  useEffect(() => {
    if (ref.current && !apiRef.current) {
      apiRef.current = Chessground(ref.current, {
        movable: {
          events: {
            after: (orig, dest) => moveHandlerRef.current(orig, dest),
            afterNewPiece: (role, dest) => dropHandlerRef.current(role, dest),
          },
        },
        highlight: {
          lastMove: true,
          check: true,
        },
      });
      if (initHandlerRef.current) initHandlerRef.current(apiRef.current);
    }

    return () => {
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.set({
      fen,
      turnColor: turn,
      movable: {
        free: false,
        color: turn,
        dests: legalDests,
      },
    });
  }, [fen, legalDests, turn]);

  return <div ref={ref} className="board cg-wrap" />;
};
