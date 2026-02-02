export default function Skeleton({
  width,
  height,
  circle = false,
  style,
  className = '',
  count = 1,
}) {
  const baseStyle = {
    width: width || '100%',
    height: height || '16px',
    ...style,
  };

  const cls = `skeleton ${circle ? 'skeleton--circle' : ''} ${className}`.trim();

  if (count > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={cls} style={baseStyle} />
        ))}
      </div>
    );
  }

  return <div className={cls} style={baseStyle} />;
}

export function SkeletonCard({ style }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '20px',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div className="skeleton" style={{ height: '200px', borderRadius: 0 }} />
      <div style={{ padding: '16px 20px' }}>
        <Skeleton height="18px" width="60%" style={{ marginBottom: '8px' }} />
        <Skeleton height="14px" width="40%" />
      </div>
    </div>
  );
}

export function LoadingScreen({ message = '...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 50%, #E8F4F2 100%)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(123,196,168,0.2)',
          borderTopColor: '#7BC4A8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: '14px', color: '#8B7E6A' }}>{message}</p>
    </div>
  );
}
