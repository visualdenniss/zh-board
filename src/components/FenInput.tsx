// The bottom FEN field
interface FenInputProps {
  fen: string;
  onChange: (newFen: string) => void;
}

export const FenInput = ({ fen, onChange }: FenInputProps) => {
  return (
    <div className="fen-container" style={{ marginTop: '20px' }}>
      <input
        type="text"
        value={fen}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter Crazyhouse FEN..."
        className="fen-input"
        spellCheck={false}
      />
    </div>
  );
};
