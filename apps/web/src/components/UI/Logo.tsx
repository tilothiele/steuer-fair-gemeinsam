interface LogoProps {
  className?: string;
  darkMode?: boolean;
}

export default function Logo({ className = '', darkMode = false }: LogoProps) {
  const logoSrc = darkMode ? '/logo-dark.svg' : '/logo.svg';
  
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoSrc}
        alt="Steuer-Fair Logo"
        className="w-auto h-auto max-w-[200px]"
        style={{ height: 'auto' }}
      />
    </div>
  );
}
