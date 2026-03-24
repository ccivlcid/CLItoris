import React from 'react';

interface IconProps {
  name: 'reply' | 'fork' | 'star' | 'star-filled' | 'close' | 'menu' | 'help' | 'copy';
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
  const baseClass = `inline-block fill-current ${className}`;
  
  switch (name) {
    case 'reply':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      );
    case 'fork':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'star-filled':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      );
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      );
    case 'help':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
        </svg>
      );
    case 'copy':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className={baseClass}>
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
        </svg>
      );
    default:
      return null;
  }
};
