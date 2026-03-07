import { useState } from 'react';
import type { Api } from 'chessground/api';
import { Board } from './components/Board';
import { Pocket } from './components/Pocket';
import { FenInput } from './components/FenInput';
import { useCrazyhouse } from './hooks/useCrazyhouse';
import './App.css';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR[] w KQkq - 0 1';

function App() {
  const {
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
  } = useCrazyhouse(START_FEN);
  const [cgApi, setCgApi] = useState<Api | null>(null);
  const interactionLocked = pendingPromotion !== null;

  return (
    <div className="layout">
      <div className="analysis-shell">
        <Board
          fen={boardFen}
          turn={gameState.turn}
          legalDests={legalDests}
          onMove={makeMove}
          onDrop={makeDrop}
          pendingPromotion={pendingPromotion}
          interactionLocked={interactionLocked}
          boardSyncKey={boardSyncKey}
          onConfirmPromotion={confirmPromotion}
          onCancelPromotion={cancelPromotion}
          onInit={setCgApi}
        />

        <Pocket
          color="black"
          pieces={gameState.pockets.black}
          cgApi={cgApi}
          disabled={interactionLocked}
        />
        <div className="pocket-spacer" />
        <Pocket
          color="white"
          pieces={gameState.pockets.white}
          cgApi={cgApi}
          disabled={interactionLocked}
        />
      </div>

      <FenInput fen={fen} onChange={setFen} />
    </div>
  );
}

export default App;
