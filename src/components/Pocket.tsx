import { createElement, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import type { Api } from 'chessground/api';
import type { Role } from 'chessground/types';
import type { PocketCounts, PocketRole } from '../logic/fen';

interface PocketProps {
  pieces: PocketCounts;
  color: 'white' | 'black';
  cgApi: Api | null;
  disabled?: boolean;
}

const POCKET_ROLES: PocketRole[] = ['p', 'n', 'b', 'r', 'q'];
const roleMap: Record<PocketRole, Role> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
};

interface DragPreviewState {
  role: Role;
  x: number;
  y: number;
}

export const Pocket = ({ pieces, color, cgApi, disabled = false }: PocketProps) => {
  const [dragPreview, setDragPreview] = useState<DragPreviewState | null>(null);

  useEffect(() => {
    return () => {
      document.body.classList.remove('pocket-dragging');
    };
  }, []);

  useEffect(() => {
    if (!dragPreview) return;

    const updatePreview = (event: globalThis.MouseEvent) => {
      setDragPreview((current) =>
        current
          ? {
              ...current,
              x: event.clientX,
              y: event.clientY,
            }
          : null,
      );
    };

    const clearPreview = () => {
      setDragPreview(null);
      document.body.classList.remove('pocket-dragging');
    };

    window.addEventListener('mousemove', updatePreview);
    window.addEventListener('mouseup', clearPreview, true);
    window.addEventListener('blur', clearPreview);

    return () => {
      window.removeEventListener('mousemove', updatePreview);
      window.removeEventListener('mouseup', clearPreview, true);
      window.removeEventListener('blur', clearPreview);
    };
  }, [dragPreview]);

  const handleMouseDown = (roleChar: PocketRole, e: MouseEvent) => {
    if (disabled || !cgApi || pieces[roleChar] <= 0) return;

    e.preventDefault();

    const role = roleMap[roleChar];
    if (!role) return;

    setDragPreview({
      role,
      x: e.clientX,
      y: e.clientY,
    });
    document.body.classList.add('pocket-dragging');

    cgApi.dragNewPiece(
      {
        role,
        color,
      },
      e.nativeEvent,
    );
  };

  return (
    <>
      <div className={`pocket ${color}${disabled ? ' disabled' : ''}`}>
        {POCKET_ROLES.map((roleChar) => {
          const count = pieces[roleChar];
          if (count <= 0) return null;

          return (
            <div
              key={roleChar}
              className="pocket-piece-wrapper"
              onMouseDown={(e) => handleMouseDown(roleChar, e)}
            >
              <div className="cg-wrap pocket-cg-wrap" aria-hidden>
                {createElement('piece', {
                  className: `${roleMap[roleChar]} ${color}`,
                })}
              </div>
              <span className="count">{count}</span>
            </div>
          );
        })}
      </div>

      {dragPreview ? (
        <div
          className="pocket-drag-preview cg-wrap"
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
          }}
          aria-hidden
        >
          {createElement('piece', {
            className: `${dragPreview.role} ${color}`,
          })}
        </div>
      ) : null}
    </>
  );
};
