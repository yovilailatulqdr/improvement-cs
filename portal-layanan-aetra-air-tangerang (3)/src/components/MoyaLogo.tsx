import React from 'react';

interface MoyaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const MoyaLogo: React.FC<MoyaLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const dimensions = {
    sm: { w: 84, h: 26 },
    md: { w: 110, h: 34 },
    lg: { w: 150, h: 46 },
  }[size];

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <svg
        width={dimensions.w}
        height={dimensions.h}
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Letter M */}
        <path
          d="M10 52V8H22L36 34L50 8H62V52H50V22L38 45H34L22 22V52H10Z"
          fill="#1F5E8E"
        />

        {/* Letter O (Stylized Water Sphere from Moya Indonesia) */}
        {/* Top Dome Arc */}
        <path
          d="M98 8C83 8 71 18 69 31C76 27 88 27 98 31C108 27 120 27 127 31C125 18 113 8 98 8Z"
          fill="#1F5E8E"
        />
        {/* Middle Cyan Wave 1 */}
        <path
          d="M70 33C78 28 89 28 98 33C107 38 118 38 126 33C126 35 125 38 124 40C116 44 105 44 98 39C89 34 78 34 72 38C71 36 70 34 70 33Z"
          fill="#3B8EBD"
        />
        {/* Bottom Dome Arc */}
        <path
          d="M98 52C113 52 125 42 127 39C120 43 108 43 98 39C88 43 76 43 69 39C71 52 83 52 98 52Z"
          fill="#1F5E8E"
        />

        {/* Letter Y */}
        <path
          d="M132 8H146L157 28L168 8H182L164 36V52H150V36L132 8Z"
          fill="#1F5E8E"
        />

        {/* Letter A */}
        <path
          d="M198 8H210L230 52H216L211 40H197L192 52H178L198 8ZM204 22L199 32H209L204 22Z"
          fill="#1F5E8E"
        />
      </svg>
      {showSubtitle && (
        <span className="text-[9px] font-bold text-[#1F5E8E]/70 uppercase tracking-widest pl-1 mt-0.5">
          Indonesia
        </span>
      )}
    </div>
  );
};
