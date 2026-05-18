import { Icon } from "./Icon";
import type { IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "search", title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="glyph"><Icon name={icon} size={24} /></div>
      <h4>{title}</h4>
      <div>{message}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}