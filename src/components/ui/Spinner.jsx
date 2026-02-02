export default function Spinner({ size = 32, color = '#7BC4A8' }) {
  const style = {
    width: size,
    height: size,
    border: `3px solid ${color}20`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return <div style={style} />;
}

export function LoadingScreen({ message = '로딩 중...' }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 50%, #E8F4F2 100%)',
  };

  const textStyle = {
    fontSize: '14px',
    color: '#8B7E6A',
  };

  return (
    <div style={containerStyle}>
      <Spinner size={48} />
      <p style={textStyle}>{message}</p>
    </div>
  );
}
