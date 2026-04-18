import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/home-background.png";
import duelImg from "../assets/duel.png";
import soloImg from "../assets/solitaire.png";
import autoImg from "../assets/auto.png";

const API = import.meta.env.VITE_API_URL;

export default function Mode() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(null);

  const startGame = async (mode) => {
    try {
      const res = await fetch(`${API}/game/mode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          mode,
          name1: "Player1",
          name2: "Player2"
        })
      });

      if (!res.ok) throw new Error("API error");

      navigate("/select-minion", { state: { mode } });

    } catch (err) {
      console.error(err);
      alert("Cannot start game");
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* overlay */}
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>SELECT MODE</h1>

        <div style={styles.grid}>
          {/* DUEL */}
          <img
            src={duelImg}
            alt="duel"
            style={{
              ...styles.img,
              transform: hover === "duel" ? "scale(1.08)" : "scale(1)",
              boxShadow:
                hover === "duel"
                  ? "0 0 25px rgba(255,255,255,0.7)"
                  : "0 10px 25px rgba(0,0,0,0.5)",
            }}
            onMouseEnter={() => setHover("duel")}
            onMouseLeave={() => setHover(null)}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() => navigate("/duel")}
          />

          {/* SOLITAIRE */}
          <img
            src={soloImg}
            alt="solitaire"
            style={{
              ...styles.img,
              transform: hover === "solitaire" ? "scale(1.08)" : "scale(1)",
              boxShadow:
                hover === "solitaire"
                  ? "0 0 25px rgba(255,255,255,0.7)"
                  : "0 10px 25px rgba(0,0,0,0.5)",
            }}
            onMouseEnter={() => setHover("solitaire")}
            onMouseLeave={() => setHover(null)}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() => startGame(2)}
          />

          {/* AUTO */}
          <img
            src={autoImg}
            alt="auto"
            style={{
              ...styles.img,
              transform: hover === "auto" ? "scale(1.08)" : "scale(1)",
              boxShadow:
                hover === "auto"
                  ? "0 0 25px rgba(255,255,255,0.7)"
                  : "0 10px 25px rgba(0,0,0,0.5)",
            }}
            onMouseEnter={() => setHover("auto")}
            onMouseLeave={() => setHover(null)}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() => startGame(3)}
          />
        </div>

        {/* BACK BUTTON */}
        <button style={styles.backBtn} onClick={() => navigate("/")}>
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
    fontSize: "50px",
    marginBottom: "60px",
    letterSpacing: "3px",
  },

  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    alignItems: "center",
  },

  img: {
    width: "300px",
    height: "auto",
    cursor: "pointer",
    borderRadius: "20px",
    transition: "all 0.2s ease",
  },

  backBtn: {
    marginTop: "60px",
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "#d6cec6",
    color: "#2c2c2c",
    cursor: "pointer",
    boxShadow: "0 5px 0 #b5a89c",
  },
};