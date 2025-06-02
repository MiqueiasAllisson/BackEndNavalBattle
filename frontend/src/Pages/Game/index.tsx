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
    players: {},
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
        console.log('Estado do jogo recebido:', response.data);
        const players = response.data.players || {};
        setGameState({
          currentTurn: response.data.currentTurn || '',
          players: {
            player1: players[1] || { namePlayer: 'Jogador 1', board: [], hits: [] },
            player2: players[2] || { namePlayer: 'Jogador 2', board: [], hits: [] },
          },
          winner: response.data.winner || null,
        });
      } catch (error) {
        console.error('Erro ao buscar estado do jogo:', error);
      }
    };

    startBattle();
  }, [roomId, playerId, navigate]);

  const handleAttack = async (row, col) => {
    // Verifica se é a vez do jogador
    if (gameState.currentTurn !== playerId) {
      alert('Não é sua vez!');
      return;
    }

    try {
      // Faz a requisição de ataque ao backend
      const response = await axios.post(
        `http://localhost:3000/api/game/${roomId}/player/${playerId}/attack`,
        { row, col }
      );

      // Atualiza o estado do jogo com os dados retornados
      setGameState((prevState) => ({
        ...prevState,
        players: response.data.players,
        currentTurn: response.data.currentTurn,
        winner: response.data.winner,
      }));

      // Exibe mensagem caso tenha um vencedor
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

  const renderBoard = (board, hits, isClickable = false) => {
    if (!board || board.length === 0) {
      return <p>Tabuleiro vazio ou não carregado</p>;
    }

    return (
      <div className="battle-page-grid">
        {board.map((rowArray, row) =>
          rowArray.map((cell, col) => (
            <div
              key={`${row}-${col}`}
              className={`battle-page-cell ${
                hits?.some((hit) => hit.row === row && hit.col === col)
                  ? 'battle-page-cell-hit'
                  : ''
              }`}
              onClick={isClickable ? () => handleAttack(row, col) : undefined}
            >
              {hits?.some((hit) => hit.row === row && hit.col === col) ? '🔥' : ''}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="battle-page-body">
      <h1 className="battle-page-title">Batalha Naval</h1>
      <h2 className="battle-page-turn-indicator">
        A vez é de: {currentTurn === playerId ? 'Você' : 'Adversário'}
      </h2>

      <div className="battle-page-container">
        {/* Tabuleiro do Jogador 1 */}
        <div className="battle-page-board">
          <h2 className="battle-page-board-title">{players?.player1?.namePlayer || 'Jogador 1'}</h2>
          {renderBoard(players?.player1?.board, players?.player1?.hits)}
        </div>

        {/* Tabuleiro do Jogador 2 */}
        <div className="battle-page-board">
          <h2 className="battle-page-board-title">{players?.player2?.namePlayer || 'Jogador 2'}</h2>
          {renderBoard(players?.player2?.board, players?.player2?.hits, currentTurn === playerId)}
        </div>
      </div>
    </div>
  );
};

export default BattlePage;
