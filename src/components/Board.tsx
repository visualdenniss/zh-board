import { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';

import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

interface BoardProps {
  fen: string;
  onMove: (orig: string, dest: string) => void;
  onInit?: (api: Api) => void;
}

export const Board = ({ fen, onMove, onInit }: BoardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);

  useEffect(() => {
    if (ref.current && !apiRef.current) {
      apiRef.current = Chessground(ref.current, {
        fen: fen,
        movable: {
          free: true,
          color: 'both',
          events: { after: onMove },
        },
        // Adds the "hand" cursor when hovering pieces
        highlight: {
          lastMove: true,
          check: true,
        },
      });
      if (onInit) onInit(apiRef.current);
    }
  }, [onInit, onMove]); // Added missing dependencies

  useEffect(() => {
    // We use set({ fen }) to update the board state visually
    apiRef.current?.set({ fen });
  }, [fen]);

  return (
    <div
      ref={ref}
      className="cg-wrap"
      style={{ width: '300px', height: '300px' }}
    />
  );
};
