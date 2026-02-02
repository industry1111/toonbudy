export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  style,
}) {
  return (
    <div className="empty-state" style={style}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__description">{description}</p>}
      {action}
      {children}
    </div>
  );
}
