import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BattleshipLobby() {
  const [roomCodeCreate, setRoomCodeCreate] = useState('');
  const [teamNameCreate, setTeamNameCreate] = useState(''); // Nome da equipe ao criar
  const [roomCodeJoin, setRoomCodeJoin] = useState('');
  const [teamNameJoin, setTeamNameJoin] = useState(''); // Nome da equipe ao entrar
  const [message, setMessage] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);

  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!roomCodeCreate || !teamNameCreate) {
      setMessage('Por favor, insira o código da sala e o nome da equipe');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/game/initialize', {
        roomId: roomCodeCreate,
        nameTeam: teamNameCreate, // Envia o nome da equipe
      });

      if (response.status === 200) {
        setMessage(response.data.message);
        navigate('/game', { state: { roomId: roomCodeCreate, playerId: response.data.playerId, nameTeam: teamNameCreate } });
        setRoomCreated(true);
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Erro ao conectar ao servidor.');
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeJoin || !teamNameJoin) {
      setMessage('Por favor, insira o código da sala e o nome da equipe');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/game/joinGame', {
        roomId: roomCodeJoin,
        nameTeam: teamNameJoin, // Envia o nome da equipe
      });

      if (response.status === 200) {
        setMessage(response.data.message);
        navigate('/game', { state: { roomId: roomCodeJoin, playerId: response.data.playerId, nameTeam: teamNameJoin  } });
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Erro ao conectar ao servidor.');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a2740',
        fontFamily: 'sans-serif',
        color: '#f8f8f8',
        backgroundImage: `url('https://modobrincar.rihappy.com.br/wp-content/uploads/2024/08/como-jogar-batalha-naval-topo.jpg')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 15, 63, 0.80)',
          zIndex: -1,
        }}
      />
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        BATALHA NAVAL
      </h1>

      {message && (
        <p
          style={{
            color: '#ffdd57',
            position: 'relative',
            zIndex: 1,
            marginBottom: '1rem',
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Criar Sala */}
        <div
          style={{
            backgroundColor: '#153459',
            padding: '2rem',
            borderRadius: '12px',
            width: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>CRIAR SALA</h2>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Código da Sala</label>
          <input
            type="text"
            value={roomCodeCreate}
            onChange={(e) => setRoomCodeCreate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: '5px',
              border: 'none',
              boxSizing: 'border-box',
            }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome da Equipe</label>
          <input
            type="text"
            value={teamNameCreate}
            onChange={(e) => setTeamNameCreate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: '5px',
              border: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleCreateRoom}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#316ba7',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            CRIAR
          </button>
        </div>

        {/* Entrar em Sala */}
        <div
          style={{
            backgroundColor: '#153459',
            padding: '2rem',
            borderRadius: '12px',
            width: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>ENTRAR EM SALA</h2>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Código da Sala</label>
          <input
            type="text"
            value={roomCodeJoin}
            onChange={(e) => setRoomCodeJoin(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: '5px',
              border: 'none',
              boxSizing: 'border-box',
            }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome da Equipe</label>
          <input
            type="text"
            value={teamNameJoin}
            onChange={(e) => setTeamNameJoin(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: '5px',
              border: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleJoinRoom}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#316ba7',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
            disabled={!roomCodeJoin || !teamNameJoin}
          >
            ENTRAR
          </button>
        </div>
      </div>
    </div>
  );
}

export default BattleshipLobby;
