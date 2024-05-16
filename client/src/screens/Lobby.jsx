import React from "react";
import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useLocation, useNavigate } from 'react-router-dom';

const Lobby = () => {
  const [room, setRoom] = useState('');
  const [email, setEmail] = useState('');
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = (e) => {
    e.preventDefault();
    socket.emit('room:join', { email, room });
  };

  const handleJoinRoom = (data) => {
    const { email, room } = data;
    navigate(`/room/${room}`);
  }

  useEffect(() => {
    socket.on('room:join', handleJoinRoom)
    return () => {
        socket.off('room:join', handleJoinRoom)
    }
  }, [socket])

  return (
    <>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <input
          type="email"
          id="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <br />
        <br />
        <input
          type="text"
          id="room"
          value={room}
          placeholder="Room"
          onChange={(e) => setRoom(e.target.value)}
        ></input>
        <br />
        <br />
        <button>Join</button>
      </form>
    </>
  );
};

export default Lobby;
