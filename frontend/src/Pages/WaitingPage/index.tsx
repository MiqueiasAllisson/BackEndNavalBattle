import React from 'react';
import { useLocation } from 'react-router-dom';
import './waiting.css';

const WaitingPage = () => {
  const location = useLocation();
  const { roomId, playerId, nameTeam } = location.state || {};

  return (
    <div className="body-game">
      <h1 className="game-title">Batalha Naval</h1>

      <div className="player-card-small">
        <h2>Jogador</h2>
        <p><strong>Sala:</strong> {roomId}</p>
        <p><strong>ID:</strong> {playerId}</p>
        <p><strong>Equipe:</strong> {nameTeam || 'Não especificada'}</p>
      </div>

      <div className="waiting-container">
        <h2>Aguardando os outros jogadores ficarem prontos...</h2>
        <p>Por favor, aguarde enquanto os outros jogadores se preparam.</p>
      </div>
    </div>
  );
};

export default WaitingPage;
