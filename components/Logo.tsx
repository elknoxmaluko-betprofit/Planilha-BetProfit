
import React, { useId } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  // Gera um ID único para este componente para evitar conflitos de gradiente
  // quando múltiplos logos são renderizados (ex: header mobile vs sidebar desktop)
  const rawId = useId();
  const gradientId = `logo_gradient_${rawId.replace(/:/g, '')}`;

  const dimensions = {
    sm: 'w-12 h-12',    
    md: 'w-24 h-24',    
    lg: 'w-48 h-48',    
    xl: 'w-64 h-64'     
  };

  return (
    <div className={`relative ${dimensions[size]} ${className} group`}>
      {/* Efeito de Brilho de Fundo */}
      <div className="absolute inset-[-10%] bg-yellow-400/20 blur-2xl rounded-full group-hover:bg-yellow-400/40 transition-all duration-700"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_20px_50px_rgba(234,179,8,0.3)] transform group-hover:scale-105 transition-transform duration-500"
      >
        {/* Forma Base - Escudo/Hexágono com gradiente mais rico */}
        <path 
          d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z" 
          fill={`url(#${gradientId})`} 
        />
        
        {/* Detalhe do Gráfico Ascendente dentro do B */}
        <path 
          d="M35 65V35H45C55 35 55 45 45 45C55 45 55 55 45 55H35" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Linha de Lucro (Arrow) */}
        <path 
          d="M35 55L45 45L55 55L70 35" 
          stroke="#0f172a" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Barra de destaque inferior - Estilizada */}
        <rect x="35" y="60" width="10" height="8" rx="2" fill="#0f172a" />
        <rect x="50" y="55" width="10" height="13" rx="2" fill="#0f172a" fillOpacity="0.6" />
        <rect x="65" y="45" width="10" height="23" rx="2" fill="#0f172a" fillOpacity="0.3" />

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" /> {/* yellow-300 */}
            <stop offset="0.5" stopColor="#facc15" /> {/* yellow-400 */}
            <stop offset="1" stopColor="#a16207" /> {/* yellow-800 */}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
