import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </svg>
  );
}

export function IconCalculator(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="2.5" width="15" height="19" rx="2.2" />
      <path d="M7.5 6.5h9" />
      <path d="M7.5 11h2.2M11.9 11h2.2M16.3 11h.01M7.5 15h2.2M11.9 15h2.2M16.3 15h.01M7.5 19h2.2M11.9 19h2.2M16.3 19h.01" />
    </svg>
  );
}

export function IconBars(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="14" width="2.6" height="6" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="11.7" y="10" width="2.6" height="10" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="16.4" y="12.5" width="2.6" height="7.5" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M7.5 16l3.2-4.4 3 2.6L18.5 8" />
    </svg>
  );
}

export function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconCoffee(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" />
      <path d="M16 10.5h1.6a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 3.2c-.6.7-.6 1.3 0 2M11.3 3.2c-.6.7-.6 1.3 0 2" />
    </svg>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.6M16 3v3.6" />
      <path d="M7.5 13.3h2M11 13.3h2M14.5 13.3h2M7.5 16.7h2M11 16.7h2" />
    </svg>
  );
}

export function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.4 5.4 1.9 6.1a.7.7 0 0 1-.6 1.1H4.7a.7.7 0 0 1-.6-1.1C4.6 15.9 6 14.5 6 10.5Z" />
      <path d="M9.7 19.8a2.4 2.4 0 0 0 4.6 0" />
    </svg>
  );
}

export function IconArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} width={14} height={14}>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </svg>
  );
}

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function IconLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="7" fill="var(--accent)" />
      <path d="M7 15.5 11 8l2.4 5L17 8" stroke="var(--accent-ink)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
