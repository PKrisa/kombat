import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { connectSocket } from "../socket";
import bg from "../assets/home-background.png";
import tankImg from "../assets/tank.png";
import archerImg from "../assets/archer.png";
import mageImg from "../assets/mage.png";
import knightImg from "../assets/knight.png";
import shooterImg from "../assets/shooter.png";

const API = import.meta.env.VITE_API_URL;

export default function SetupStrategy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const { minionTypes, mode, role } = location.state;
  const [isEditor, setIsEditor] = useState(false);
  const [setupStatus, setSetupStatus] = useState("PENDING");

  if (!location.state) {
    navigate("/mode");
    return null;
  }

  const typeImages = {
    tank: tankImg,
    archer: archerImg,
    mage: mageImg,
    knight: knightImg,
    shooter: shooterImg,
    };


  const [data, setData] = useState(
    minionTypes.map((type) => ({
        type,
        name: type,
        defense: "",
        strategy: "",
        valid: null,
        message: "",
    }))
    );


  const updateField = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  // parse strategy
  const checkStrategy = async (index) => {
    const item = data[index];

    if (!item.strategy) {
      alert("Please enter strategy");
      return;
    }

    try {
      const res = await fetch(`${API}/game/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategy: item.strategy,
        }),
      });

      const result = await res.json();

      const newData = [...data];
      newData[index].valid = result.valid;
      newData[index].message = result.message;
      setData(newData);

    } catch (err) {
      console.error(err);
      alert("Parse error");
    }
  };

  const startGame = async () => {
    for (let item of data) {
        if (!item.defense || !item.strategy) {
        alert("Fill all fields");
        return;
        }
        if (item.valid === null) {
        alert("Please check all strategies first");
        return;
        }
        if (!item.valid) {
        alert("Some strategies are invalid");
        return;
        }
    }

    await fetch(`${API}/game/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.map(item => ({
        type: item.type,
        name: item.name,
        defense: Number(item.defense),
        strategy: item.strategy,
      }))),
    });

    await fetch(`${API}/game/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        mode,
        name1: name1 || "Player1",
        name2: name2 || "Player2"
      }),
    });

    navigate("/game", { 
      state: { 
        mode, 
        minionTypes,
        name1,
        name2
      } 
    });
    };

  const handleSendStrategy = () => {
    for (let item of data) {
      if (!item.defense || !item.strategy || !item.valid) {
        alert("Please complete and check all strategies first!");
        return;
      }
    }

    socketRef.current.send(JSON.stringify({
      type: "SUBMIT_STRATEGY",
      data: data,
      names: { 
        name1: name1 || "Player 1", 
        name2: name2 || "Player 2" 
      }
    }));
    setSetupStatus("SUBMITTED");
  };

  const handleResponse = (isAccepted) => {
    socketRef.current.send(JSON.stringify({
      type: "RESPONSE_STRATEGY",
      action: isAccepted ? "ACCEPT" : "REJECT",
      names: { 
        name1: name1 || "Player1", 
        name2: name2 || "Player2" 
      }
    }));
  };

  const handlePassControl = () => {
    socketRef.current.send(JSON.stringify({
      type: "TRANSFER_EDITOR",
      newEditor: "guest"
    }));
  };

  const socketRef = useRef(null);

  useEffect(() => {
    if (mode === 1) {
      setIsEditor(role === "host");
      
      const socket = connectSocket();
      socketRef.current = socket;

      const handleMessage = (msg) => {
        const res = JSON.parse(msg.data);

        if (res.type === "EDITOR_TRANSFERRED") {
          setIsEditor(role === res.newEditor);
          setSetupStatus("PENDING");
        }
                
        if (res.type === "STRATEGY_SUBMITTED") {
          setData(res.data);
          setName1(res.names.name1);
          setName2(res.names.name2);
          setSetupStatus("SUBMITTED");
        }
        
        if (res.type === "STRATEGY_RESPONSE") {
          setSetupStatus(res.action === "ACCEPT" ? "ACCEPTED" : "REJECTED");
          if (res.action === "REJECT") {
            alert("Your strategy was rejected. Please revise.");
          }
        }

        if (res.type === "EDITOR_TRANSFERRED") {
          setIsEditor(role === res.newEditor);
          setSetupStatus("PENDING");
        }

        if (res.type === "GAME_STARTED") {

          navigate("/game", {
            state: {
              mode,
              role: role || "guest",
              minionTypes,
              name1: res.names?.name1 || "Player1",
              name2: res.names?.name2 || "Player2"
            }
          });

          sendToBoth(room, Map.of(
              "type", "GAME_STARTED",
              "names", Map.of(
                  "name1", room.hostName != null ? room.hostName : "Player1",
                  "name2", room.guestName != null ? room.guestName : "Player2"
              )
          ));
        }

        if (res.type === "STRATEGY_SUBMITTED") {
          setData(res.data);
          if (res.names) {
            setName1(res.names.name1);
            setName2(res.names.name2);
          }
          setSetupStatus("SUBMITTED");
        }
        if (res.type === "UPDATE_NAME") {
          if (res.name1 !== undefined) setName1(res.name1);
          if (res.name2 !== undefined) setName2(res.name2);
        }
      };

      socket.addEventListener("message", handleMessage);
      return () => socket.removeEventListener("message", handleMessage);
    } else {
      setIsEditor(true);
    }
  }, [mode, role]);

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${bg})` }}>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>SETUP STRATEGY</h1>
        {mode !== 3 && (
          <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
            
            {mode === 1 ? (
              <>
                {role === "host" ? (
                  <input
                    placeholder="Your Name (Player 1)"
                    value={name1}
                    onChange={(e) => {
                      setName1(e.target.value);
                      socketRef.current.send(JSON.stringify({
                        type: "UPDATE_NAME",
                        name1: e.target.value
                      }));
                    }}
                    style={styles.inputName}
                  />
                ) : (
                  <input
                    placeholder="Your Name (Player 2)"
                    value={name2}
                    onChange={(e) => {
                      setName2(e.target.value)

                      socketRef.current.send(JSON.stringify({
                          type:"UPDATE_NAME",
                          name2:e.target.value
                      }))
                    }}
                    style={styles.inputName}
                  />
                )}
              </>
            ) : (
              <>
                <input
                  placeholder="Player 1 name"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  style={styles.inputName}
                />
              </>
            )}
          </div>
        )}

        {data.map((item, index) => (
            <div key={index} style={styles.card}>
                
                {/* LEFT: IMAGE */}
                <div style={styles.left}>
                <img
                    src={typeImages[item.type]}
                    alt={item.type}
                    style={styles.image}
                />
                </div>

                {/* RIGHT: INPUT */}
                <div style={styles.right}>
  
                    <div style={styles.topRow}>
                        <input
                          type="text"
                          value={item.name}
                          disabled={!isEditor || setupStatus === "SUBMITTED"} // ล็อคถ้าไม่ใช่คนเขียน หรือส่งไปแล้ว
                          onChange={(e) => updateField(index, "name", e.target.value)}
                          style={styles.nameInput}
                        />

                        <div style={styles.defenseWrapper}>
                            <span style={styles.defenseLabel}>DEFENSE</span>
                            <input
                              type="number"
                              value={item.defense}
                              disabled={!isEditor || setupStatus !== "PENDING"} // ล็อคถ้าไม่ใช่คนเขียน หรือส่งไปแล้ว
                              onChange={(e) => updateField(index, "defense", e.target.value)}
                              style={styles.defenseInput}
                            />
                            </div>
                        </div>

                    {/* STRATEGY */}
                    <textarea
                          placeholder="Enter strategy..."
                          value={item.strategy}
                          disabled={!isEditor || setupStatus === "SUBMITTED"}
                          onChange={(e) => updateField(index, "strategy", e.target.value)}
                          style={styles.textarea}
                      />

                    <div style={styles.row}>
                        <button
                        style={styles.checkBtn}
                        onClick={() => checkStrategy(index)}
                        >
                        CHECK
                        </button>

                        {item.valid !== null && (
                        <span
                            style={{
                            color: item.valid ? "#4CAF50" : "#ff4d4f",
                            fontWeight: "bold",
                            fontSize: "14px",
                            }}
                        >
                            {item.message}
                        </span>
                        )}
                    </div>

                    </div>

            </div>
            ))}

        <div style={{ marginTop: "30px", textAlign: "center" }}>
  
          {(mode === 2 || mode === 3) && (
            <button style={styles.startBtn} onClick={startGame}>
              START GAME
            </button>
          )}

          {mode === 1 && (
            <div style={styles.actionRow}>
              {isEditor ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                    <button 
                      style={{...styles.startBtn, marginBottom: "10px", opacity: setupStatus === "SUBMITTED" ? 0.5 : 1}} 
                      onClick={handleSendStrategy}
                      disabled={setupStatus === "SUBMITTED"}
                    >
                      {setupStatus === "REJECTED" ? "RE-SUBMIT STRATEGY" : "SEND FOR APPROVAL"}
                    </button>
                    
                    {(setupStatus === "PENDING" || setupStatus === "REJECTED") && (
                      <button 
                        style={styles.passBtn} 
                        onClick={() => {
                          const target = role === "host" ? "guest" : "host";
                          socketRef.current.send(JSON.stringify({
                            type: "TRANSFER_EDITOR",
                            newEditor: target
                          }));
                        }}
                      >
                        GIVE {role === "host" ? "GUEST" : "HOST"} CONTROL
                      </button>
                    )}
                  </div>
                  
                  {setupStatus === "SUBMITTED" && <p style={{color: "white"}}>Waiting for opponent to accept...</p>}
                </>
              ) : (
                <>

                  {setupStatus === "SUBMITTED" ? (
                    <div style={styles.decisionGroup}>
                      <h3 style={{color: "white"}}>Opponent submitted strategy. Accept?</h3>
                      <div style={styles.row}>
                        <button style={styles.acceptBtn} onClick={() => handleResponse(true)}>ACCEPT & START</button>
                        <button style={styles.rejectBtn} onClick={() => handleResponse(false)}>REJECT</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={{color: "white", fontSize: "20px", marginBottom: "15px"}}>
                        {setupStatus === "REJECTED" ? "Waiting for opponent to fix..." : "Opponent is setting up strategy..."}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    position: "relative",
    backgroundPosition: "center",
  },

  overlay: {
    position: "fixed",
    top: 0,    
    width: "100%",
    bottom: 0,  
    background: "rgba(0,0,0,0.4)",
    zIndex: 0,  
  },
  
  content: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "900px",
    paddingBottom: "100px",
  },

  title: {
    color: "white",
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "36px",
    letterSpacing: "2px",
  },

  card: {
    display: "flex",
    gap: "20px",
    background: "#d6cec6",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
    alignItems: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "120px",
  },

  image: {
    width: "125px",
    height: "125px",
    objectFit: "contain",
  },

  type: {
    marginTop: "10px",
    fontWeight: "bold",
    color: "#333",
  },

  right: {
    flex: 1,
  },

  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #aaa",
  },

  nameInput: {
    width: "50%",
    marginBottom: "10px",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    fontWeight: "bold",
    },

  defenseInput: {
    width: "120px",
    marginBottom: "10px",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    },

  topRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
    },

  textarea: {
    width: "95%",
    height: "80px",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    },

  checkBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#b8aea4",
    cursor: "pointer",
    boxShadow: "0 3px 0 #9f958c",
  },

  startBtn: {
    width: "100%",
    padding: "14px",
    marginTop: "20px",
    marginBottom: "120px",
    borderRadius: "12px",
    border: "none",
    background: "#b8aea4",
    color: "#2c2c2c",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 5px 0 #9f958c",
  },

  defenseWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    },

  defenseLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
  },

  inputName: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    margin: "5px",
    fontSize: "14px",
  },

  decisionGroup: {
    background: "rgba(0,0,0,0.85)",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "20px", 
    width: "100%", 
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)", 
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px", 
  },
  
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "15px",
    marginTop: "10px",
  },

  acceptBtn: {
    padding: "12px 25px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  rejectBtn: {
    padding: "12px 25px",
    background: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  passBtn: {
    marginTop: "10px",
    background: "#b8aea4",
    color: "#2c2c2c",
    boxShadow: "0 5px 0 #9f958c",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 9,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};