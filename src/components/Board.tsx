import { useEffect, useMemo, useRef } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key, Role } from 'chessground/types';
import type { PendingPromotion, PromotionRole } from '../hooks/useCrazyhouse';

import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import './promotionPicker.css';

interface BoardProps {
  fen: string;
  turn: 'white' | 'black';
  legalDests: Map<Key, Key[]>;
  onMove: (orig: string, dest: string) => void;
  onDrop: (role: Role, dest: string) => void;
  pendingPromotion: PendingPromotion | null;
  interactionLocked: boolean;
  boardSyncKey: number;
  onConfirmPromotion: (role: PromotionRole) => void;
  onCancelPromotion: () => void;
  onInit?: (api: Api) => void;
}

const PROMOTION_ROLES: PromotionRole[] = ['queen', 'knight', 'rook', 'bishop'];

const getPromotionMenuStyle = (pendingPromotion: PendingPromotion) => {
  const fileIndex = pendingPromotion.dest.charCodeAt(0) - 97;

  return {
    left: `calc(${fileIndex * 12.5}% - 2px)`,
    top: pendingPromotion.color === 'black' ? 'calc(50% - 2px)' : undefined,
  };
};

export const Board = ({
  fen,
  turn,
  legalDests,
  onMove,
  onDrop,
  pendingPromotion,
  interactionLocked,
  boardSyncKey,
  onConfirmPromotion,
  onCancelPromotion,
  onInit,
}: BoardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
        premovable: {
          enabled: false,
        },
        predroppable: {
          enabled: false,
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

  useEffect(() => {
    if (boardSyncKey === 0) return;

    apiRef.current?.set({
      fen,
      selected: undefined,
      lastMove: undefined,
      turnColor: turn,
      movable: {
        free: false,
        color: turn,
        dests: legalDests,
      },
    });
  }, [boardSyncKey, fen, legalDests, turn]);

  useEffect(() => {
    apiRef.current?.set({
      turnColor: turn,
      movable: {
        color: interactionLocked ? undefined : turn,
        dests: legalDests,
      },
      draggable: {
        enabled: !interactionLocked,
      },
      selectable: {
        enabled: !interactionLocked,
      },
    });
  }, [interactionLocked, legalDests, turn]);

  useEffect(() => {
    if (!pendingPromotion) return;

    const handlePointerDown = (event: PointerEvent | MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target)) return;
      onCancelPromotion();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancelPromotion();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancelPromotion, pendingPromotion]);

  const promotionMenuStyle = useMemo(
    () => (pendingPromotion ? getPromotionMenuStyle(pendingPromotion) : undefined),
    [pendingPromotion],
  );

  const promotionRoles = useMemo(() => {
    if (!pendingPromotion) return PROMOTION_ROLES;
    return pendingPromotion.color === 'white' ? PROMOTION_ROLES : [...PROMOTION_ROLES].reverse();
  }, [pendingPromotion]);

  return (
    <div className="board-shell">
      <div ref={ref} className="board cg-wrap" />

      {pendingPromotion ? (
        <div className="promotion-overlay" aria-label="Choose promotion piece">
          <div
            ref={menuRef}
            className={`promotion-menu ${pendingPromotion.color}`}
            style={promotionMenuStyle}
            data-promotion-menu
          >
            {promotionRoles.map((role) => (
              <div
                key={role}
                className="promotion-choice"
                role="button"
                aria-label={`Promote to ${role}`}
                onClick={() => onConfirmPromotion(role)}
              >
                <div className="promotion-piece-wrap" aria-hidden>
                  <div className={`promotion-piece-icon ${pendingPromotion.color}-${role}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
