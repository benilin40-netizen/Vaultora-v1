import React from 'react';

interface ValutoraLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const ValutoraLogo: React.FC<ValutoraLogoProps> = ({
  className = '',
  size = 40,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform"
      >
        <img 
          src="/favicon.svg" 
          alt="Valutora Emblem" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Valutora
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              UGX
            </span>
          </span>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Save smarter. Stay in control.</p>
        </div>
      )}
    </div>
  );
};
