import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './game.css';

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { roomId, playerId, nameTeam } = location.state || {};

  const [selectedShip, setSelectedShip] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [orientation, setOrientation] = useState('H');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placedShips, setPlacedShips] = useState([]);
  const [board, setBoard] = useState(createEmptyBoard(6, 6));
  const [shipsRemaining, setShipsRemaining] = useState({
    1: 3,
    2: 2,
    3: 1,
  });
  const [isReady, setIsReady] = useState(false);

  function createEmptyBoard(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate('/');
    }
  }, [roomId, playerId, navigate]);

  // Verifica se todos os navios foram posicionados
  useEffect(() => {
    const allShipsPlaced = Object.values(shipsRemaining).every((count) => count === 0);
    setIsReady(allShipsPlaced);
  }, [shipsRemaining]);

  const handleCellClick = async (row, col) => {
    if (isRemoving) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/game/${roomId}/player/${playerId}/removeShip`,
          {
            data: { row, col },
          }
        );

        const { message, board: updatedBoard, placedShips, shipsRemaining } = response.data;

        setBoard(updatedBoard);
        setPlacedShips(placedShips);
        setShipsRemaining(shipsRemaining);

        setSuccess(message);
        setError('');
      } catch (err) {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Erro ao remover o navio.');
        }
        setSuccess('');
      }
      return;
    }

    if (!selectedShip) {
      setError('Selecione um navio antes de posicioná-lo.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/game/${roomId}/player/${playerId}/placeShips`,
        {
          row,
          col,
          orientation,
          shipId: selectedShip,
        }
      );

      const { message, board: updatedBoard, placedShips, shipsRemaining } = response.data;

      setPlacedShips(placedShips);
      setBoard(updatedBoard);
      setShipsRemaining(shipsRemaining);
      setSuccess(message);
      setError('');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao posicionar o navio. Tente novamente.');
      }
      setSuccess('');
    }
  };

  const handleShipSelection = (shipId) => {
    setSelectedShip(shipId);
    setIsRemoving(false);
    setError('');
    setSuccess('');
  };

  const handleRemoveMode = () => {
    setSelectedShip(null);
    setIsRemoving((prev) => !prev);
    setError('');
    setSuccess('');
  };

  const handleOrientationChange = () => {
    setOrientation((prev) => (prev === 'H' ? 'V' : 'H'));
  };

  const handleReady = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/game/${roomId}/player/${playerId}/setPlayerReady`
      );

      // Redireciona para a página de "Aguardando o Jogador"
      navigate('/waiting', { state: { roomId, playerId, nameTeam } });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao definir o estado de pronto.');
      }
    }
  };

  return (
    <div className="body-game">
      <h1 className="game-title">Batalha Naval</h1>

      <div className="player-card-small">
        <h2>Jogador</h2>
        <p><strong>Sala:</strong> {roomId}</p>
        <p><strong>ID:</strong> {playerId}</p>
        <p><strong>Equipe:</strong> {nameTeam || 'Não especificada'}</p>
      </div>

      <div className="game-container">
        <div className="sidebar">
          <h2>Selecione um navio:</h2>
          <div className="ship-list">
            {Object.keys(shipsRemaining).map((shipId) => (
              <button
                key={shipId}
                className={`ship-item ${selectedShip === parseInt(shipId) ? 'selected' : ''}`}
                onClick={() => handleShipSelection(parseInt(shipId))}
              >
                {shipId === '1' && 'Submarino'}
                {shipId === '2' && 'Torpedeiro'}
                {shipId === '3' && 'Porta-avião'} (Restantes: {shipsRemaining[shipId] || 0})
              </button>
            ))}
          </div>

          <h2>Orientação:</h2>
          <button className="orientation-button" onClick={handleOrientationChange}>
            {orientation === 'H' ? 'Horizontal' : 'Vertical'}
          </button>

          <button
            className={`remove-button ${isRemoving ? 'selected' : ''}`}
            onClick={handleRemoveMode}
          >
            Remover Navio
          </button>
        </div>

        <div className="grid-container">
          <h2>Tabuleiro:</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}
          <div className="grid">
            {board.map((rowArray, row) =>
              rowArray.map((cell, col) => (
                <div
                  key={`${row}-${col}`}
                  className={`cell ${cell !== 0 ? 'selected' : ''}`}
                  onClick={() => handleCellClick(row, col)}
                >
                  {cell !== 0 ? '🚢' : ''}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ready-container">
          <button
            className={`ready-button ${isReady ? '' : 'disabled'}`}
            onClick={handleReady}
            disabled={!isReady}
          >
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
