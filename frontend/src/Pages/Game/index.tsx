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

  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate('/lobby');
      return;
    }

    const startBattle = async () => {
      try {
        const response = await axios.post(`http://localhost:3000/api/game/${roomId}/startBattle`);
        console.log('Batalha iniciada:', response.data);
        await fetchGameState();
      } catch (error) {
        console.error('Erro ao iniciar a batalha:', error);
      }
    };

    const fetchGameState = async () => {
      try {
        console.log('🔄 Buscando estado do jogo...');
        const response = await axios.get(`http://localhost:3000/api/game/${roomId}/state`);
        console.log('📡 Resposta completa:', response.data);
        
        const newGameState = {
          currentTurn: response.data.currentTurn || '',
          players: response.data.players || {},
          winner: response.data.winner || null,
        };
        
        console.log('🎮 Novo estado processado:', newGameState);
        console.log('👤 Meu playerId (do location.state):', playerId);
        console.log('🎯 Current turn (do backend):', newGameState.currentTurn);
        
        // CONVERSÃO IMPORTANTE: playerId pode ser string, currentTurn pode ser number
        const myPlayerIdStr = String(playerId);
        const currentTurnStr = String(newGameState.currentTurn);
        
        console.log('🔄 Comparação após conversão:');
        console.log('  - Meu ID (string):', myPlayerIdStr);
        console.log('  - Turno atual (string):', currentTurnStr);
        console.log('  - São iguais?', myPlayerIdStr === currentTurnStr);
        
        const isMyTurnNow = myPlayerIdStr === currentTurnStr;
        
        console.log('✅ É minha vez?', isMyTurnNow);
        
        setGameState(newGameState);
        setIsMyTurn(isMyTurnNow);
      } catch (error) {
        console.error('❌ Erro ao buscar estado:', error);
      }
    };

    startBattle();
    
    // Polling para atualizar o estado do jogo
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, [roomId, playerId, navigate]);

  const handleAttack = async (row, col) => {
    console.log('=== TENTATIVA DE ATAQUE ===');
    console.log('Posição:', { row, col });
    console.log('É minha vez?', isMyTurn);
    console.log('Current turn:', gameState.currentTurn);
    console.log('My player ID:', playerId);
    
    if (!isMyTurn) {
      alert('Não é sua vez!');
      return;
    }

    try {
      console.log('Enviando ataque para:', `http://localhost:3000/api/game/${roomId}/player/${playerId}/attack`);
      
      const response = await axios.post(
        `http://localhost:3000/api/game/${roomId}/player/${playerId}/attack`,
        { row, col },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Resposta do ataque:', response.data);

      // Atualiza o estado do jogo
      const newGameState = {
        currentTurn: response.data.currentTurn,
        players: response.data.players,
        winner: response.data.winner,
      };
      
      // Mesma conversão aqui
      const myPlayerIdStr = String(playerId);
      const currentTurnStr = String(newGameState.currentTurn);
      const isMyTurnNow = myPlayerIdStr === currentTurnStr;
      
      setGameState(newGameState);
      setIsMyTurn(isMyTurnNow);

      // Feedback do resultado
      if (response.data.hitResult === 'hit') {
        alert('🎯 Acertou!');
      } else if (response.data.hitResult === 'miss') {
        alert('💧 Água!');
      }

      // Verifica se há vencedor
      if (response.data.winner) {
        alert(`🏆 O vencedor é: ${response.data.winner}`);
        setTimeout(() => {
          navigate('/lobby');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao processar ataque:', error);
      if (error.response?.data?.error) {
        alert(`❌ ${error.response.data.error}`);
      } else {
        alert('❌ Erro ao processar ataque');
      }
    }
  };

  const { currentTurn, players, winner } = gameState;

  if (winner) {
    return (
      <div className="battle-page-body">
        <h1 className="battle-page-title">Batalha Naval</h1>
        <h2 className="battle-page-winner-message">🏆 O vencedor é: {winner}</h2>
        <button onClick={() => navigate('/lobby')}>Voltar ao Lobby</button>
      </div>
    );
  }

  const renderBoard = (playerData, isOpponent = false) => {
    if (!playerData?.board || playerData.board.length === 0) {
      return <p>Tabuleiro vazio ou não carregado</p>;
    }

    const { board, hits = [] } = playerData;

    return (
      <div className="battle-page-grid">
        {board.map((rowArray, row) =>
          rowArray.map((cell, col) => {
            const hit = hits.find((hit) => hit.row === row && hit.col === col);
            const isHit = hit?.status === 'hit';
            const isMiss = hit?.status === 'miss';
            const hasShip = cell === 'ship' || cell === 1;
            const isClickable = isOpponent && isMyTurn && !hit;

            return (
              <div
                key={`${row}-${col}`}
                className={`battle-page-cell ${
                  isHit ? 'battle-page-cell-hit' : 
                  isMiss ? 'battle-page-cell-miss' : 
                  isClickable ? 'battle-page-cell-clickable' : ''
                }`}
                onClick={isClickable ? () => handleAttack(row, col) : undefined}
                style={{
                  backgroundColor: 
                    isHit ? '#ff4444' : 
                    isMiss ? '#4444ff' : 
                    !isOpponent && hasShip ? '#666666' : 
                    isClickable ? '#00acc1' : 
                    '#2c3e50',
                  cursor: isClickable ? 'pointer' : 'default',
                  border: '2px solid #34495e',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  opacity: isClickable ? 1 : 0.8
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.target.style.backgroundColor = '#26a69a';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.target.style.backgroundColor = '#00acc1';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {isHit ? '💥' : 
                 isMiss ? '❌' : 
                 !isOpponent && hasShip ? '🚢' : 
                 isClickable ? '🎯' : ''}
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Determina qual jogador é qual
  const playerKeys = Object.keys(players);
  const currentPlayerData = players[playerId];
  const opponentKey = playerKeys.find(key => String(key) !== String(playerId));
  const opponentData = players[opponentKey];

  return (
    <div className="battle-page-body">
      <h1 className="battle-page-title">⚓ Batalha Naval</h1>
      <h2 className="battle-page-turn-indicator" style={{
        color: isMyTurn ? '#4CAF50' : '#FF9800',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {isMyTurn ? '🎯 SUA VEZ - Clique para atacar!' : '⏳ Aguarde sua vez...'}
      </h2>

      <div className="battle-page-container">
        {/* Seu Tabuleiro */}
        <div className="battle-page-board">
          <h2 className="battle-page-board-title">
            🛡️ Seu Tabuleiro ({currentPlayerData?.namePlayer || playerId})
          </h2>
          {currentPlayerData ? renderBoard(currentPlayerData, false) : <p>Carregando...</p>}
        </div>

        {/* VS no meio */}
        <div className="battle-page-vs">
          <h1 className="battle-page-vs-text">⚔️<br/>VS</h1>
        </div>

        {/* Tabuleiro do Adversário */}
        <div className="battle-page-board">
          <h2 className="battle-page-board-title">
            🎯 Adversário ({opponentData?.namePlayer || opponentKey})
          </h2>
          {opponentData ? renderBoard(opponentData, true) : <p>Carregando...</p>}
        </div>
      </div>
      
      {/* Debug info melhorado */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div>🏠 Room: {roomId}</div>
        <div>👤 My ID: {playerId} (type: {typeof playerId})</div>
        <div>🎯 Turn: {currentTurn} (type: {typeof currentTurn})</div>
        <div>✅ My Turn: {isMyTurn ? 'YES' : 'NO'}</div>
        <div>🔄 Comparison: "{String(playerId)}" === "{String(currentTurn)}" = {String(playerId) === String(currentTurn)}</div>
      </div>
    </div>
  );
};

export default BattlePage;
