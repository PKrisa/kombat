import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import bg from "../assets/home-background.png";
import { connectSocket } from "../socket";

export default function WaitingRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role;
  const roomCode = location.state?.roomCode;

  const [room, setRoom] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("connected");

      if (role === "host") {
        socket.send(JSON.stringify({ type: "CREATE_ROOM" }));
      } else {
        socket.send(JSON.stringify({
          type: "JOIN_ROOM",
          roomId: roomCode
        }));
      }
    };

    const handleMessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === "ROOM_UPDATE") {
        setRoom(data.room);
      }

      if (data.type === "START_GAME") {
        navigate("/select-minion", { 
            state: { 
                mode: 1,
                role: role
            } 
            });
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
    
  }, []);

  const ready = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "READY" }));
    }
  };

  const start = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "START" }));
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${bg})`,
      }}
    >
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>WAITING ROOM</h1>

        <h2 style = {{color: "white" }}>Room Code: {room?.roomId || "..."}</h2>

        <p>Host: {room?.host ? "✔" : "❌"}</p>
        <p>Guest: {room?.guest ? "✔" : "❌"}</p>
        <p>Guest Ready: {room?.guestReady ? "✔" : "❌"}</p>

        {role === "guest" && (
          <button style={styles.btn} onClick={ready}>
            READY
          </button>
        )}

        {role === "host" && (
          <button
            style={styles.btn}
            onClick={start}
            disabled={!room?.guest || !room?.guestReady}
            >
            START
          </button>
        )}

        <button style={styles.backBtn} onClick={() => navigate("/duel")}>
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
    color: "white",
  },
  title: {
    fontSize: "50px",
    marginBottom: "30px",
    color:"white",
  },
  btn: {
    padding: "12px 30px",
    borderRadius: "12px",
    border: "none",
    margin: "10px",
    cursor: "pointer",
    background: "#b8aea4",
    boxShadow: "0 5px 0 #9f958c",
    color: "#2c2c2c",
  },
  backBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "#a89f96",
    color: "#2c2c2c",
    cursor: "pointer",
    boxShadow: "0 5px 0 #8e857c",
  },
};