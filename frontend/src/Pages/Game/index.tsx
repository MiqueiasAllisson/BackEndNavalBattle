import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './games.css';

const BattlePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { roomId, playerId, nameTeam } = location.state || {};

  const [gameState, setGameState] = useState({
    currentTurn: '',
    players: {
      player1: { namePlayer: nameTeam, board: [], hits: [] },
      player2: { namePlayer: nameTeam, board: [], hits: [] },
    },
    winner: null,
  });

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate('/');
      return;
    }

    const startBattle = async () => {
      try {
        await axios.post(`http://localhost:3000/api/game/${roomId}/startBattle`);
        fetchGameState();
      } catch (error) {
        console.error('Erro ao iniciar a batalha:', error);
      }
    };

    const fetchGameState = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/game/${roomId}/state`);
        console.log('Estado do jogo recebido:', response.data); // Log para depuração
        setGameState(response.data);
      } catch (error) {
        console.error('Erro ao buscar estado do jogo:', error);
      }
    };

    startBattle();
  }, [roomId, playerId, navigate]);

  const handleAttack = async (row, col) => {
    if (gameState.currentTurn !== playerId) {
      alert('Não é sua vez!');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/game/${roomId}/player/${playerId}/attack`,
        { row, col }
      );

      setGameState(response.data);

      if (response.data.winner) {
        alert(`O vencedor é: ${response.data.winner}`);
        navigate('/winner', { state: { winner: response.data.winner } });
      }
    } catch (error) {
      console.error('Erro ao processar ataque:', error);
    }
  };

  const { currentTurn, players, winner } = gameState;

  if (winner) {
    return (
      <div className="battle-page-body">
        <h1 className="battle-page-title">Batalha Naval</h1>
        <h2 className="battle-page-winner-message">O vencedor é: {winner}</h2>
      </div>
    );
  }

  return (
    <div className="battle-page-body">
      <h1 className="battle-page-title">Batalha Naval</h1>
      <h2 className="battle-page-turn-indicator">
        A vez é de: {currentTurn === playerId ? 'Você' : 'Adversário'}
      </h2>

      <div className="battle-page-container">
        <div className="battle-page-board">
          <h2 className="battle-page-board-title">{players?.player1?.namePlayer || 'Jogador 1'}</h2>
          <div className="battle-page-grid">
            {players?.player1?.board?.length > 0 ? (
              players.player1.board.map((rowArray, row) =>
                rowArray.map((cell, col) => (
                  <div
                    key={`${row}-${col}`}
                    className={`battle-page-cell ${
                      players.player1.hits.some((hit) => hit.row === row && hit.col === col)
                        ? 'battle-page-cell-hit'
                        : ''
                    }`}
                  >
                    {players.player1.hits.some((hit) => hit.row === row && hit.col === col)
                      ? '🔥'
                      : ''}
                  </div>
                ))
              )
            ) : (
              <p>Tabuleiro vazio ou não carregado</p>
            )}
          </div>
        </div>

        <div className="battle-page-board">
          <h2 className="battle-page-board-title">{players?.player2?.namePlayer || 'Jogador 2'}</h2>
          <div className="battle-page-grid">
            {players?.player2?.board?.length > 0 ? (
              players.player2.board.map((rowArray, row) =>
                rowArray.map((cell, col) => (
                  <div
                    key={`${row}-${col}`}
                    className={`battle-page-cell ${
                      players.player2.hits.some((hit) => hit.row === row && hit.col === col)
                        ? 'battle-page-cell-hit'
                        : ''
                    }`}
                    onClick={() => handleAttack(row, col)}
                  >
                    {players.player2.hits.some((hit) => hit.row === row && hit.col === col)
                      ? '🔥'
                      : ''}
                  </div>
                ))
              )
            ) : (
              <p>Tabuleiro vazio ou não carregado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePage;
