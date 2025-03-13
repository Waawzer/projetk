import React from 'react';

interface BlackHoleLogoProps {
  className?: string;
  size?: number;
}

const BlackHoleLogo: React.FC<BlackHoleLogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Cercle extérieur (accrétion) */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.6" fill="none" />
      
      {/* Cercle intérieur (horizon des événements) */}
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      
      {/* Rayons de lumière courbés */}
      <path d="M12 2C14.5 2 17 3 18.5 4.5" stroke="currentColor" strokeOpacity="0.8" />
      <path d="M22 12C22 14.5 21 17 19.5 18.5" stroke="currentColor" strokeOpacity="0.8" />
      <path d="M12 22C9.5 22 7 21 5.5 19.5" stroke="currentColor" strokeOpacity="0.8" />
      <path d="M2 12C2 9.5 3 7 4.5 5.5" stroke="currentColor" strokeOpacity="0.8" />
    </svg>
  );
};

export default BlackHoleLogo; 