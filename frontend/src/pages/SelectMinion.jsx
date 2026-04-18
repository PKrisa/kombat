import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/home-background.png";
import { useEffect, useRef } from "react";
import { connectSocket } from "../socket";

// 🔥 import รูป
import tankImg from "../assets/tank.png";
import archerImg from "../assets/archer.png";
import mageImg from "../assets/mage.png";
import knightImg from "../assets/knight.png";
import shooterImg from "../assets/shooter.png";

export default function SelectMinion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [enemyTypes, setEnemyTypes] = useState([]);
  const [enemyReady, setEnemyReady] = useState(false);
  const socketRef = useRef(null);
  const [myReady, setMyReady] = useState(false);

  if (!location.state) {
    navigate("/mode");
    return null;
  }

  const mode = location.state?.mode;

  const [selected, setSelected] = useState([]);

  const minionTypes = ["tank", "archer", "mage", "knight", "shooter"];

  const typeImages = {
    tank: tankImg,
    archer: archerImg,
    mage: mageImg,
    knight: knightImg,
    shooter: shooterImg,
  };

  const toggleType = (type) => {
    let updated = [];
    if (selected.includes(type)) {
      updated = selected.filter((t) => t !== type);
    } else {
      if (selected.length >= 5) return;
      updated = [...selected, type];
    }

    setSelected(updated);

    if (mode === 1 && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "SELECT_MINIONS",
        types: updated
      }));
    }
  };

  const startGame = async () => {
    if (selected.length === 0) {
      alert("Choose at least 1 type");
      return;
    }

    if (mode === 1) {
      socketRef.current.send(JSON.stringify({
        type: "READY_MINIONS"
      }));

      return;
    }

    await fetch(`${API}/game/minions`, { /* ... */ });
    navigate("/setup-strategy", { state: { mode, minionTypes: selected } });
  };

  const role = location.state?.role;

  useEffect(() => {
    if (mode !== 1) return;

    const socket = connectSocket();
    socketRef.current = socket;

    const handleMessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === "MINION_UPDATE") {

        if (role === "host") {
          setEnemyTypes(data.guestMinions || []);
          setMyReady(data.hostReady);
          setEnemyReady(data.guestReady);
        } else {
          setEnemyTypes(data.hostMinions || []);
          setMyReady(data.guestReady);
          setEnemyReady(data.hostReady);
        }
      }

      if (data.type === "BOTH_READY") {
        navigate("/setup-strategy", {
          state: {
            mode: 1,
            minionTypes: data.finalMinions,
            role: role
          }
        });
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [mode, role, navigate]);

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${bg})`,
      }}
    >
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>SELECT MINION TYPES</h1>

        {/* CARD GRID */}
        <div style={styles.grid}>
          {minionTypes.map((type) => (
            <div
              key={type}
              style={{
                ...styles.card,
                border: selected.includes(type)
                  ? "5px solid #4CAF50"
                  : "2px solid transparent",
                transform: selected.includes(type) ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => toggleType(type)}
              
            >
              <img
                src={typeImages[type]}
                alt={type}
                style={styles.image}
              />

            </div>
          ))}
          
        </div>

        {mode === 1 && (
          <div style={styles.readyBox}>
            <p>You Ready {myReady ? "✅" : "⌛"}</p>
            <p>Opponent Ready {enemyReady ? "✅" : "⌛"}</p>
            <p>
              Opponent Selected:
              {enemyTypes.length ? enemyTypes.join(", ") : " None"}
            </p>
          </div>
        )}
        
        {/* ACTION BUTTONS */}
        <div style={styles.actionContainer}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← BACK
          </button>

          <button style={styles.startBtn} onClick={startGame}>
            SET UP STRATEGY
          </button>

        </div>
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
    marginBottom: "40px",
  },

  grid: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "40px",
  },

  card: {
    width: "140px",
    height: "140px",
    background: "#d6cec6",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 6px 0 #b5a89c",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    marginBottom: "10px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#2c2c2c",
  },

  actionContainer: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
  },

  startBtn: {
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "#b8aea4",
    color: "#2c2c2c",
    cursor: "pointer",
    boxShadow: "0 5px 0 #9f958c",
  },

  backBtn: {
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "#a89f96",
    color: "#2c2c2c",
    cursor: "pointer",
    boxShadow: "0 5px 0 #8e857c",
  },
  readyBox: {
    marginTop: "20px",
    marginBottom: "20px",
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
    lineHeight: "1.8",
  },
};