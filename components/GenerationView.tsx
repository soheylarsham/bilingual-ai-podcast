import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card } from './common/Card';
import { MicVocal } from 'lucide-react';

export const GenerationView: React.FC = () => {
    const { t, fontClass } = useLanguage();

    return (
        <Card className={`w-full max-w-2xl text-center animate-enter ${fontClass}`}>
            <div className="flex flex-col items-center justify-center gap-6 p-8">
                <div className="relative w-40 h-40">
                    <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-2 border-4 border-magenta-500/30 rounded-full animate-spin-slow animation-delay-[-2s]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-purple-900/50 rounded-full flex items-center justify-center animate-neon-pulse">
                            <MicVocal className="w-12 h-12 text-cyan-400" />
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-bold neon-text-cyan">{t('generating')}</h1>
                <p className="text-lg text-gray-300">{t('generating_desc')}</p>
            </div>
        </Card>
    );
};
