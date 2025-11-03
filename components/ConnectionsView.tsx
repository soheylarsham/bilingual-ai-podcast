import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { useLanguage } from '../context/LanguageContext';
import type { ConnectionType, AllConnectionSettings, ConnectionSettings } from '../types';
import { saveConnectionSetting, getAllConnectionSettings } from '../utils/connections';
import { Bot, Link, CheckCircle, Info } from 'lucide-react';

interface ConnectionsViewProps {
    onBack: () => void;
}

const initialSettings: AllConnectionSettings = {
    telegram: { id: 'telegram', enabled: false, workerUrl: '', workerSecret: '' },
    discord: { id: 'discord', enabled: false, workerUrl: '', workerSecret: '' },
    instagram: { id: 'instagram', enabled: false },
    twitter: { id: 'twitter', enabled: false, workerUrl: '', workerSecret: '' },
    webhook: { id: 'webhook', enabled: false, workerUrl: '', workerSecret: '' },
    wordpress: { id: 'wordpress', enabled: false, workerUrl: '', workerSecret: '' },
};


export const ConnectionsView: React.FC<ConnectionsViewProps> = ({ onBack }) => {
    const { t, fontClass } = useLanguage();
    const [activeTab, setActiveTab] = useState<ConnectionType>('telegram');
    const [settings, setSettings] = useState<AllConnectionSettings>(initialSettings);
    const [showSaved, setShowSaved] = useState<ConnectionType | null>(null);

    useEffect(() => {
        const loadedSettings = getAllConnectionSettings();
        // Merge loaded settings with initial settings to ensure all keys exist
        const fullSettings = { ...initialSettings };
        for (const key in loadedSettings) {
             (fullSettings as any)[key] = loadedSettings[key as ConnectionType];
        }
        setSettings(fullSettings);
    }, []);

    const handleSave = (id: ConnectionType) => {
        const currentSettings = settings[id];
        if ('workerUrl' in currentSettings && !currentSettings.workerUrl) {
            alert(t('workerUrlPlaceholder'));
            return;
        }
        const newSettings = { ...currentSettings, enabled: true };
        saveConnectionSetting(id, newSettings);
        setSettings(prev => ({ ...prev, [id]: newSettings }));
        setShowSaved(id);
        setTimeout(() => setShowSaved(null), 2000);
    };

    const handleDisconnect = (id: ConnectionType) => {
        const newSettings = { ...initialSettings[id], enabled: false };
        saveConnectionSetting(id, newSettings);
        setSettings(prev => ({ ...prev, [id]: newSettings }));
    };

    const handleChange = (id: ConnectionType, field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const tabs: { id: ConnectionType, label: string }[] = [
        { id: 'telegram', label: t('telegram') },
        { id: 'discord', label: t('discord') },
        { id: 'twitter', label: t('twitter') },
        { id: 'wordpress', label: t('wordpress') },
        { id: 'webhook', label: t('webhook') },
        { id: 'instagram', label: t('instagram') },
    ];
    
    const renderContent = () => {
        const current = settings[activeTab];
        if (!current) return null; // Should not happen
        const isConnected = current.enabled;
        const guideKey = `guide_${activeTab}` as any;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                {/* Form Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold neon-text-magenta">{t(activeTab as any)} {t('settings')}</h3>
                    
                    {activeTab !== 'instagram' && 'workerUrl' in current && (
                        <>
                        <input 
                            type="url" 
                            placeholder={t('workerUrl')} 
                            value={current.workerUrl} 
                            onChange={e => handleChange(activeTab, 'workerUrl', e.target.value)} 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3" 
                        />
                        <input 
                            type="password" 
                            placeholder={t('workerSecret')} 
                            value={current.workerSecret} 
                            onChange={e => handleChange(activeTab, 'workerSecret', e.target.value)} 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3" 
                        />
                        </>
                    )}

                    {activeTab !== 'instagram' && (
                        isConnected ?
                            <Button onClick={() => handleDisconnect(activeTab)} glowColor="magenta" className="w-full">{t('disconnect')}</Button> :
                            <Button onClick={() => handleSave(activeTab)} glowColor="cyan" className="w-full">{showSaved === activeTab ? <CheckCircle/> : t('connect')}</Button>
                    )}
                </div>

                {/* Guide Section */}
                <div className="glass-morphism p-4 rounded-lg">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Info size={20} /> {t('guide')}</h3>
                    <div className="mt-2 text-gray-300 text-sm space-y-2 leading-relaxed prose prose-invert prose-a:text-cyan-400 prose-strong:text-white max-h-[300px] overflow-y-auto pr-2">
                        {t(guideKey).split('\n').map((line, i) => {
                             if (line.trim() === '') return <br key={i} />;
                            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g; // Use global flag to find all matches
                            const parts = line.split(linkRegex);
                            return <p key={i}>
                                {parts.map((part, index) => {
                                    // Every 3rd item is a URL, and the one before it is the link text
                                    if (index % 3 === 1) {
                                        const href = parts[index + 1];
                                        return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{part}</a>;
                                    }
                                    if (index % 3 === 2) {
                                        return null; // This was the URL, already used
                                    }
                                    return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/`([^`]+)`/g, '<code class="bg-black/50 px-1.5 py-0.5 rounded text-magenta-300 font-mono text-xs">$1</code>').replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>') }} />;
                                })}
                            </p>
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className={`w-full max-w-5xl animate-enter ${fontClass}`}>
            <h1 className="text-3xl font-bold text-center mb-2 neon-text-cyan">{t('connections')}</h1>
            <p className="text-center text-gray-400 mb-6">{t('connections_desc')}</p>

            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-white/5'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {renderContent()}

            <div className="text-center mt-8">
                <button onClick={onBack} className="font-bold text-gray-300 hover:text-white transition-colors">{t('backToSettings')}</button>
            </div>
        </Card>
    );
};