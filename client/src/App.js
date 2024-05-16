import "./App.css";
import Lobby from "./screens/Lobby";
import { Route, Routes } from "react-router-dom";
import RoomPage from "./screens/RoomPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
