
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div 
            className={`glass-morphism rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 ease-in-out transform-style-3d hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(255,0,255,0.5),_0_0_15px_rgba(0,255,255,0.5)] ${className}`}
            style={{ transform: 'rotateY(0deg) rotateX(0deg)' }}
        >
            {children}
        </div>
    );
};
