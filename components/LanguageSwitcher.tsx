
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fa' : 'en');
    };

    return (
        <div className="absolute top-6 right-6 z-10">
            <button onClick={toggleLanguage} className="glass-morphism px-4 py-2 rounded-full flex items-center space-x-2 text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                <span className={`transition-opacity duration-300 ${language === 'en' ? 'opacity-100' : 'opacity-50'}`}>EN</span>
                <div className="w-10 h-5 bg-black/20 rounded-full flex items-center p-1 cursor-pointer">
                    <div
                        className={`w-4 h-4 bg-cyan-400 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                            language === 'fa' ? 'translate-x-5' : ''
                        }`}
                    ></div>
                </div>
                <span className={`transition-opacity duration-300 ${language === 'fa' ? 'opacity-100' : 'opacity-50'}`}>FA</span>
            </button>
        </div>
    );
};
