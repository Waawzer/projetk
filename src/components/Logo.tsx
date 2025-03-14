'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className = '', size = 40 }: LogoProps) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/images/logo.png"
        alt="Kasar Studio Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo; 