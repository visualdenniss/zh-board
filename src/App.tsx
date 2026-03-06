import { useState } from 'react';
import type { Api } from 'chessground/api';
import { Board } from './components/Board';
import { Pocket } from './components/Pocket';
import { FenInput } from './components/FenInput';
import { useCrazyhouse } from './hooks/useCrazyhouse';
import './App.css';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR[] w KQkq - 0 1';

function App() {
  const { fen, setFen, gameState, makeMove } = useCrazyhouse(START_FEN);
  const [cgApi, setCgApi] = useState<Api | null>(null);

  return (
    <div className="layout">
      <div className="game-container">
        {/* Black Pocket on top */}
        <Pocket color="black" pieces={gameState.pockets.black} cgApi={cgApi} />

        <Board fen={fen} onMove={makeMove} onInit={(api) => setCgApi(api)} />

        {/* White Pocket on bottom */}
        <Pocket color="white" pieces={gameState.pockets.white} cgApi={cgApi} />
      </div>

      <FenInput fen={fen} onChange={setFen} />
    </div>
  );
}

export default App;
