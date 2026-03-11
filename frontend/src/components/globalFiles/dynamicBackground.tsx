import { useState, useEffect } from 'react';

interface DynamicBackgroundProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  particleCount?: number;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  particleCount = 20 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const getIntensityOpacity = () => {
    switch (intensity) {
      case 'low': return 'opacity-10';
      case 'medium': return 'opacity-20';
      case 'high': return 'opacity-30';
      default: return 'opacity-20';
    }
  };

  return (
    <div className={`relative min-h-screen bg-black text-white overflow-hidden ${className}`}>
      {/* Dynamic gradient background */}
      <div 
        className={`fixed inset-0 transition-all duration-700 ${getIntensityOpacity()}`}
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(99, 102, 241, 0.8) 0%, 
            rgba(168, 85, 247, 0.6) 25%, 
            rgba(236, 72, 153, 0.4) 50%, 
            rgba(0, 0, 0, 0.9) 100%)`
        }}
      />
   
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground;