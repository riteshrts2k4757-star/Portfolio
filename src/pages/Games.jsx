import React from 'react';
import RCPathfinderGame from '../games/rc-pathfinder/RCPathfinderGame';

const Games = () => {
  return (
    <div style={{
      padding: '1.5rem 1.5rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Interactive Experiments</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', textAlign: 'center' }}>
        Try out my custom interactive experiences built with React and HTML5 Canvas.
      </p>

      {/* Full-width game container with a tall fixed height */}
      <div style={{
        width: '100%',
        height: '82vh',
        minHeight: 520,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(6,182,212,0.18), 0 20px 60px rgba(0,0,0,0.45)',
      }}>
        <RCPathfinderGame />
      </div>
    </div>
  );
};

export default Games;
