
import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { useLanguage } from '../context/LanguageContext';
import type { GeneratedPodcast } from '../types';
import { Button } from './common/Button';
import { Search, ListMusic } from 'lucide-react';

interface HistoryViewProps {
    podcasts: GeneratedPodcast[];
    onSelectPodcast: (podcast: GeneratedPodcast) => void;
    onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ podcasts, onSelectPodcast, onBack }) => {
    const { t, fontClass } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPodcasts = useMemo(() => {
        if (!searchQuery) return podcasts;
        return podcasts.filter(p => p.settings.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [podcasts, searchQuery]);

    return (
        <Card className={`w-full max-w-4xl animate-enter ${fontClass}`}>
            <h1 className="text-3xl font-bold text-center mb-4 neon-text-cyan">{t('history')}</h1>
            
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchHistory')}
                    className="w-full bg-black/20 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                />
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredPodcasts.length > 0 ? (
                    filteredPodcasts.map(podcast => {
                        const thumbnail = podcast.thumbnailBase64s && podcast.thumbnailBase64s.length > 0 ? podcast.thumbnailBase64s[0] : null;
                        return (
                            <div key={podcast.id} className="glass-morphism p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                {thumbnail ? (
                                    <img src={thumbnail} alt={podcast.settings.topic} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0">
                                        <ListMusic size={32} className="text-gray-500" />
                                    </div>
                                )}
                                <div className="flex-grow overflow-hidden">
                                    <h3 className="font-bold truncate">{podcast.settings.topic}</h3>
                                    <p className="text-sm text-gray-400">{new Date(podcast.createdAt).toLocaleString()}</p>
                                </div>
                                <Button glowColor="magenta" onClick={() => onSelectPodcast(podcast)} className="px-4 py-2 text-sm flex-shrink-0">
                                    {t('viewPodcast')}
                                </Button>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-4">
                        <ListMusic size={48} />
                        <p>{t('noHistory')}</p>
                    </div>
                )}
            </div>

             <div className="text-center mt-8">
                <button onClick={onBack} className="font-bold text-gray-300 hover:text-white transition-colors">{t('backToSettings')}</button>
            </div>
        </Card>
    );
};
