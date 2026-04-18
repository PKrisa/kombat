import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import bg from "../assets/home-background.png";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";

// 🔥 ใส่รูปตาม type
import tankImg from "../assets/tank.png";
import archerImg from "../assets/archer.png";
import mageImg from "../assets/mage.png";
import knightImg from "../assets/knight.png";
import shooterImg from "../assets/shooter.png";

const gridSize = 8;
const hexSize = 40;
const hexWidth = 2 * hexSize;
const hexHeight = Math.sqrt(3) * hexSize;
const horizOffset = hexWidth * 0.75;
const vertOffset = hexHeight * 0.5;

// 🔥 map type → รูป
const getMinionImage = (type) => {
  switch (type) {
    case "tank": return tankImg;
    case "archer": return archerImg;
    case "mage": return mageImg;
    case "knight": return knightImg;
    case "shooter": return shooterImg;
    default: return tankImg;
  }
};

function Game() {
  const [gameState, setGameState] = useState(null);
  const [hovered, setHovered] = useState(null);
  const location = useLocation();
  const selectedTypes = location.state?.minionTypes || [];
  const mode = location.state?.mode || 3;
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const name1 = location.state?.name1;
  const name2 = location.state?.name2;
  const [selectedCell, setSelectedCell] = useState(null);
  const socketRef = useRef(null);

  const loadGame = async () => {
    const res = await fetch("http://localhost:8080/game/state");
    const data = await res.json();
    setGameState(data);
  };

  const startGame = async () => {
    await fetch("http://localhost:8080/game/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mode: mode })
    });
  };

  useEffect(() => {
    const init = async () => {
      const res = await fetch("http://localhost:8080/game/state");
      const data = await res.json();
      setGameState(data);
    };

    init();
  }, []);

  useEffect(() => {
    if (mode !== 3) return;

    const interval = setInterval(async () => {

      await fetch("http://localhost:8080/game/turn", {
        method: "POST"
      });

      await loadGame();

    }, 1000);

    return () => clearInterval(interval);
  }, []); // 🔥 แก้ตรงนี้

  const currentPlayerId = gameState?.currentPlayer;

  const role = location.state?.role;

  const isMyTurn =
    (role === "host" && currentPlayerId === 1) ||
    (role === "guest" && currentPlayerId === 2);

  useEffect(() => {
    setSelectedCell(null);

    if (!isMyTurn) {
      setSelectedType(null);
    }
  }, [currentPlayerId]);

  useEffect(() => {
    if (mode !== 2) return;

    if (currentPlayerId === 2) { // bot
      const run = async () => {
        await fetch("http://localhost:8080/game/turn", {
          method: "POST"
        });
        await loadGame();
      };
      run();
    }
  }, [currentPlayerId]);

  useEffect(() => {
    if (mode !== 1) return;

    const ws = connectSocket();
    socketRef.current = ws;

    const handleMessage = (msg) => {
      const res = JSON.parse(msg.data);

      if (res.type === "GAME_STATE") {
        setGameState({ ...res });
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [mode, role]);

  const currentPlayer =
    gameState?.players?.find(p => p.id === currentPlayerId);

  // 🔥 next turn
  const nextTurn = async () => {
    await fetch("http://localhost:8080/game/turn", {
      method: "POST"
    });
    await loadGame();
  };

  const handleCellClick = async (row, col) => {

    if (mode === 3) return;

    if (mode === 1) {

      if (!isMyTurn) return;

      if (!selectedType) {
        alert("Select minion first");
        return;
      }

      socketRef.current?.send(JSON.stringify({
        type: "SPAWN",
        row,
        col,
        minionType: selectedType
      }));

      setSelectedType(null);

      return;
    }

    // mode ปกติ
    if (currentPlayerId !== 1) return;

    await fetch("http://localhost:8080/game/spawn", {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        row,
        col,
        type:selectedType
      })
    });

    await loadGame();
  };

  const buySpawn = async (row, col) => {

    if (mode === 1 && !isMyTurn) return;

    await fetch("http://localhost:8080/game/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ row, col })
    });

    await loadGame();
  };

  const endTurn = async () => {

    // duel mode
    if (mode === 1) {

      if (!isMyTurn) return;

      socketRef.current?.send(JSON.stringify({
        type: "END_TURN"
      }));

      return;
    }

    // solitaire mode
    await fetch("http://localhost:8080/game/turn", {
      method: "POST"
    });

    await new Promise(r => setTimeout(r, 500));

    await fetch("http://localhost:8080/game/turn", {
      method: "POST"
    });

    await loadGame();
  };

  

  const renderHexes = () => {
    let elements = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let x = col * horizOffset;
        let y = row * vertOffset * 2 + ((col + 1) % 2) * vertOffset;
        let key = `${row},${col}`;

        let fillColor = "#F7DCB9";

        const isSpawnP1 = gameState?.spawns?.some(
          p => p.row === row && p.col === col && p.owner === 1
        );

        const isSpawnP2 = gameState?.spawns?.some(
          p => p.row === row && p.col === col && p.owner === 2
        );
        
        const canBuyP1 = gameState?.buyableP1?.some(
          p => p.row === row && p.col === col
        );

        const canBuyP2 = gameState?.buyableP2?.some(
          p => p.row === row && p.col === col
        );


        // 🔥 สีช่องซื้อได้ (ต้องไม่ใช่ spawn เดิม)
        if (isSpawnP1) fillColor = "#6B8A7A";
        else if (isSpawnP2) fillColor = "#DE802B";

        else if ( (mode === 2 || role === "host") && currentPlayerId === 1 && canBuyP1) {
          fillColor = "#A98B76";
        }
        else if ( role === "guest" && currentPlayerId === 2 && canBuyP2) {
          fillColor = "#BFA28C";
        }

        // 🔥 หา minion
        const minionsHere =
          gameState?.minions?.filter(
            m => m.row === row && m.col === col
          ) || [];

        const minion = minionsHere[0];

        elements.push(
          <g key={key}>
            <polygon
              points="40,0 20,34.64 -20,34.64 -40,0 -20,-34.64 20,-34.64"
              transform={`translate(${x},${y})`}
              style={{
                ...styles.hex,
                fill: hovered === key ? "#E9EED9" : fillColor
              }}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if ((mode === 2 || role === "host") && canBuyP1) {
                  setSelectedCell({ row, col }); // 🔥 แทน buy ทันที
                } else if (role === "guest" && canBuyP2) {
                  setSelectedCell({row,col});
                }
                else {
                  handleCellClick(row,col);
                }
              }}
            />

            {minion && (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={22}
                  fill="none"
                  stroke={minion.owner === 1 ? "#6B8A7A" : "#DE802B"}
                  strokeWidth="3"
                />
                {/* 🔥 รูป */}
                <image
                  href={getMinionImage(minion.type)}
                  x={x - 20}
                  y={y - 20}
                  width="40"
                  height="40"
                />

                {/* 🔥 HP BAR background */}
                <rect
                  x={x - 20}
                  y={y + 18}
                  width="40"
                  height="5"
                  fill="gray"
                />

                {/* 🔥 HP BAR สีเขียว */}
                <rect
                  x={x - 20}
                  y={y + 18}
                  width={(minion.hp / 100) * 40}  // 👈 ต้องมี hp จาก backend
                  height="5"
                  fill="limegreen"
                />
              </>
            )}
          </g>
        );
      }
    }

    return elements;
  };

  if (!gameState) return <h2 style={{ color: "white" }}>Loading...</h2>;

  const p1 = gameState.players?.find(p => p.id === 1);
  const p2 = gameState.players?.find(p => p.id === 2);

  return (
    <div style={styles.container}>
      {gameState?.isGameOver && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white"
        }}>

          {gameState?.logs?.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          <h1 style={{ color: "red", fontSize: "64px" }}>
            GAME OVER
          </h1>

          <h2 style={{color:"white"}}>🏆 Winner: {gameState.winner}</h2>
          <p>{gameState.winReason}</p>

          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            Back to Home
          </button>
        </div>
      )}
      <div style={{position:"absolute", top:80, left:20, color:"white"}}>
        Selected: {selectedTypes.join(", ")}
      </div>
      {/* 🔹 Player 1 */}
      
        <div style={styles.panelLeft}>
          <h3>{p1?.name}</h3>
          <p>💰 Budget: {p1?.budget}</p>
          <p>👾 Minions: {p1?.minionCount}</p>

          {/* 🔥 minion bar */}
          {mode !== 3 && (mode === 2 || (role === "host" && isMyTurn)) && (
            <div style={styles.minionBarLeft}>
              {selectedTypes.map(type => (
                <img
                  key={type}
                  src={getMinionImage(type)}
                  onClick={() => {
                    if (selectedType === type) {
                      setSelectedType(null); // 🔥 ยกเลิก
                    } else {
                      setSelectedType(type);
                    }
                  }}
                  style={{
                    ...styles.minionIcon,
                    border: selectedType === type ? "3px solid limegreen" : "2px solid white"
                  }}
                />
              ))}
            </div>
          )}

          {/* 🔥 end turn */}
          {mode !== 3 && (mode === 2 || (role === "host" && isMyTurn)) && (
            <button style={styles.endBtnLeft} onClick={endTurn}>
              END TURN
            </button>
          )}
        </div>

      {/* 🔹 Turn */}
      <h2 style={styles.turn}>Turn: {gameState.turn}</h2>

      <h3 style={{
        position: "absolute",
        top: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "yellow"
      }}>
        ▶ {currentPlayer?.name}'s turn
      </h3>

      {/* 🔹 Board */}
      <div style={styles.boardWrapper}>
        <svg
          viewBox={`-20 -${hexHeight + 40} ${gridSize * horizOffset} ${
            gridSize * vertOffset * 2.5
          }`}
          width="60vw"
          height="80vh"
        >
          {renderHexes()}
        </svg>
      </div>

      {/* 🔹 Player 2 */}
      <div style={styles.panelRight}>
        <h3>{p2?.name|| name2 || "Player 2"}</h3>
        <p>💰 Budget: {p2?.budget}</p>
        <p>👾 Minions: {p2?.minionCount}</p>

        {mode === 1 && role === "guest" && isMyTurn && (
            <div style={styles.minionBarLeft}>
              {selectedTypes.map(type => (
                <img
                  key={type}
                  src={getMinionImage(type)}
                  onClick={() => {
                    if (selectedType === type) {
                      setSelectedType(null); // 🔥 ยกเลิก
                    } else {
                      setSelectedType(type);
                    }
                  }}
                  style={{
                    ...styles.minionIcon,
                    border: selectedType === type ? "3px solid limegreen" : "2px solid white"
                  }}
                />
              ))}
            </div>
          )}

          {/* 🔥 end turn */}
          {mode === 1 && role === "guest" && isMyTurn && (
            <button style={styles.endBtnLeft} onClick={endTurn}>
              END TURN
            </button>
          )}
      </div>

      {selectedCell && (
        <div style={{
          position: "absolute",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#d6cec6",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
          zIndex: 100,
          textAlign: "center"
        }}>
          <p style={{ marginBottom: "10px" }}>Buy this spawn?</p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            
            <button style={{background:"#9f958c", color:"white"}} onClick={async () => {
              await buySpawn(selectedCell.row, selectedCell.col);
              setSelectedCell(null);
            }}>
              BUY
            </button>

            <button style={{background:"#9f958c", color:"white"}} onClick={() => setSelectedCell(null)}>
              BACK
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative"
  },
  panelLeft: {
    position: "absolute",
    top: "20px",
    left: "20px",
    width: "220px",
    padding: "20px",
    border: "3px solid #6B8A7A",
    borderRadius: "10px",
    background: "#d6cec6"
  },
  panelRight: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    width: "220px",
    padding: "20px",
    border: "3px solid #DE802B",
    borderRadius: "10px",
    background: "#d6cec6"
  },
  hex: {
    stroke: "black",
    strokeWidth: 2
  },
  button: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px"
  },
  boardWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
  turn: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "black"
  },
  minionBar: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "15px",
    background: "rgba(0,0,0,0.6)",
    padding: "10px 20px",
    borderRadius: "15px",
  },

  minionIcon: {
    width: "60px",
    height: "60px",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "all 0.2s ease"
  },
  endBtn: {
    position: "absolute",
    bottom: "100px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 25px",
    fontSize: "16px",
    borderRadius: "10px",
    background: "#d6cec6",
    cursor: "pointer"
  },
  minionBarLeft: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  endBtnLeft: {
    marginTop: "15px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#9f958c",
    color: "white"
  },
};

export default Game;