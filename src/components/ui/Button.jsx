import { forwardRef } from 'react';

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    className = '',
    style,
    ...props
  },
  ref
) {
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={cls}
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
      {!loading && children}
      {loading && children}
      {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
});

export default Button;
