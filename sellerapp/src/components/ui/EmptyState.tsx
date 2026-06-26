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
    <div className="text-center py-[56px] px-[24px] text-[var(--text-secondary)]">
      <div className="w-[56px] h-[56px] mx-auto mb-[14px] rounded-[var(--radius-lg)] bg-[var(--color-neutral-100)] grid place-items-center text-[var(--text-tertiary)]">
        <Icon name={icon} size={24} />
      </div>
      <h4 className="m-0 mb-[4px] text-[var(--text-primary)] text-[16px] font-semibold">{title}</h4>
      <div>{message}</div>
      {action && <div className="mt-[16px]">{action}</div>}
    </div>
  );
}