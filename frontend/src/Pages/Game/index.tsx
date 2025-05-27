import React, { useState } from 'react';
import './game.css';

const columns = ['A', 'B', 'C', 'D', 'E', 'F'];  
const rows = [1, 2, 3, 4, 5, 6];  

const ships = [
  { id: 'submarine', icon: '🚢', size: 2, maxCount: 3 },
  { id: 'rocket', icon: '🚀', size: 2, maxCount: 2 },
  { id: 'cruise', icon: '🛳️', size: 3, maxCount: 1 },
];

const getColumnIndex = (col: string) => columns.indexOf(col);

const getShipCells = (
  startCol: string,
  startRow: number,
  size: number,
  orientation: 'horizontal' | 'vertical'
): string[] => {
  const startIndex = getColumnIndex(startCol);
  if (startIndex === -1) return [];

  if (orientation === 'horizontal') {
    if (startIndex + size > columns.length) return [];
    return columns
      .slice(startIndex, startIndex + size)
      .map((col) => `${col}${startRow}`);
  } else {
    if (startRow + size - 1 > rows[rows.length - 1]) return [];
    return Array.from({ length: size }).map((_, i) => `${startCol}${startRow + i}`);
  }
};

export default function GridGame() {
  const [placedShips, setPlacedShips] = useState<{ [cellId: string]: string }>({});
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const countShips = (shipId: string) => {
    return Object.values(placedShips).filter((id) => id === shipId).length;
  };

  const countFullShips = (shipId: string) => {
    const ship = ships.find((s) => s.id === shipId);
    if (!ship) return 0;
    const totalCells = countShips(shipId);
    return Math.floor(totalCells / ship.size);
  };

  const canPlaceShip = (cells: string[]) => {
    return cells.every((cell) => !(cell in placedShips));
  };

  const handleCellClick = (cellId: string) => {
    if (!selectedShip) return;

    const ship = ships.find((s) => s.id === selectedShip);
    if (!ship) return;

    const row = Number(cellId.slice(1));
    const col = cellId[0];

    const shipCells = getShipCells(col, row, ship.size, orientation);
    if (shipCells.length === 0) {
      alert('Não cabe o navio nessa posição.');
      return;
    }

    if (countFullShips(ship.id) >= ship.maxCount) {
      alert(
        `Você já colocou todos os ${ship.maxCount} ${
          ship.id === 'submarine'
            ? 'submarinos'
            : ship.id === 'rocket'
            ? 'torpedeiros'
            : 'porta-avião'
        }!`
      );
      return;
    }

    if (!canPlaceShip(shipCells)) {
      alert('Tem navio na área selecionada!');
      return;
    }

    setPlacedShips((prev) => {
      const copy = { ...prev };
      shipCells.forEach((cell) => {
        copy[cell] = ship.id;
      });
      return copy;
    });
  };

  const handleRemoveShipAtCell = (cellId: string) => {
    if (!(cellId in placedShips)) return;

    const shipId = placedShips[cellId];
    const ship = ships.find((s) => s.id === shipId);
    if (!ship) return;

    let row = Number(cellId.slice(1));
    let colIndex = getColumnIndex(cellId[0]);
    const shipCells = [cellId];

    for (let i = colIndex - 1; i >= 0; i--) {
      const leftCell = `${columns[i]}${row}`;
      if (placedShips[leftCell] === shipId) shipCells.push(leftCell);
      else break;
    }
    for (let i = colIndex + 1; i < columns.length; i++) {
      const rightCell = `${columns[i]}${row}`;
      if (placedShips[rightCell] === shipId) shipCells.push(rightCell);
      else break;
    }
    for (let r = row - 1; r >= rows[0]; r--) {
      const upCell = `${cellId[0]}${r}`;
      if (placedShips[upCell] === shipId) shipCells.push(upCell);
      else break;
    }
    for (let r = row + 1; r <= rows[rows.length - 1]; r++) {
      const downCell = `${cellId[0]}${r}`;
      if (placedShips[downCell] === shipId) shipCells.push(downCell);
      else break;
    }

    setPlacedShips((prev) => {
      const copy = { ...prev };
      shipCells.forEach((cell) => delete copy[cell]);
      return copy;
    });
  };

  const renderCell = (col: string, row: number) => {
    const id = `${col}${row}`;
    const shipId = placedShips[id];
    const ship = ships.find((s) => s.id === shipId);

    return (
      <div
        key={id}
        className={`cell ${shipId ? 'selected' : ''}`}
        onClick={() => {
          if (selectedShip) {
            handleCellClick(id);
          } else if (shipId) {
            handleRemoveShipAtCell(id);
          }
        }}
        style={{ cursor: selectedShip ? 'pointer' : shipId ? 'pointer' : 'default' }}
        title={ship ? `${ship.id.toUpperCase()}` : undefined}
      >
        {ship ? ship.icon : ''}
      </div>
    );
  };

  return (
	<div className='body-game '>
<div className="game-container">
      {/* Grid */}
      <div>
        <div className="header-row">
          <div className="empty-cell" />
          {columns.map((col) => (
            <div key={col} className="header-cell">
              {col}
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row} className="grid-row">
            <div className="header-cell">{row}</div>
            {columns.map((col) => renderCell(col, row))}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() =>
              setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))
            }
            style={{ cursor: 'pointer' }}
          >
            Orientação: {orientation.toUpperCase()} (clique para mudar)
          </button>
        </div>

        {ships.map((ship) => {
          const placedCount = countFullShips(ship.id);
          const remaining = ship.maxCount - placedCount;
          const isSelected = selectedShip === ship.id;
          const disabled = remaining <= 0;

          return (
            <div key={ship.id} style={{ marginBottom: 12 }}>
              <div
                className={`ship ${isSelected ? 'selected-ship' : disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setSelectedShip(ship.id)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '1.5rem' }}
                title={`${ship.id.toUpperCase()} (Tamanho: ${ship.size})`}
              >
                {ship.icon}
              </div>
              <div>
                {ship.id.toUpperCase()}s restantes: {remaining}
              </div>
            </div>
          );
        })}

        <button
          className="remove-button"
          onClick={() => setSelectedShip(null)}
          style={{ marginTop: 20 }}
        >
          REMOVER SELEÇÃO
        </button>

        <div style={{ marginTop: 20, fontSize: 14 }}>
          <p>
            <b>Instruções:</b>
          </p>
          <p>- Clique no navio para selecioná-lo.</p>
          <p>- Clique na célula para posicionar o navio na orientação selecionada.</p>
          <p>- Para remover um navio, desmarque a seleção e clique na célula com navio.</p>
          <p>- Use o botão para alternar a orientação horizontal/vertical.</p>
        </div>
      </div>
    </div>
	</div>
    
  );
}
