import { forwardRef, useState } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    icon,
    error,
    success,
    type = 'text',
    fullWidth = false,
    style,
    wrapperStyle,
    className = '',
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const wrapperCls = [
    'input-wrapper',
    error ? 'input-wrapper--error' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        ...wrapperStyle,
      }}
      className={className}
    >
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#5D4E3C' }}>
          {label}
        </label>
      )}
      <div className={wrapperCls}>
        {icon && <span style={{ fontSize: '18px', marginRight: '12px', opacity: 0.7 }}>{icon}</span>}
        <input
          ref={ref}
          type={inputType}
          className="input-field"
          style={style}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              opacity: 0.6,
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
        {success && !error && (
          <span style={{ padding: '10px 14px', fontSize: '18px', color: '#7BC4A8' }}>✓</span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: '#D64545', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
