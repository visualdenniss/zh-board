import type { Api } from 'chessground/api';
import type { Role } from 'chessops/types';

interface PocketProps {
  pieces: Record<string, number>;
  color: 'white' | 'black';
  cgApi: Api | null;
}

export const Pocket = ({ pieces, color, cgApi }: PocketProps) => {
  // Map our single-letter keys to Chessground roles
  const roleMap: Record<string, string> = {
    p: 'pawn',
    n: 'knight',
    b: 'bishop',
    r: 'rook',
    q: 'queen',
  };

  const handleMouseDown = (roleChar: string, e: React.MouseEvent) => {
    if (!cgApi || pieces[roleChar] <= 0) return;

    cgApi.dragNewPiece(
      {
        role: roleMap[roleChar] as Role,
        color: color,
      },
      e.nativeEvent,
    );
  };

  return (
    <div className={`pocket ${color}`}>
      {Object.entries(pieces).map(
        ([roleChar, count]) =>
          count > 0 && (
            <div
              key={roleChar}
              className="pocket-piece-wrapper"
              onMouseDown={(e) => handleMouseDown(roleChar, e)}
            >
              {/* This div mimics Chessground's internal structure. 
                The CSS classes 'piece', 'pawn', 'white' etc. 
                will trigger the background-images from your imported CSS.
            */}
              <div className={`piece ${roleMap[roleChar]} ${color}`} />
              <span className="count">{count}</span>
            </div>
          ),
      )}
    </div>
  );
};
