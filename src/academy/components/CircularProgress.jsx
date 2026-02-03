import React from "react";

export function CircularProgress({ progress }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className="transform -rotate-90"
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="#2A2A2A"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="url(#grad)"
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D6B48E" />
          <stop offset="100%" stopColor="#caa87f" />
        </linearGradient>
      </defs>
      <text
        x="50"
        y="55"
        textAnchor="middle"
        className="fill-[#D6B48E] font-semibold text-lg"
      >
        {progress}%
      </text>
    </svg>
  );
}
