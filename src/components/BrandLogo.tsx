'use client';

import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const BrandLogo = ({ className = '', width = 180, height = 60 }: BrandLogoProps) => {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src="/images/brand-logo.png"
        alt="Kasar Studio"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
};

export default BrandLogo; 