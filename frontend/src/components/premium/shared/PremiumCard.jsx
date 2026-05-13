import React from 'react';

export const PremiumCard = ({
  children,
  className = '',
}) => (
  <div
    className={`
      bg-white
      border
      border-[#e2e8f0]
      rounded-[24px]
      shadow-sm
      ${className}
    `}
  >
    {children}
  </div>
);