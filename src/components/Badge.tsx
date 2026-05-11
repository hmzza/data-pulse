import { statusClass } from "../utils/status";

type BadgeProps = {
  children: string;
  className?: string;
};

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(children)} ${className}`}>
      {children}
    </span>
  );
}
