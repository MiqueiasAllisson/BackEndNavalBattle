import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './game.css';

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { roomId, playerId } = location.state || {};

  const [selectedShip, setSelectedShip] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [orientation, setOrientation] = useState('H');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placedShips, setPlacedShips] = useState([]);
  const [board, setBoard] = useState(createEmptyBoard(6, 6)); // Inicializa o tabuleiro vazio
  const [shipsRemaining, setShipsRemaining] = useState({
    1: 3, // Submarino
    2: 2, // Torpedeiro
    3: 1, // Porta-avião
  });

  // Função para criar um tabuleiro vazio (com arrays independentes)
  function createEmptyBoard(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate('/');
    }
  }, [roomId, playerId, navigate]);

  const handleCellClick = async (row, col) => {
    if (isRemoving) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/game/${roomId}/player/${playerId}/removeShip`,
          {
            data: { row, col }, // Envia as coordenadas no corpo da requisição
          }
        );

        const { message, board: updatedBoard, placedShips, shipsRemaining } = response.data;

        // Atualiza o estado do tabuleiro e dos navios restantes com base na resposta do backend
        setBoard(updatedBoard);
        setPlacedShips(placedShips);
        setShipsRemaining(shipsRemaining);

        setSuccess(message); // Exibe a mensagem de sucesso
        setError('');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error); // Exibe a mensagem de erro
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
      if (err.response && err.response.data && err.response.data.error) {
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

  return (
    <div className="body-game">
      <div className="game-container">
        <div className="header">
          <h1>Batalha Naval - Sala: {roomId}</h1>
          <p>Jogador: {playerId}</p>
        </div>
        <div className="sidebar">
          <h2>Selecione um navio:</h2>
          <div className="ship-list">
            {Object.keys(shipsRemaining).map((shipId) => (
              <div
                key={shipId}
                className={`ship-item ${selectedShip === parseInt(shipId) ? 'selected' : ''}`}
                onClick={() => handleShipSelection(parseInt(shipId))}
              >
                {shipId === '1' && 'Submarino'}
                {shipId === '2' && 'Torpedeiro'}
                {shipId === '3' && 'Porta-avião'} (Restantes: {shipsRemaining[shipId] || 0})
              </div>
            ))}
          </div>

          <h2>Orientação:</h2>
          <button className="remove-button" onClick={handleOrientationChange}>
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
      </div>
    </div>
  );
};

export default GamePage;
