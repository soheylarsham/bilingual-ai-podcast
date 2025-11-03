
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    glowColor?: 'cyan' | 'magenta';
}

export const Button: React.FC<ButtonProps> = ({ children, glowColor = 'cyan', className, ...props }) => {
    const glowClass = glowColor === 'cyan' ? 'neon-glow-cyan hover:shadow-[0_0_10px_#0ff,0_0_20px_#0ff,0_0_30px_#0ff]' : 'neon-glow-magenta hover:shadow-[0_0_10px_#f0f,0_0_20px_#f0f,0_0_30px_#f0f]';
    
    return (
        <button
            className={`px-8 py-3 font-bold text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none ${glowClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
