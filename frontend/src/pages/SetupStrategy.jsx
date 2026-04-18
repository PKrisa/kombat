import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { connectSocket } from "../socket";
import bg from "../assets/home-background.png";
import tankImg from "../assets/tank.png";
import archerImg from "../assets/archer.png";
import mageImg from "../assets/mage.png";
import knightImg from "../assets/knight.png";
import shooterImg from "../assets/shooter.png";

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

  // 🔥 parse strategy
  const checkStrategy = async (index) => {
    const item = data[index];

    if (!item.strategy) {
      alert("Please enter strategy");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/game/parse", {
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

    await fetch("http://localhost:8080/game/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.map(item => ({
        type: item.type,
        name: item.name,
        defense: Number(item.defense),
        strategy: item.strategy,
      }))),
    });

    await fetch("http://localhost:8080/game/start", {
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

  // สำหรับคนเขียน: ส่งไปให้อีกฝั่งตรวจ
  const handleSendStrategy = () => {
    for (let item of data) {
      if (!item.defense || !item.strategy || !item.valid) {
        alert("Please complete and check all strategies first!");
        return;
      }
    }

    // มั่นใจว่าส่งชื่อปัจจุบัน (name1, name2) ไปด้วยเสมอ
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

  // สำหรับคนตรวจ: ยอมรับหรือปฏิเสธ
  const handleResponse = (isAccepted) => {
    socketRef.current.send(JSON.stringify({
      type: "RESPONSE_STRATEGY",
      action: isAccepted ? "ACCEPT" : "REJECT",
      // ส่งชื่อแนบไปด้วยตอน Accept เพื่อให้ Socket Server กระจายชื่อที่ถูกต้อง
      names: { 
        name1: name1 || "Player1", 
        name2: name2 || "Player2" 
      }
    }));
  };

  // สำหรับ Host: โยนสิทธิ์ให้ Guest เขียน
  const handlePassControl = () => {
    socketRef.current.send(JSON.stringify({
      type: "TRANSFER_EDITOR",
      newEditor: "guest"
    }));
  };

  // เพิ่ม useRef สำหรับ Socket
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. กำหนดสิทธิ์การแก้ไขเบื้องต้น
    if (mode === 1) {
      // ให้ Host เป็นคนเริ่มเขียนก่อนโดย Default
      setIsEditor(role === "host");
      
      // เชื่อมต่อ Socket
      const socket = connectSocket();
      socketRef.current = socket;

      const handleMessage = (msg) => {
        const res = JSON.parse(msg.data);

        if (res.type === "EDITOR_TRANSFERRED") {
          setIsEditor(role === res.newEditor); // ถ้า role เราตรงกับที่ส่งมา ก็จะได้เป็นคนเขียน
          setSetupStatus("PENDING");
        }
                
        // เมื่ออีกฝั่งส่ง Strategy มาให้ตรวจ
        if (res.type === "STRATEGY_SUBMITTED") {
          setData(res.data);
          setName1(res.names.name1);
          setName2(res.names.name2);
          setSetupStatus("SUBMITTED");
        }
        
        // เมื่อผลการตัดสินออกมา (Accept/Reject)
        if (res.type === "STRATEGY_RESPONSE") {
          setSetupStatus(res.action === "ACCEPT" ? "ACCEPTED" : "REJECTED");
          if (res.action === "REJECT") {
            alert("Your strategy was rejected. Please revise.");
          }
        }

        // เมื่อ Host โยนสิทธิ์ให้ Guest
        if (res.type === "EDITOR_TRANSFERRED") {
          setIsEditor(role === res.newEditor);
          setSetupStatus("PENDING");
        }

        // ใน useEffect -> handleMessage
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

          // แก้ GAME_STARTED ให้ส่ง names ไปด้วย
          sendToBoth(room, Map.of(
              "type", "GAME_STARTED",
              "names", Map.of(
                  "name1", room.hostName != null ? room.hostName : "Player1",
                  "name2", room.guestName != null ? room.guestName : "Player2"
              )
          ));
        }

        // ภายใน handleMessage 
        if (res.type === "STRATEGY_SUBMITTED") {
          setData(res.data);
          // อัปเดตชื่อจากที่ส่งมาใน socket
          if (res.names) {
            setName1(res.names.name1);
            setName2(res.names.name2);
          }
          setSetupStatus("SUBMITTED");
        }
        // เพิ่มเข้าไปใน handleMessage ภายใน useEffect
        if (res.type === "UPDATE_NAME") {
          if (res.name1 !== undefined) setName1(res.name1);
          if (res.name2 !== undefined) setName2(res.name2);
        }
      };

      socket.addEventListener("message", handleMessage);
      return () => socket.removeEventListener("message", handleMessage);
    } else {
      // โหมด 2, 3 เป็น Editor ตลอดเวลา
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
            
            {/* ถ้าเป็นโหมด Duel (1) ให้เช็ค role แต่ถ้าโหมดอื่นให้แสดงปกติ */}
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
              /* กรณีโหมด Single Player หรือโหมดอื่นๆ ที่ไม่ใช่ Duel */
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
  
          {/* ส่วนที่ 1: โหมดเล่นคนเดียว/บอท */}
          {(mode === 2 || mode === 3) && (
            <button style={styles.startBtn} onClick={startGame}>
              START GAME
            </button>
          )}

          {/* ส่วนที่ 2: โหมด Duel */}
          {mode === 1 && (
            <div style={styles.actionRow}>
              {isEditor ? (
                <>
                  {/* ฝั่งคนเขียน (ใครเป็น Editor จะเห็นชุดนี้) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                    <button 
                      style={{...styles.startBtn, marginBottom: "10px", opacity: setupStatus === "SUBMITTED" ? 0.5 : 1}} 
                      onClick={handleSendStrategy}
                      disabled={setupStatus === "SUBMITTED"}
                    >
                      {setupStatus === "REJECTED" ? "RE-SUBMIT STRATEGY" : "SEND FOR APPROVAL"}
                    </button>
                    
                    {/* ปุ่มโยนสิทธิ์: แสดงเมื่อยังไม่ได้กดส่ง และเป็นโหมด Duel */}
                    {(setupStatus === "PENDING" || setupStatus === "REJECTED") && (
                      <button 
                        style={styles.passBtn} 
                        onClick={() => {
                          const target = role === "host" ? "guest" : "host"; // โยนให้อีกฝ่าย
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
                  {/* ฝั่งคนตรวจ */}
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
                      {/* ฝั่งคนรอ ก็ต้องเห็นปุ่มทวงสิทธิ์ (ถ้าต้องการ) หรือสามารถเพิ่มปุ่มขอสิทธิ์ตรงนี้ได้ */}
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
    top: 0,      // เพิ่ม top
    width: "100%",
    bottom: 0,   // เพิ่ม bottom เพื่อให้ยืดตามความสูงจริงของ container
    background: "rgba(0,0,0,0.4)",
    zIndex: 0,   // ให้มั่นใจว่าอยู่หลัง Content
  },
  
  content: {
    position: "relative",
    zIndex: 1, // ต้องมากกว่า Overlay
    width: "100%",
    maxWidth: "900px",
    paddingBottom: "100px", // เผื่อระยะด้านล่างให้สวยงาม
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
    background: "rgba(0,0,0,0.85)", // สีพื้นหลัง
    padding: "20px",
    borderRadius: "15px",
    marginTop: "20px", // เพิ่มระยะห่างจาก Card ด้านบน
    width: "100%", // ให้เต็มความกว้างของ content
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)", // เงาเหมือน Card
    boxSizing: "border-box", // สำคัญมาก
    
    // 🔥 แก้ไขหลัก: จัดวางปุ่มให้อยู่ตรงกลาง
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px", // ระยะห่างระหว่างหัวข้อกับกลุ่มปุ่ม
  },
  
  // และปรับ styles.row ภายใน decisionGroup ให้เป็นระเบียบ
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // จัดปุ่มให้อยู่ตรงกลางในแนวนอน
    gap: "15px",
    marginTop: "10px", // ระยะห่างจากหัวข้อ "Opponent submitted..."
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
    backgroundColor: "rgba(0,0,0,0.6)", // พื้นหลังมืดลง
    zIndex: 9,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};