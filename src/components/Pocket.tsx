import { createElement } from 'react';
import type { MouseEvent } from 'react';
import type { Api } from 'chessground/api';
import type { Role } from 'chessground/types';
import type { PocketCounts, PocketRole } from '../logic/fen';

interface PocketProps {
  pieces: PocketCounts;
  color: 'white' | 'black';
  cgApi: Api | null;
}

const POCKET_ROLES: PocketRole[] = ['p', 'n', 'b', 'r', 'q'];
const roleMap: Record<PocketRole, Role> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
};

export const Pocket = ({ pieces, color, cgApi }: PocketProps) => {
  const handleMouseDown = (roleChar: PocketRole, e: MouseEvent) => {
    if (!cgApi || pieces[roleChar] <= 0) return;

    const role = roleMap[roleChar];
    if (!role) return;

    cgApi.dragNewPiece(
      {
        role,
        color,
      },
      e.nativeEvent,
    );
  };

  return (
    <div className={`pocket ${color}`}>
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
  );
};
