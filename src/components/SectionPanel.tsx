import type { ReactNode } from "react";

type SectionPanelProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionPanel({ title, eyebrow, action, children, className = "" }: SectionPanelProps) {
  return (
    <section className={`glass-panel min-w-0 rounded-2xl p-5 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300/80">{eyebrow}</p> : null}
          <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
