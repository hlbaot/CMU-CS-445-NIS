import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

const STATUS_COLORS = {
  PAID: '#3b82f6',
  PENDING: '#f59e0b',
  UNPAID: '#ef4444',
  FAILED: '#ef4444',
  REFUNDED: '#8b5cf6',
  COMPLETED: '#10b981',
  SHIPPED: '#6366f1',
};

export default function StatusChart({ paid, pending, statusCounts = {} }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const hasPaymentProps = paid != null || pending != null;
  const chartData = hasPaymentProps
    ? {
        PAID: Number(paid ?? 0),
        PENDING: Number(pending ?? 0),
      }
    : statusCounts;

  const segments = Object.entries(chartData)
    .filter(([, value]) => Number(value) > 0)
    .map(([label, value]) => ({
      label,
      value: Number(value),
      color: STATUS_COLORS[label] ?? '#94a3b8',
    }));
    
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const segmentsKey = JSON.stringify(segments);

  useEffect(() => {
    if (!canvasRef.current || segments.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: segments.map((s) => s.label),
        datasets: [{
          data: segments.map((s) => s.value),
          backgroundColor: segments.map((s) => s.color),
          borderColor: '#151820',
          borderWidth: 3,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ` ${c.label}: ${c.raw.toLocaleString('vi-VN')} đơn hàng`,
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [segmentsKey]);

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', height: 180 }}>
        {segments.length > 0 ? (
          <canvas ref={canvasRef} role="img" aria-label="Status distribution chart" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Hiện chưa có dữ liệu
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)' }}>
        {segments.map((segment) => (
          <span key={segment.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: segment.color, display: 'inline-block' }} />
            {segment.label} {total ? Math.round(segment.value / total * 100) : 0}% ({segment.value.toLocaleString()})
          </span>
        ))}
      </div>
    </div>
  );
}
