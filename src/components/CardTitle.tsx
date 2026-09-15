import type { ComponentType, ReactNode, SVGProps } from "react";

type Tone = "accent" | "violet" | "amber" | "red";

export function CardTitle({
  icon: Icon,
  tone = "accent",
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <h2 className="card-title">
      <span className={`icon-badge tone-${tone}`}>
        <Icon />
      </span>
      <span className="card-title-text">{children}</span>
    </h2>
  );
}
