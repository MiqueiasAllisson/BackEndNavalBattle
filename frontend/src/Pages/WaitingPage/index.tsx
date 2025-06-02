import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './waiting.css';

const WaitingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, playerId, nameTeam } = location.state || {}; // Recebendo roomId e playerId do estado

  const [waitingMessage, setWaitingMessage] = useState('Aguardando os outros jogadores ficarem prontos...');

useEffect(() => {
  console.log('roomId:', roomId); // Verifica o valor de roomId
  console.log('playerId:', playerId); // Verifica o valor de playerId

  if (!roomId || !playerId || !nameTeam) {
    navigate('/');
    return;
  }

  const checkGameStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/game/${roomId}/state`);
      const gameState = response.data;

      console.log('Estado do jogo:', gameState); // Log para depuração

      if (gameState.status === 'in-progress') {
        navigate('/gameBattle', { state: { roomId, playerId, nameTeam } });
      } else if (gameState.status === 'ready') {
        setWaitingMessage('Todos os jogadores estão prontos. Preparando o jogo...');
        navigate('/gameBattle', { state: { roomId, playerId, nameTeam } });
      } else {
        setWaitingMessage('Aguardando os outros jogadores ficarem prontos...');
      }
    } catch (error) {
      console.error('Erro ao verificar o estado do jogo:', error);
      setWaitingMessage('Erro ao conectar ao servidor. Tentando novamente...');
    }
  };

  const intervalId = setInterval(checkGameStatus, 3000);

  return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
}, [roomId, playerId, navigate]);



  return (
    <div className="body-game">
      <h1 className="game-title">Batalha Naval</h1>

      <div className="player-card-small">
        <h2>Jogador</h2>
        <p><strong>Sala:</strong> {roomId}</p>
        <p><strong>ID:</strong> {playerId}</p>
      </div>

      <div className="waiting-container">
        <h2>{waitingMessage}</h2>
        <p>Por favor, aguarde enquanto os outros jogadores se preparam.</p>
      </div>
    </div>
  );
};

export default WaitingPage;