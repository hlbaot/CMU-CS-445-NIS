import React from 'react';

const STATUS_STYLE = {
  PAID:      { background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' },
  UNPAID:    { background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' },
  COMPLETED: { background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' },
  SYNCED:    { background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' },
  PENDING:   { background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' },
};

function Badge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  return (
    <span style={{
      ...style,
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 6,
      fontFamily: 'var(--mono)',
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
}

const TH = { 
  textAlign: 'left', 
  color: 'var(--muted)', 
  fontWeight: 600, 
  padding: '16px 20px', 
  borderBottom: '1px solid var(--border)', 
  fontFamily: 'var(--sans)', 
  fontSize: 11, 
  textTransform: 'uppercase', 
  letterSpacing: '1px' 
};

const TD = { 
  padding: '16px 20px', 
  borderBottom: '1px solid var(--border)', 
  color: 'var(--text)',
  fontSize: 13,
  transition: 'background 0.2s ease'
};

export default function OrderTable({ orders = [], page, pageSize, totalRows, onPageChange }) {
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Mã', 'Sản phẩm', 'SL', 'Khách hàng', 'Trạng thái', 'Thanh toán', 'Số tiền', 'Ngày tạo'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.order_id} style={{ 
                background: 'transparent',
                transition: 'background 0.2s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...TD, fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: 12 }}>#{o.order_id}</td>
                <td style={{ ...TD, fontWeight: 500 }}>{o.product_name || '—'}</td>
                <td style={{ ...TD, fontFamily: 'var(--mono)' }}>{o.quantity}</td>
                <td style={{ ...TD, color: 'var(--text)' }}>{o.customer_name || 'Khách vãng lai'}</td>
                <td style={TD}><Badge status={o.order_status} /></td>
                <td style={TD}><Badge status={o.payment_status} /></td>
                <td style={{ ...TD, fontFamily: 'var(--mono)', fontWeight: 600, color: o.amount > 0 ? 'var(--success)' : 'var(--muted)' }}>
                  {o.amount > 0 ? Number(o.amount).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
                </td>
                <td style={{ ...TD, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: 20, 
        padding: '0 20px'
      }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          Trang <span style={{ color: 'var(--text)', fontWeight: 600 }}>{page}</span> / {totalPages} · {totalRows.toLocaleString('vi-VN')} dòng
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            disabled={page <= 1} 
            onClick={() => onPageChange(page - 1)}
            style={{ 
              background: 'var(--surface2)', 
              border: '1px solid var(--border)', 
              color: 'var(--text)', 
              padding: '6px 14px', 
              borderRadius: 8, 
              cursor: page <= 1 ? 'not-allowed' : 'pointer', 
              fontSize: 12, 
              fontWeight: 500,
              opacity: page <= 1 ? 0.3 : 1 
            }}>
            Quay lại
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => onPageChange(page + 1)}
            style={{ 
              background: 'var(--primary)', 
              border: 'none', 
              color: '#fff', 
              padding: '6px 14px', 
              borderRadius: 8, 
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', 
              fontSize: 12, 
              fontWeight: 600,
              opacity: page >= totalPages ? 0.3 : 1,
              boxShadow: page >= totalPages ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
            Tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
}
