import { Camera, ChevronRight, Gamepad2, Globe2, MousePointerClick } from 'lucide-react';
import RCPathfinderGame from '../games/rc-pathfinder/RCPathfinderGame';
import './Games.css';

const controllerSteps = [
  { icon: Camera, label: 'Scan the QR code' },
  { icon: Globe2, label: 'Open the controller link' },
  { icon: MousePointerClick, label: 'Connect your device' },
  { icon: Gamepad2, label: 'Steer the car' }
];

function Games() {
  return (
    <main className="games-route">
      <section className="app-route-heading">
        <div className="app-route-heading-inner">
          <p className="app-route-kicker">INTERACTIVE EXPERIMENTS · 01</p>
          <h1>RC Pathfinder<span>.</span></h1>
          <p>A browser-based driving challenge. Find a route through the generated map, avoid collisions, and try the phone controller.</p>
        </div>
      </section>

      <section className="games-content">
        <div className="controller-guide">
          <div className="controller-guide-heading">
            <span className="controller-guide-icon"><Gamepad2 size={20} /></span>
            <div><h2>Bring your phone into the game</h2><p>Pair a second device as a remote steering controller.</p></div>
          </div>
          <div className="controller-steps">
            {controllerSteps.map(({ icon: Icon, label }, index) => (
              <div className="controller-step" key={label}>
                <span className="controller-step-number">0{index + 1}</span>
                <span className="controller-step-icon"><Icon size={17} /></span>
                <span>{label}</span>
                {index < controllerSteps.length - 1 && <ChevronRight className="controller-step-arrow" size={16} />}
              </div>
            ))}
          </div>
          <p className="controller-note">The phone controller requires the game server and both devices to be reachable on the same network.</p>
        </div>

        <div className="game-shell">
          <div className="game-shell-heading">
            <div><span className="game-live-dot" /><span>CANVAS SIMULATION</span></div>
            <span>Use keyboard controls or connect a phone</span>
          </div>
          <div className="game-canvas-frame">
            <RCPathfinderGame />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Games;
