import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/home-background.png";
import logo from "../assets/logo.png";

function Home() {
  const navigate = useNavigate();
  const [hoverBtn, setHoverBtn] = useState(null);

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
        <img src={logo} alt="KOMBAT" style={styles.logo} />

        <div style={styles.buttonContainer}>
          {/* START BUTTON */}
          <button
            style={{
              ...styles.button,
              background:
                hoverBtn === "play" ? "#cfc6bd" : "#d6cec6",
              border:
                hoverBtn === "play" ? "2px solid black" : "none",
              transform:
                hoverBtn === "play" ? "scale(1.05)" : "scale(1)",
              boxShadow:
                hoverBtn === "play"
                  ? "0 6px 0 #b5a89c, 0 0 15px rgba(255,255,255,0.4)"
                  : "0 6px 0 #b5a89c, 0 10px 20px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={() => setHoverBtn("play")}
            onMouseLeave={() => setHoverBtn(null)}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(4px)";
              e.currentTarget.style.boxShadow = "0 2px 0 #b5a89c";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 0 #b5a89c, 0 10px 20px rgba(0,0,0,0.3)";
            }}
            onClick={() => navigate("/mode")}
          >
            ▶ START
          </button>

          {/* CONFIG BUTTON */}
          <button
            style={{
              ...styles.button,
              background:
                hoverBtn === "config" ? "#cfc6bd" : "#d6cec6",
              border:
                hoverBtn === "config" ? "2px solid black" : "none",
              transform:
                hoverBtn === "config" ? "scale(1.05)" : "scale(1)",
              boxShadow:
                hoverBtn === "config"
                  ? "0 6px 0 #b5a89c, 0 0 15px rgba(255,255,255,0.4)"
                  : "0 6px 0 #b5a89c, 0 10px 20px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={() => setHoverBtn("config")}
            onMouseLeave={() => setHoverBtn(null)}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(4px)";
              e.currentTarget.style.boxShadow = "0 2px 0 #b5a89c";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 0 #b5a89c, 0 10px 20px rgba(0,0,0,0.3)";
            }}
            onClick={() => navigate("/config")}
          >
            ⚙ CONFIGURE SETTINGS
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
    backgroundRepeat: "no-repeat",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  logo: {
    width: "500px",
    maxWidth: "80%",
    marginBottom: "40px",
  },

  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  button: {
    padding: "18px 50px",
    fontSize: "22px",
    cursor: "pointer",
    borderRadius: "20px",
    border: "none",
    color: "black",
    fontWeight: "bold",
    transition: "all 0.15s ease",
    background: "#d6cec6",
    boxShadow:
      "0 6px 0 #b5a89c, 0 10px 20px rgba(0,0,0,0.3)",
  },
};

export default Home;