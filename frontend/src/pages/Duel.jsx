import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/home-background.png";

export default function Duel() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");

  const createRoom = () => {
    // เดี๋ยวค่อยต่อ websocket ทีหลัง
    navigate("/waiting-room", {
      state: { role: "host" }
    });
  };

  const joinRoom = () => {
    if (!roomCode) {
      alert("Enter room code");
      return;
    }

    navigate("/waiting-room", {
      state: { role: "guest", roomCode }
    });
  };

  return (
    <div style={{
      ...styles.container,
      backgroundImage: `url(${bg})`
    }}>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>DUEL MODE</h1>

        {/* CREATE ROOM */}
        <button style={styles.btn} onClick={createRoom}>
          CREATE ROOM
        </button>

        {/* JOIN ROOM */}
        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={styles.input}
          />

          <button style={styles.btn} onClick={joinRoom}>
            JOIN ROOM
          </button>
        </div>

        <button style={styles.backBtn} onClick={() => navigate("/mode")}>
          ← BACK
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
  },

  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
  },

  title: {
    color: "white",
    fontSize: "40px",
    marginBottom: "30px",
  },

  btn: {
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "#d6cec6",
    cursor: "pointer",
    margin: "10px",
    boxShadow: "0 5px 0 #9f958c",
  },

  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    marginRight: "10px",
  },

  backBtn: {
    marginTop: "30px",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#aaa",
    cursor: "pointer",
    boxShadow: "0 5px 0 #8e857c",
  },
};