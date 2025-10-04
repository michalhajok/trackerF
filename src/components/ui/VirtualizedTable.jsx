// src/components/ui/VirtualizedTable.jsx - MISSING!
import { FixedSizeList as List } from "react-window";

export function VirtualizedPositionsList({ positions }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <PositionCard position={positions[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={positions.length}
      itemSize={120}
      itemData={positions}
    >
      {Row}
    </List>
  );
}
