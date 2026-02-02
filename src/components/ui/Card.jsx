export default function Card({
  children,
  padding,
  hoverable = false,
  selected = false,
  flat = false,
  className = '',
  style,
  onClick,
  ...props
}) {
  const cls = [
    'card',
    (onClick || hoverable) ? 'card--hoverable' : '',
    selected ? 'card--selected' : '',
    flat ? 'card--flat' : '',
    className,
  ].filter(Boolean).join(' ');

  const customStyle = {
    ...(padding != null ? { padding } : {}),
    ...style,
  };

  return (
    <div
      className={cls}
      style={customStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
