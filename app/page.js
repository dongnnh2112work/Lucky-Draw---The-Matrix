"use client";

import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [mode, setMode] = useState("name");
  const [participantsText, setParticipantsText] = useState("Người Chơi 1\nNgười Chơi 2\nNgười Chơi 3");
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(100);
  const [list, setList] = useState([]);
  const [state, setState] = useState("standby");
  const [showSetup, setShowSetup] = useState(true);
  const [resultHtml, setResultHtml] = useState("");
  const [resultClass, setResultClass] = useState("");
  const [systemStatus, setSystemStatus] = useState("SYS.ERROR // BREACH DETECTED");
  const [systemStatusVisible, setSystemStatusVisible] = useState(false);
  const [systemStatusLocked, setSystemStatusLocked] = useState(false);
  const [drawButtonLabel, setDrawButtonLabel] = useState("> INITIATE_HACK");
  const [customTextShadow, setCustomTextShadow] = useState("");

  const canvasRef = useRef(null);
  const matrixSpeedRef = useRef(1);
  const drawIntervalRef = useRef(null);
  const drawTimeoutRef = useRef(null);
  const revealTimeoutRef = useRef(null);
  const listRef = useRef([]);
  const stateRef = useRef("standby");

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const katakana =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const alphabet = katakana + latin + nums;
    const fontSize = 16;
    let columns = 0;
    let drops = [];
    let frameId;

    const resizeMatrix = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = canvas.width / fontSize;
      drops = [];
      for (let x = 0; x < columns; x += 1) {
        drops[x] = Math.random() * canvas.height;
      }
    };

    const drawMatrix = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 * matrixSpeedRef.current})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let charColor = "#0F0";
      if (stateRef.current === "drawing") {
        charColor = Math.random() > 0.9 ? "#f00" : "#0F0";
      } else if (stateRef.current === "reveal") {
        charColor = "#055";
      }
      ctx.fillStyle = charColor;
      ctx.font = `${fontSize}px "Share Tech Mono"`;

      for (let i = 0; i < drops.length; i += 1) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += matrixSpeedRef.current;
      }
      frameId = requestAnimationFrame(drawMatrix);
    };

    window.addEventListener("resize", resizeMatrix);
    resizeMatrix();
    drawMatrix();

    return () => {
      window.removeEventListener("resize", resizeMatrix);
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(drawIntervalRef.current);
      clearTimeout(drawTimeoutRef.current);
      clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const generateGlitchString = (length) => {
    const characters = "!<>-_\\/[]{}-=+*^?#_0123456789";
    let result = "";
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const saveSetup = () => {
    let nextList = [];

    if (mode === "name") {
      nextList = participantsText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    } else {
      const min = Number.parseInt(minNum, 10);
      const max = Number.parseInt(maxNum, 10);
      if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
        window.alert("Loi Logic: Min > Max");
        return;
      }
      for (let i = min; i <= max; i += 1) {
        nextList.push(i.toString().padStart(max.toString().length, "0"));
      }
    }

    if (nextList.length === 0) {
      window.alert("> ERROR: NO_DATA_FOUND");
      return;
    }

    setList(nextList);
    setShowSetup(false);
    setResultHtml("");
    setResultClass("");
    setSystemStatusVisible(false);
    setSystemStatusLocked(false);
    setDrawButtonLabel("> INITIATE_HACK");
    setCustomTextShadow("");
    setState("standby");
    matrixSpeedRef.current = 1;
  };

  const reboot = () => {
    clearInterval(drawIntervalRef.current);
    clearTimeout(drawTimeoutRef.current);
    clearTimeout(revealTimeoutRef.current);

    setShowSetup(true);
    setResultHtml("");
    setResultClass("");
    setSystemStatusVisible(false);
    setSystemStatusLocked(false);
    setCustomTextShadow("");
    setState("standby");
    matrixSpeedRef.current = 1;
  };

  const stopDraw = () => {
    clearInterval(drawIntervalRef.current);
    setState("reveal");
    matrixSpeedRef.current = 0.5;

    const currentList = listRef.current;
    const winner = currentList[Math.floor(Math.random() * currentList.length)];
    setCustomTextShadow("");
    setResultHtml(`<span class="bracket">[</span>${winner}<span class="bracket">]</span>`);
    setResultClass("reveal");
    setSystemStatus("TARGET LOCKED SUCCESSFULLY");
    setSystemStatusLocked(true);
    setSystemStatusVisible(true);

    revealTimeoutRef.current = setTimeout(() => {
      setDrawButtonLabel("> NEXT_TARGET");
      matrixSpeedRef.current = 1;
      setState("standby");
      setSystemStatus("SYS.ERROR // BREACH DETECTED");
      setSystemStatusLocked(false);
      setSystemStatusVisible(false);
    }, 5000);
  };

  const startDraw = () => {
    if (stateRef.current === "drawing" || listRef.current.length === 0) return;

    setState("drawing");
    matrixSpeedRef.current = 3;
    setResultClass("drawing");
    setSystemStatusVisible(true);
    setSystemStatusLocked(false);

    drawIntervalRef.current = setInterval(() => {
      const currentList = listRef.current;
      const randomName = currentList[Math.floor(Math.random() * currentList.length)];

      if (Math.random() > 0.7) {
        setResultHtml(generateGlitchString(randomName.length));
      } else {
        const glitchX1 = (Math.random() - 0.5) * 15;
        const glitchX2 = (Math.random() - 0.5) * 15;
        setCustomTextShadow(
          `${glitchX1}px 0px 0px rgba(255,0,0,0.8), ${glitchX2}px 0px 0px rgba(0,255,255,0.8)`,
        );
        setResultHtml(randomName);
      }

      setSystemStatus(Math.random() > 0.5 ? "SYS.ERROR // BREACH DETECTED" : "DECRYPTING DATA...");
    }, 40);

    drawTimeoutRef.current = setTimeout(stopDraw, 4000);
  };

  return (
    <>
      {!showSetup && (
        <button id="back-btn" onClick={reboot}>
          {"> SYSTEM.REBOOT()"}
        </button>
      )}

      {showSetup && (
        <div id="setup-panel">
          <h2>{"> DECRYPT_SYSTEM_INIT"}</h2>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="mode"
                value="name"
                checked={mode === "name"}
                onChange={() => setMode("name")}
              />{" "}
              [DATA_STRING]
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="number"
                checked={mode === "number"}
                onChange={() => setMode("number")}
              />{" "}
              [DATA_INT]
            </label>
          </div>

          <div id="name-input" className="input-group" style={{ display: mode === "name" ? "block" : "none" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>{"> Nhập dữ liệu mục tiêu:"}</label>
            <textarea value={participantsText} onChange={(e) => setParticipantsText(e.target.value)} />
          </div>

          <div id="number-input" className="input-group number-inputs" style={{ display: mode === "number" ? "flex" : "none" }}>
            <div>
              <label>{"> Từ:"}</label>
              <input type="number" value={minNum} onChange={(e) => setMinNum(e.target.value)} />
            </div>
            <div>
              <label>{"> Đến:"}</label>
              <input type="number" value={maxNum} onChange={(e) => setMaxNum(e.target.value)} />
            </div>
          </div>

          <button onClick={saveSetup}>{"> EXECUTE_PROGRAM"}</button>
        </div>
      )}

      {!showSetup && (
        <button id="draw-btn" onClick={startDraw}>
          {drawButtonLabel}
        </button>
      )}

      <div id="result-wrapper">
        <div
          id="system-status"
          style={{ opacity: systemStatusVisible ? 1 : 0 }}
          className={systemStatusLocked ? "locked" : ""}
        >
          {systemStatus}
        </div>
        <div
          id="result-text"
          className={resultClass}
          style={customTextShadow ? { textShadow: customTextShadow } : undefined}
          dangerouslySetInnerHTML={{ __html: resultHtml }}
        />
      </div>

      <canvas id="canvas-container" ref={canvasRef} />

      <style jsx global>{`
        #setup-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 15, 0, 0.9);
          border: 2px solid #0f0;
          padding: 30px;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.2), inset 0 0 15px rgba(0, 255, 0, 0.1);
          z-index: 10;
          width: 450px;
          transition: opacity 0.3s ease;
        }
        #setup-panel::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 5px #0f0;
        }
        .input-group {
          margin-bottom: 15px;
          position: relative;
          z-index: 5;
        }
        .radio-group {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          position: relative;
          z-index: 5;
        }
        label {
          cursor: pointer;
          font-size: 14px;
        }
        textarea,
        input[type="number"] {
          width: 100%;
          background: #000;
          border: 1px solid #0f0;
          color: #0f0;
          padding: 10px;
          font-family: "Share Tech Mono", monospace;
          outline: none;
        }
        textarea:focus,
        input[type="number"]:focus {
          box-shadow: 0 0 10px #0f0;
        }
        textarea {
          height: 120px;
          resize: none;
        }
        .number-inputs {
          justify-content: space-between;
          gap: 10px;
        }
        button {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 2px solid #0f0;
          color: #0f0;
          font-weight: bold;
          font-size: 18px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
          font-family: "Share Tech Mono", monospace;
          position: relative;
          z-index: 5;
        }
        button:hover {
          background: #0f0;
          color: #000;
          box-shadow: 0 0 15px #0f0;
        }
        #back-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: auto;
          z-index: 10;
          font-size: 14px;
          padding: 8px 15px;
          border-color: #555;
          color: #888;
        }
        #back-btn:hover {
          border-color: #0f0;
          color: #0f0;
          background: transparent;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        #canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
          opacity: 0.6;
        }
        #draw-btn {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          z-index: 5;
          background: #000;
          border: 2px solid #f00;
          color: #f00;
          box-shadow: 0 0 10px #f00;
        }
        #draw-btn:hover {
          background: #f00;
          color: #fff;
          box-shadow: 0 0 25px #f00;
        }
        #result-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 4;
          text-align: center;
          width: 100%;
          pointer-events: none;
        }
        #result-text {
          font-size: 5rem;
          color: transparent;
          white-space: nowrap;
          transition: all 0.1s;
        }
        .drawing {
          color: #fff !important;
          text-shadow: 3px 0px 0px rgba(255, 0, 0, 0.8), -3px 0px 0px rgba(0, 255, 255, 0.8) !important;
          filter: blur(1px);
          opacity: 0.8;
        }
        .reveal {
          color: #0f0 !important;
          text-shadow: 0 0 10px #0f0, 0 0 20px #0f0, 0 0 40px #0f0 !important;
          font-size: 6rem !important;
          animation: lockTarget 0.5s ease-out forwards, blink 2s infinite alternate;
        }
        #system-status {
          font-size: 1.5rem;
          color: #f00;
          margin-bottom: 20px;
          letter-spacing: 5px;
          text-shadow: 0 0 10px #f00;
          opacity: 0;
        }
        #system-status.locked {
          color: #0f0;
          text-shadow: 0 0 10px #0f0;
        }
        @keyframes lockTarget {
          0% {
            transform: scale(1.5);
            opacity: 0;
          }
          50% {
            transform: scale(0.9);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes blink {
          0% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          96% {
            opacity: 0.2;
          }
          97% {
            opacity: 1;
          }
          98% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        .bracket {
          color: #f00;
          text-shadow: 0 0 15px #f00;
          display: inline-block;
          margin: 0 20px;
        }
      `}</style>
    </>
  );
}
