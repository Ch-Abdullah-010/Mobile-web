"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  className,
}: {
  tabs: { label: string; count?: number; content: React.ReactNode }[];
  className?: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className={className}>
      <div role="tablist" aria-label="Product information" className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            role="tab"
            type="button"
            id={`tab-${index}`}
            aria-selected={active === index}
            aria-controls={`panel-${index}`}
            onClick={() => setActive(index)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              active === index
                ? "border-brand text-brand-strong"
                : "border-transparent text-content-muted hover:text-content"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="ml-1.5 rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-content-muted">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={active !== index}
          className="pt-6"
        >
          {active === index ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
