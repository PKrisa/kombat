import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/home-background.png";

function Config() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/config")
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("โหลด config ไม่ได้");
      });
  }, []);

  // handle input change
  const handleChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: Number(e.target.value)
    });
  };

  // save config
  const saveConfig = () => {
    fetch("http://localhost:8080/api/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(config)
    })
      .then(() => {
        alert("recording success");
        navigate("/");
      })
      .catch(() => alert("recording failed"));
  };

  if (loading) return <h2 style={{color:"white"}}>Loading...</h2>;

  return (
    <div style={styles.container}>
    <div style={styles.form}>
      <h1 style={styles.title}>Configure Settings</h1>
  
      <div style={styles.row}>
        <label>Spawn Cost</label>
        <input name="spawn_cost" value={config.spawn_cost || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Hex Purchase Cost</label>
        <input name="hex_purchase_cost" value={config.hex_purchase_cost || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Initial Budget</label>
        <input name="init_budget" value={config.init_budget || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Initial HP</label>
        <input name="init_hp" value={config.init_hp || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Turn Budget</label>
        <input name="turn_budget" value={config.turn_budget || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Max Budget</label>
        <input name="max_budget" value={config.max_budget || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Interest %</label>
        <input name="interest_pct" value={config.interest_pct || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Max Turns</label>
        <input name="max_turns" value={config.max_turns || ""} onChange={handleChange}/>
      </div>

      <div style={styles.row}>
        <label>Max Spawns</label>
        <input name="max_spawns" value={config.max_spawns || ""} onChange={handleChange}/>
      </div>

      <div style={styles.buttons}>
        <button style={styles.saveBtn} onClick={saveConfig}>
          Save
        </button>

        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ⬅ Back
        </button>
      </div>

    </div>
    
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
    backgroundRepeat: "no-repeat",

    display: "flex",
    justifyContent: "center", 
    alignItems: "center",  
  },

  title: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#3b3b3b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 300px)",
    gap: "20px"
  },

  card: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column"
  },

  label: {
    color: "#e2e8f0",
    fontSize: "15px",
    width: "180px",
  },

  input: {
    width: "180px",
    padding: "8px 10px",

    borderRadius: "8px",
    border: "1px solid #ccc",

    fontSize: "14px",
  },

  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },

  saveBtn: {
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

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "420px",

    background: "#d6cec6",
    padding: "30px",
    borderRadius: "16px",

    backdropFilter: "blur(10px)",

    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

};

export default Config;