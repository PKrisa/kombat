import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Config from "./pages/Config";
import Mode from "./pages/Mode";
import SelectMinion from "./pages/SelectMinion";
import SetupStrategy from "./pages/SetupStrategy";
import Game from "./pages/Game";
import Duel from "./pages/Duel";
import WaitingRoom from "./pages/WaitingRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/config" element={<Config />} />
        <Route path="/mode" element={<Mode />} />
        <Route path="/select-minion" element={<SelectMinion />} />
        <Route path="/setup-strategy" element={<SetupStrategy />} />
        <Route path="/game" element={<Game />} />
        <Route path="/duel" element={<Duel />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;