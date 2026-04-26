import React from 'react';

const icons = {
  blue: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  green: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  amber: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 18v4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M18 12h4"/><path d="m19.07 4.93-2.83 2.83"/><circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  purple: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
};

export default function KPICard({ label, value, sub, accent }) {
  const colorMap = {
    blue:   '#3b82f6',
    green:  '#10b981',
    amber:  '#f59e0b',
    purple: '#a78bfa',
  };

  const accentColor = colorMap[accent] || colorMap.blue;

  return (
    <div className={`glass-card glow-${accent} animate-fade-in`} style={{
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{ 
          fontSize: 11, 
          color: 'var(--muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          fontWeight: 600,
          fontFamily: 'var(--mono)' 
        }}>
          {label}
        </div>
        <div style={{ color: accentColor, opacity: 0.8 }}>
          {icons[accent] || icons.blue}
        </div>
      </div>
      
      <div style={{ 
        fontSize: 28, 
        fontWeight: 700, 
        letterSpacing: '-1px', 
        lineHeight: 1.1,
        color: 'var(--text)',
      }}>
        {value}
      </div>
      
      {sub && (
        <div style={{ 
          fontSize: 12, 
          color: 'var(--muted)', 
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor }}></span>
          {sub}
        </div>
      )}
    </div>
  );
}
