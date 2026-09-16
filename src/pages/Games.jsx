import React from 'react';
import { Camera, Globe, MousePointerClick, Gamepad2, ChevronRight } from 'lucide-react';
import RCPathfinderGame from '../games/rc-pathfinder/RCPathfinderGame';

const Games = () => {
  return (
    <div style={{
      padding: '0 1.5rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      
      {/* Phone Connection Flowchart Banner - Directly under navbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        gap: '1.5rem',
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--glass-border)',
        borderRadius: '0 0 24px 24px',
        padding: '1.5rem 4rem',
        marginTop: '-5rem', /* Negate App.css gap and navbar margin */
        marginBottom: '2.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        color: 'var(--text-main)',
      }}>
        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--accent-1)', display: 'flex', flexDirection: 'column' }}>
          <span>Phone Controller</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>How to play</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '500' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <Camera size={28} color="var(--accent-1)" />
          </div>
          Scan QR on Screen
        </div>
        
        <ChevronRight size={24} color="var(--text-muted)" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '500' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <Globe size={28} color="#3b82f6" />
          </div>
          Open Browser Link
        </div>
        
        <ChevronRight size={24} color="var(--text-muted)" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '500' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <MousePointerClick size={28} color="#f59e0b" />
          </div>
          Click Connect
        </div>
        
        <ChevronRight size={24} color="var(--text-muted)" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-2)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <Gamepad2 size={28} color="currentColor" />
          </div>
          Steer Car!
        </div>
      </div>

      <h2 style={{ marginBottom: '0.5rem' }}>Interactive Experiments</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
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
