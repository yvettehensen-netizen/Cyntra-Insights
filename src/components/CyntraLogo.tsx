// src/components/CyntraLogo.tsx
import { ComponentPropsWithoutRef } from "react";

interface CyntraLogoProps extends ComponentPropsWithoutRef<"svg"> {
  className?: string;
}

export default function CyntraLogo({
  className = "h-10",
  ...props
}: CyntraLogoProps) {
  return (
    <svg
      viewBox="0 0 360 72"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-auto ${className}`}
      role="img"
      aria-label="Cyntra Insights"
      {...props}
    >
      {/* ICON */}
      <g transform="translate(36, 36)">
        <circle
          cx="0"
          cy="0"
          r="30"
          stroke="#D4AF37"
          strokeWidth="4"
          opacity="0.55"
        />

        <path
          d="M -18 0 A 18 18 0 1 1 18 0"
          stroke="#D4AF37"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="22" cy="0" r="6" fill="#D4AF37" />
      </g>

      {/* TEXT */}
      <text
        x="92"
        y="46"
        fontSize="36"
        fontWeight="800"
        fill="white"
        letterSpacing="-0.04em"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        Cyntra
      </text>

      <text
        x="212"
        y="46"
        fontSize="36"
        fontWeight="800"
        fill="#D4AF37"
        letterSpacing="-0.04em"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        Insights
      </text>
    </svg>
  );
}
