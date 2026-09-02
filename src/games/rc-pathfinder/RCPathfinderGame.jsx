// ─────────────────────────────────────────────────────────────
//  RCPathfinderGame.jsx – Complete playable RC Pathfinder game
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, WS_BASE_URL } from '../../apiConfig';
import { Engine } from './Engine.js';
import { Physics } from './Physics.js';
import { MapGenerator } from './MapGenerator.js';
import { PathFinder } from './PathFinder.js';
import { Renderer } from './Renderer.js';
import { Scoring } from './Scoring.js';
import { STATUS } from './GameState.js';
import { QRCodeSVG } from 'qrcode.react';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const makePairCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const statusDot = {
  [STATUS.READY]: '#3b82f6',
  [STATUS.PLAYING]: '#10b981',
  [STATUS.PAUSED]: '#f59e0b',
  [STATUS.COMPLETED]: '#a78bfa',
};

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

const HUD = ({ ui, user }) => (
  <div style={S.hud}>
    {/* Left: stats */}
    <div>
      <h2 style={S.title}>RC PATHFINDER</h2>
      <div style={S.simMode}>SIMULATION MODE</div>
      {[
        ['SPEED', `${ui.speedMs} m/s`],
        ['TIME', ui.timeStr],
        ['DISTANCE', `${ui.distStr} m`],
        ['COLLISION', ui.collisions],
        ['SCORE', ui.score, '#15803d'],
      ].map(([lbl, val, col]) => (
        <div style={S.hudRow} key={lbl}>
          <span style={S.hudLabel}>{lbl}</span>
          <span style={{ ...S.hudVal, ...(col ? { color: col } : {}) }}>{val}</span>
        </div>
      ))}
    </div>

    {/* Right: status */}
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: 4 }}>STATUS</div>
      <div style={{ color: statusDot[ui.status] ?? '#10b981', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.8rem' }}>
        ● {ui.status}
      </div>
    </div>
    
    {/* Right: user badge */}
    {user && (
      <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.4)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', letterSpacing: '0.05em' }}>PLAYER</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--accent-1)', fontWeight: 600 }}>{user.username}</div>
        </div>
        {user.profile_picture ? (
          <img src={user.profile_picture} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>?</div>
        )}
      </div>
    )}
  </div>
);

const PauseOverlay = ({ onResume }) => (
  <div style={S.overlay}>
    <div style={S.overlayBox}>
      <div style={S.overlayTitle}>MISSION PAUSED</div>
      <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: 24 }}>
        Game physics and timer are frozen.
      </p>
      <button style={S.btn} onClick={onResume}>▶  RESUME MISSION</button>
    </div>
  </div>
);

const CompletionOverlay = ({ data, onNewMap, onPlayAgain, user }) => {
  const rows = [
    ['TIME', data.time],
    ['DISTANCE', `${data.distance}m / OPTIMAL ${data.optimal}m`],
    ['COLLISIONS', data.collisions],
    ['CHECKPOINTS', `${data.checkpointsHit}/${data.totalCheckpoints}`],
  ];
  return (
    <div style={S.overlay}>
      <div style={{ ...S.overlayBox, minWidth: 340 }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="Avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.3)', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>U</div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.1em' }}>PILOT</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--accent-1)', fontWeight: 700 }}>{user.username}</div>
            </div>
          </div>
        )}
        <div style={{ color: '#059669', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>
          MISSION COMPLETE
        </div>
        <div style={{ color: '#10b981', fontSize: '0.72rem', letterSpacing: '0.1em', marginBottom: 22 }}>
          DESTINATION REACHED
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: 18 }}>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td style={{ textAlign: 'left', color: '#6b7280', padding: '3px 0', paddingRight: 28 }}>{k}</td>
                <td style={{ textAlign: 'right', color: '#374151', fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#15803d', textShadow: '0 0 12px rgba(21,128,61,0.2)' }}>
            {data.score}
          </span>
        </div>
        <div style={{ color: '#15803d', fontSize: '0.72rem', letterSpacing: '0.14em', marginBottom: 26 }}>{data.rank}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button style={S.btn} onClick={onNewMap}>NEW MAP</button>
          <button style={{ ...S.btn, borderColor: '#10b981', color: '#059669', background: 'rgba(16,185,129,0.12)' }} onClick={onPlayAgain}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};

const PhonePanel = ({ pairCode, phoneConnected, onClose }) => {
  const [showQr, setShowQr] = useState(false);
  // URL to control the car
  const controllerUrl = `${API_BASE_URL}/controller`;

  return (
    <div style={S.overlay}>
      <div style={S.overlayBox}>
        <div style={S.overlayTitle}>PHONE CONTROLLER</div>
        <div style={{ color: phoneConnected ? '#10b981' : '#6b7280', fontSize: '0.72rem', marginBottom: 14 }}>
          STATUS: ● {phoneConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
        
        {showQr ? (
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 18 }}>
            <QRCodeSVG value={controllerUrl} size={180} />
          </div>
        ) : (
          <>
            <div style={{ color: '#9ca3af', fontSize: '0.72rem', marginBottom: 6 }}>Pair Code</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.32em', color: '#06b6d4', textShadow: '0 0 18px #06b6d4', marginBottom: 18 }}>
              {pairCode}
            </div>
          </>
        )}
        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
          {!showQr && (
            <button style={S.btn} onClick={() => navigator.clipboard?.writeText(pairCode).catch(() => { })}>
              COPY CODE
            </button>
          )}
          <button style={S.btn} onClick={() => setShowQr(!showQr)}>
            {showQr ? 'SHOW CODE' : 'SHOW QR'}
          </button>
        </div>
        {!phoneConnected && (
          <div style={{ color: '#6b7280', fontSize: '0.72rem', marginBottom: 22 }}>Waiting for phone connection...</div>
        )}
        <button style={{ ...S.btn, color: '#6b7280', borderColor: '#374151' }} onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
};

const ReadyBanner = ({ onStart }) => (
  <div style={S.readyBanner}>
    <div style={S.readyBadge}>● READY</div>
    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: 18, textAlign: 'center', maxWidth: 260 }}>
      Navigate your RC car from SOURCE to DESTINATION
    </div>
    <button style={S.startBtn} onClick={onStart}>▶  START MISSION</button>
  </div>
);

const ControlsHint = () => (
  <div style={S.hint}>
    W/↑ Fwd · S/↓ Rev · A/← Left · D/→ Right · SPACE Stop · R Reset · N New Map · P Pause
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
const RCPathfinderGame = () => {
  const { user } = useContext(AuthContext);
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);

  // Live game state (used inside the game loop – never triggers re-render)
  const G = useRef(null);

  // Exposed action functions (set up inside useEffect)
  const A = useRef({});

  // Keys currently held down
  const keys = useRef({});

  // React UI state (drives HUD + overlays)
  const [ui, setUi] = useState({
    status: STATUS.READY,
    speedMs: '0.0',
    timeStr: '00:00.00',
    distStr: '0.0',
    collisions: 0,
    score: 1000,
    difficulty: 'MEDIUM',
    showOptimalPath: false,
    checkpointsHit: 0,
    totalCheckpoints: 0,
    showPhonePanel: false,
    phoneConnected: false,
    showPause: false,
    completionData: null,
  });

  const [pairCode] = useState(makePairCode);

  // ── One-time setup ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const minimapCanvas = minimapRef.current;
    if (!canvas) return;

    // Resize canvas to fill its container
    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
    };
    resize();

    // Core subsystems
    const renderer = new Renderer(canvas, minimapCanvas);
    const mapGen = new MapGenerator();

    // ── WebSocket setup ──────────────────────────────────
    let ws = null;
    let peerConnection = null;
    let dataChannel = null;

    let phoneTimeout = null;
    const phoneInput = { throttle: 0, steering: 0 };
    
    const parseInputData = (data) => {
      if (data === 'STOP') {
        phoneInput.throttle = 0;
        phoneInput.steering = 0;
      } else if (typeof data === 'string') {
        let throttle = 0;
        let steering = 0;
        
        // Parse F/B
        const m = data.match(/([FB])(\d+)/);
        if (m) {
          let val = parseInt(m[2], 10);
          if (val === 99) val = 100;
          throttle = (val / 100) * (m[1] === 'F' ? 1 : -1);
        }
        
        // Parse L/R
        const m2 = data.match(/([LR])(\d+)/);
        if (m2) {
          let val = parseInt(m2[2], 10);
          if (val === 99) val = 100;
          steering = (val / 100) * (m2[1] === 'R' ? 1 : -1);
        }
        
        phoneInput.throttle = Math.max(-1, Math.min(1, throttle));
        phoneInput.steering = Math.max(-1, Math.min(1, steering));
      }
    };

    const setupWebRTC = async () => {
      peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'webrtc', subtype: 'ice', candidate: event.candidate }));
        }
      };

      dataChannel = peerConnection.createDataChannel('gameControls');
      dataChannel.onopen = () => console.log('[Game] WebRTC DataChannel opened!');
      dataChannel.onclose = () => console.log('[Game] WebRTC DataChannel closed.');
      dataChannel.onmessage = (event) => {
        parseInputData(event.data);
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'webrtc', subtype: 'offer', sdp: offer }));
      }
    };

    const connectWs = () => {
      ws = new WebSocket(`${WS_BASE_URL}/api/game-ws`);
      
      ws.onopen = () => {
        console.log('[Game] Connected to local WebSocket server');
        ws.send('REGISTER_GAME');
      };
      
      ws.onmessage = async (event) => {
        try {
          const data = event.data;

          if (data.startsWith('{')) {
            const parsed = JSON.parse(data);
            if (parsed.type === 'webrtc' && peerConnection) {
              if (parsed.subtype === 'answer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(parsed.sdp));
              } else if (parsed.subtype === 'ice' && parsed.candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(parsed.candidate));
              }
            }
            return;
          }
          
          if (data === 'GAME_OK') {
            console.log('[Game] Registered with server');
            return;
          }
          if (data === 'PHONE_CONNECTED') {
            console.log('[Game] Phone connected');
            setUi(prev => ({ ...prev, phoneConnected: true }));
            setupWebRTC();
            return;
          }
          if (data === 'PHONE_DISCONNECTED') {
            console.log('[Game] Phone disconnected');
            setUi(prev => ({ ...prev, phoneConnected: false }));
            if (peerConnection) {
              peerConnection.close();
              peerConnection = null;
            }
            return;
          }

          if (data === 'ACTION_START_MISSION') {
            A.current.startGame?.();
            return;
          }
          if (data === 'ACTION_OPTIMAL_PATH') {
            A.current.toggleOptimalPath?.();
            return;
          }
          if (data === 'ACTION_RESET') {
            A.current.resetCar?.();
            return;
          }
          if (data === 'ACTION_FULLSCREEN') {
            handleFullscreen();
            return;
          }

          // Fallback parsing for WS messages (if WebRTC not connected)
          parseInputData(data);

        } catch (e) {
          console.error('[Game] Error parsing message:', e);
        }
      };
      
      ws.onclose = () => {
        setTimeout(connectWs, 3000); // auto-reconnect
      };
    };
    connectWs();

    // ── Initialise shared game-state object ──────────────
    G.current = {
      status: STATUS.READY,
      car: null,
      mapData: null,
      optimalPath: null,
      optimalDistPx: 0,
      playerRoute: [],
      timerStart: null,
      timerElapsed: 0,
      distanceTravelled: 0,
      collisions: 0,
      collisionFlashTimer: 0,
      isColliding: false,
      checkpointsCollected: [],
      showOptimalPath: false,
      score: 1000,
      difficulty: 'MEDIUM',
      routeAccum: 0,
    };

    // ── Helper: push current G values into React UI state ──
    const syncUi = (extra = {}) => {
      const g = G.current;
      if (!g) return;
      const chit = g.checkpointsCollected?.filter(Boolean).length ?? 0;
      setUi(prev => ({
        ...prev,
        status: g.status,
        speedMs: g.car?.speedMs ?? '0.0',
        timeStr: Scoring.formatTime(g.timerElapsed),
        distStr: (g.distanceTravelled / 40).toFixed(1),
        collisions: g.collisions,
        score: g.score,
        difficulty: g.difficulty,
        showOptimalPath: g.showOptimalPath,
        checkpointsHit: chit,
        totalCheckpoints: g.checkpointsCollected?.length ?? 0,
        ...extra,
      }));
    };

    // ── Generate / regenerate map ─────────────────────────
    const generateMap = (difficulty) => {
      const g = G.current;
      g.difficulty = difficulty;
      // Make map larger than canvas to allow scrolling
      const mapW = Math.max(canvas.width * 2, 3000);
      const mapH = Math.max(canvas.height * 2, 3000);
      const data = mapGen.generate(mapW, mapH, difficulty);
      g.mapData = data;
      g.checkpointsCollected = new Array(data.checkpoints.length).fill(false);
      g.showOptimalPath = false;

      // A* optimal path
      const pf = new PathFinder(data);
      const path = pf.findPath(
        data.source.c, data.source.r,
        data.destination.c, data.destination.r
      );
      g.optimalPath = path;
      g.optimalDistPx = path ? path.length * data.cellSize : 0;

      // Place car at source
      const src = mapGen.getCellCenter(data.source.r, data.source.c);
      if (!g.car) {
        g.car = new Physics(src.x, src.y);
      } else {
        g.car.reset(src.x, src.y);
      }

      // Reset all run statistics
      g.status = STATUS.READY;
      g.playerRoute = [{ x: src.x, y: src.y }];
      g.timerStart = null;
      g.timerElapsed = 0;
      g.distanceTravelled = 0;
      g.collisions = 0;
      g.collisionFlashTimer = 0;
      g.isColliding = false;
      g.score = 1000;
      g.routeAccum = 0;

      syncUi({ showPause: false, completionData: null });
    };

    // ── Game action functions (exposed via A.current) ─────
    const startGame = () => {
      const g = G.current;
      if (g.status !== STATUS.READY) return;
      g.status = STATUS.PLAYING;
      syncUi();
    };

    const pauseGame = () => {
      const g = G.current;
      if (g.status !== STATUS.PLAYING) return;
      // Freeze timer
      if (g.timerStart) {
        g.timerElapsed = (performance.now() - g.timerStart) / 1000;
        g.timerStart = null;
      }
      g.status = STATUS.PAUSED;
      syncUi({ showPause: true });
    };

    const resumeGame = () => {
      const g = G.current;
      if (g.status !== STATUS.PAUSED) return;
      // Resume timer from saved elapsed
      if (g.timerElapsed > 0) {
        g.timerStart = performance.now() - g.timerElapsed * 1000;
      }
      g.status = STATUS.PLAYING;
      syncUi({ showPause: false });
    };

    const resetCar = () => {
      const g = G.current;
      if (!g.mapData) return;
      const src = mapGen.getCellCenter(g.mapData.source.r, g.mapData.source.c);
      g.car.reset(src.x, src.y);
      g.status = STATUS.READY;
      g.timerStart = null;
      g.timerElapsed = 0;
      g.playerRoute = [{ x: src.x, y: src.y }];
      g.distanceTravelled = 0;
      g.collisions = 0;
      g.score = 1000;
      g.routeAccum = 0;
      g.checkpointsCollected = new Array(g.mapData.checkpoints.length).fill(false);
      syncUi({ showPause: false, completionData: null });
    };

    const emergencyStop = () => {
      const g = G.current;
      if (g.car) g.car.speed = 0;
      keys.current = {}; // clear all held keys
    };

    const toggleOptimalPath = () => {
      const g = G.current;
      g.showOptimalPath = !g.showOptimalPath;
      syncUi();
    };

    // Store actions for button handlers outside this effect
    A.current = {
      generateMap,
      startGame,
      pauseGame,
      resumeGame,
      resetCar,
      emergencyStop,
      toggleOptimalPath,
    };

    // ── Generate initial map ──────────────────────────────
    generateMap('MEDIUM');

    // ── Game loop ─────────────────────────────────────────
    const lastUiSync = { t: 0 };

    const update = (dt) => {
      const g = G.current;
      if (!g || g.status !== STATUS.PLAYING) return;
      const { car, mapData } = g;
      if (!car || !mapData) return;

      // Read keyboard input each frame
      const kbThrottle =
        (keys.current['w'] || keys.current['arrowup'] ? 1 : 0) -
        (keys.current['s'] || keys.current['arrowdown'] ? 1 : 0);
      const kbSteering =
        (keys.current['d'] || keys.current['arrowright'] ? 1 : 0) -
        (keys.current['a'] || keys.current['arrowleft'] ? 1 : 0);

      // Combine inputs (Keyboard overrides phone if pressed, else phone)
      const throttle = kbThrottle !== 0 ? kbThrottle : phoneInput.throttle;
      const steering = kbSteering !== 0 ? kbSteering : phoneInput.steering;

      const prevX = car.x, prevY = car.y;

      // Physics step
      car.update(
        dt,
        throttle,
        steering,
        (x, y, rot, hw, hh) => mapGen.isCollision(x, y, rot, hw, hh),
        () => {
          g.collisions++;
          g.collisionFlashTimer = 2.5;
          g.isColliding = true;
          // Brief flash – cleared after 200 ms
          setTimeout(() => { if (G.current) G.current.isColliding = false; }, 200);
        }
      );

      // Start timer on first significant movement
      if (!g.timerStart && Math.abs(car.speed) > 3) {
        g.timerStart = performance.now() - g.timerElapsed * 1000;
      }
      if (g.timerStart) {
        g.timerElapsed = (performance.now() - g.timerStart) / 1000;
      }

      // Accumulate distance
      const moved = Math.hypot(car.x - prevX, car.y - prevY);
      g.distanceTravelled += moved;

      // Player trail (one point every ~6 px of movement)
      g.routeAccum += moved;
      if (g.routeAccum >= 6) {
        g.routeAccum = 0;
        g.playerRoute.push({ x: car.x, y: car.y });
      }

      // Fade collision flash
      if (g.collisionFlashTimer > 0) {
        g.collisionFlashTimer = Math.max(0, g.collisionFlashTimer - dt);
      }

      // Checkpoint detection
      const cpIdx = mapGen.checkCheckpoints(car.x, car.y, g.checkpointsCollected);
      if (cpIdx >= 0) {
        g.checkpointsCollected = [...g.checkpointsCollected];
        g.checkpointsCollected[cpIdx] = true;
      }

      // ── Destination detection (win condition) ─────────
      if (mapGen.isAtDestination(car.x, car.y)) {
        car.speed = 0;
        if (g.timerStart) {
          g.timerElapsed = (performance.now() - g.timerStart) / 1000;
          g.timerStart = null;
        }
        g.status = STATUS.COMPLETED;

        const chit = g.checkpointsCollected.filter(Boolean).length;
        const result = Scoring.compute({
          time: g.timerElapsed,
          distanceTravelled: g.distanceTravelled,
          optimalDistance: g.optimalDistPx,
          collisions: g.collisions,
          checkpointsHit: chit,
          totalCheckpoints: g.checkpointsCollected.length,
        });
        g.score = result.score;

        setUi(prev => ({
          ...prev,
          status: STATUS.COMPLETED,
          timeStr: Scoring.formatTime(g.timerElapsed),
          distStr: (g.distanceTravelled / 40).toFixed(1),
          collisions: g.collisions,
          score: result.score,
          checkpointsHit: chit,
          totalCheckpoints: g.checkpointsCollected.length,
          completionData: {
            time: Scoring.formatTime(g.timerElapsed),
            distance: (g.distanceTravelled / 40).toFixed(2),
            optimal: (g.optimalDistPx / 40).toFixed(2),
            collisions: g.collisions,
            score: result.score,
            rank: result.rank,
            checkpointsHit: chit,
            totalCheckpoints: g.checkpointsCollected.length,
          },
        }));

        // Save game stats to backend if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          fetch(`${API_BASE_URL}/api/auth/game-stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              score: result.score,
              collisions: g.collisions,
              time: parseFloat(g.timerElapsed.toFixed(2)),
              rank: result.rank,
            }),
          }).catch(err => console.error('[Game] Failed to save stats:', err));
        }

        return;
      }

      // Throttled HUD sync (10 fps is plenty for text values)
      const now = Date.now();
      if (now - lastUiSync.t > 100) {
        lastUiSync.t = now;
        syncUi();
      }
    };

    const render = () => {
      const g = G.current;
      if (!g) return;
      renderer.render({
        mapData: g.mapData,
        car: g.car,
        playerRoute: g.playerRoute,
        showOptimalPath: g.showOptimalPath,
        optimalPath: g.optimalPath,
        isColliding: g.isColliding,
        collisions: g.collisions,
        collisionFlashTimer: g.collisionFlashTimer,
        checkpointsCollected: g.checkpointsCollected,
      });
    };

    const engine = new Engine(update, render);
    engine.start();

    // ── Keyboard handling ─────────────────────────────────
    const onKeyDown = (e) => {
      // Prevent page scroll for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      keys.current[k] = true;

      // One-shot actions
      if (e.key === ' ') A.current.emergencyStop?.();
      if (k === 'r') A.current.resetCar?.();
      if (k === 'n') A.current.generateMap?.(G.current?.difficulty ?? 'MEDIUM');
      if (k === 'p' || e.key === 'Escape') {
        const st = G.current?.status;
        if (st === STATUS.PLAYING) A.current.pauseGame?.();
        else if (st === STATUS.PAUSED) A.current.resumeGame?.();
      }
    };

    const onKeyUp = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      delete keys.current[k];
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ── Responsive resize (debounced) ─────────────────────
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (G.current?.difficulty) {
          A.current.generateMap?.(G.current.difficulty);
        }
      }, 300);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ───────────────────────────────────────────
    return () => {
      engine.stop();
      if (ws) {
        ws.onclose = null; // Prevent reconnect
        if (ws.readyState === 1) { // OPEN
          ws.close();
        } else if (ws.readyState === 0) { // CONNECTING
          ws.onopen = () => ws.close();
        }
      }
      if (phoneTimeout) clearTimeout(phoneTimeout);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, []); // run exactly once

  // ── Button handlers (read from A.current) ────────────────
  const handleNewMap = () => A.current.generateMap?.(G.current?.difficulty ?? 'MEDIUM');
  const handleStart = () => A.current.startGame?.();
  const handlePauseResume = () => {
    const st = G.current?.status;
    if (st === STATUS.PLAYING) A.current.pauseGame?.();
    else if (st === STATUS.PAUSED) A.current.resumeGame?.();
  };
  const handleReset = () => A.current.resetCar?.();
  const handleEmergency = () => A.current.emergencyStop?.();
  const handleTogglePath = () => A.current.toggleOptimalPath?.();
  const handleDifficulty = (d) => A.current.generateMap?.(d);
  const handleResume = () => A.current.resumeGame?.();
  const handlePlayAgain = () => A.current.resetCar?.();
  const rootRef = useRef(null);

  const handleFullscreen = () => {
    const el = rootRef.current;
    if (el && !document.fullscreenElement) {
      el.requestFullscreen().catch(err => console.log(err));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const isPlaying = ui.status === STATUS.PLAYING;
  const isPaused = ui.status === STATUS.PAUSED;
  const isReady = ui.status === STATUS.READY;
  const isCompleted = ui.status === STATUS.COMPLETED;

  // ── Render ───────────────────────────────────────────────
  return (
    <div ref={rootRef} style={S.root}>

      {/* ── Game canvas area ── */}
      <div style={S.canvasWrap}>

        <HUD ui={ui} user={user} />

        {/* Main game canvas */}
        <canvas ref={canvasRef} style={S.canvas} />

        {/* Minimap canvas (bottom-right) */}
        <canvas
          ref={minimapRef}
          width={180}
          height={120}
          style={S.minimap}
          aria-label="Minimap"
        />

        {/* ── Overlays ── */}
        {isPaused && <PauseOverlay onResume={handleResume} />}

        {isCompleted && ui.completionData && (
          <CompletionOverlay
            data={ui.completionData}
            onNewMap={handleNewMap}
            onPlayAgain={handlePlayAgain}
            user={user}
          />
        )}

        {ui.showPhonePanel && (
          <PhonePanel
            pairCode={pairCode}
            phoneConnected={ui.phoneConnected}
            onClose={() => setUi(p => ({ ...p, showPhonePanel: false }))}
          />
        )}

        {/* ── READY banner ── */}
        {isReady && !ui.completionData && (
          <ReadyBanner onStart={handleStart} />
        )}
      </div>

      {/* ── Bottom control panel ── */}
      <div style={S.controls}>

        {/* Row 1: game controls */}
        <div style={S.row}>
          <Btn onClick={handleNewMap}>NEW MAP</Btn>

          <Btn
            onClick={handleStart}
            disabled={isPlaying || isPaused || isCompleted}
            accent="#10b981"
          >
            START
          </Btn>

          <Btn
            onClick={handlePauseResume}
            disabled={isReady || isCompleted}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </Btn>

          <Btn onClick={handleReset}>RESET</Btn>

          <Btn
            onClick={handleTogglePath}
            active={ui.showOptimalPath}
            accent="#10b981"
          >
            {ui.showOptimalPath ? 'HIDE PATH' : 'SHOW OPTIMAL PATH'}
          </Btn>

          <Btn
            onClick={handleEmergency}
            accent="#ef4444"
            style={{ background: 'rgba(220,38,38,0.12)' }}
          >
            ⏹ EMERGENCY STOP
          </Btn>

          <Btn onClick={() => setUi(p => ({ ...p, showPhonePanel: true }))}>
            CONNECT PHONE
          </Btn>

          <Btn onClick={handleFullscreen}>
            FULLSCREEN
          </Btn>
        </div>

        {/* Row 2: difficulty */}
        <div style={S.row}>
          <span style={S.diffLabel}>DIFFICULTY</span>
          {[
            { d: 'EASY', color: '#10b981' },
            { d: 'MEDIUM', color: '#f59e0b' },
            { d: 'HARD', color: '#ef4444' },
          ].map(({ d, color }) => (
            <Btn
              key={d}
              onClick={() => handleDifficulty(d)}
              active={ui.difficulty === d}
              accent={color}
            >
              {d}
            </Btn>
          ))}
        </div>

        <ControlsHint />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Reusable button component
// ─────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, active, accent = '#06b6d4', style: extraStyle }) => {
  const [hovered, setHovered] = useState(false);
  const activeColor = active ? accent : undefined;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...S.btn,
        ...(active ? { borderColor: accent, color: accent, background: `${accent}18` } : {}),
        ...(hovered && !disabled ? { borderColor: accent, color: accent } : {}),
        ...(disabled ? { opacity: 0.38, cursor: 'not-allowed' } : {}),
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────
const S = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: '#f0fdf4',
    fontFamily: "'Inter', sans-serif",
    color: '#374151',
    borderRadius: 12,
    overflow: 'hidden',
  },
  canvasWrap: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
    background: '#f0fdf4',
  },
  minimap: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    borderRadius: 4,
    zIndex: 5,
    pointerEvents: 'none',
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'transparent',
    zIndex: 10,
    pointerEvents: 'none',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#059669',
    letterSpacing: '0.05em',
  },
  simMode: {
    fontSize: '0.7rem',
    color: '#6b7280',
    marginBottom: 8,
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  hudRow: {
    display: 'flex',
    gap: 10,
    fontSize: '0.75rem',
    marginBottom: 2,
  },
  hudLabel: {
    color: '#6b7280',
    minWidth: 82,
    fontWeight: 600,
  },
  hudVal: {
    color: '#374151',
    fontWeight: 700,
  },
  controls: {
    padding: '12px 20px',
    background: '#ffffff',
    borderTop: '1px solid #d1fae5',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    padding: '6px 14px',
    background: '#d1fae5',
    border: '1px solid #34d399',
    color: '#065f46',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'all 0.15s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
  },
  diffLabel: {
    fontSize: '0.75rem',
    color: '#4b5563',
    marginRight: 6,
    fontWeight: 600,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(240,253,244,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backdropFilter: 'blur(4px)',
  },
  overlayBox: {
    background: '#ffffff',
    border: '2px solid #a7f3d0',
    borderRadius: 12,
    padding: '32px 40px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(16,185,129,0.1)',
    fontFamily: "'Inter', sans-serif",
    minWidth: 300,
  },
  overlayTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#059669',
    letterSpacing: '0.05em',
    marginBottom: 16,
  },
  readyBanner: {
    position: 'absolute',
    bottom: 72,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 15,
    pointerEvents: 'auto',
  },
  readyBadge: {
    display: 'inline-block',
    background: '#dbeafe',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '4px 16px',
    borderRadius: 6,
    marginBottom: 12,
  },
  startBtn: {
    padding: '12px 36px',
    background: '#10b981',
    border: 'none',
    color: '#ffffff',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.05em',
    fontWeight: 700,
    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
    transition: 'all 0.2s ease',
  },
  hint: {
    fontSize: '0.7rem',
    color: '#6b7280',
    marginTop: 4,
  },
};

export default RCPathfinderGame;
