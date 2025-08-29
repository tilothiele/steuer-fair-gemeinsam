import Image from 'next/image';

interface LogoProps {
  className?: string;
  darkMode?: boolean;
}

export default function Logo({ className = '', darkMode = false }: LogoProps) {
  const logoSrc = darkMode ? '/logo-dark.svg' : '/logo.svg';
  
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="Steuer-Fair Logo"
        width={200}
        height={60}
        className="h-auto w-auto"
        priority
      />
    </div>
  );
}
