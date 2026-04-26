import React from 'react';

const COLORS = [
  'linear-gradient(90deg, #3b82f6, #60a5fa)',
  'linear-gradient(90deg, #10b981, #34d399)',
  'linear-gradient(90deg, #f59e0b, #fbbf24)',
  'linear-gradient(90deg, #a78bfa, #c4b5fd)',
  'linear-gradient(90deg, #f472b6, #fb923c)',
  'linear-gradient(90deg, #22d3ee, #67e8f9)',
];

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' triệu';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return n.toLocaleString('vi-VN');
}

export default function CustomerBars({ customers = [] }) {
  if (!customers.length) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
      Chưa có dữ liệu giao dịch
    </div>
  );

  const max = Math.max(...customers.map(c => c.total_revenue));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {customers.map((c, i) => (
        <div key={c.customer_name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              {c.customer_name || 'Khách ẩn danh'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              {fmt(c.total_revenue)} ₫
            </div>
          </div>
          <div style={{ 
            width: '100%', 
            height: 8, 
            background: 'var(--surface2)', 
            borderRadius: 4, 
            overflow: 'hidden',
            border: '1px solid var(--border)' 
          }}>
            <div style={{
              height: '100%',
              borderRadius: 4,
              background: COLORS[i % COLORS.length],
              width: `${Math.round(c.total_revenue / max * 100)}%`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
