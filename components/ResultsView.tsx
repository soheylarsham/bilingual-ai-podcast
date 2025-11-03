import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GeneratedPodcast, SocialPost, ConnectionType, AllConnectionSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Play, Pause, Download, FileText, Link, Share2, Copy, ChevronsLeftRight, Volume2, Music, Edit3, XCircle, CheckCircle, UploadCloud, ListMusic, ChevronLeft, ChevronRight, X, Loader, Check, AlertTriangle } from 'lucide-react';
import { getAllConnectionSettings } from '../utils/connections';

declare const JSZip: any;

// --- Audio Helper Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const saveAs = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

function bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels, length = buffer.length * numOfChan * 2 + 44, bufferArr = new ArrayBuffer(length), view = new DataView(bufferArr), channels = [];
    let i, sample, offset = 0, pos = 0;
    function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    for (i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true); pos += 2;
      }
      offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    podcast: GeneratedPodcast;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, podcast }) => {
    const { t, fontClass } = useLanguage();
    const [connections, setConnections] = useState<Partial<AllConnectionSettings>>({});
    const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectionType[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<ConnectionType[]>([]);
    const [publishingStatus, setPublishingStatus] = useState<Record<ConnectionType, 'idle' | 'publishing' | 'published' | 'error'>>({} as any);

    useEffect(() => {
        if (isOpen) {
            const settings = getAllConnectionSettings();
            setConnections(settings);
            const enabled = (Object.keys(settings) as ConnectionType[]).filter(key => settings[key]?.enabled && key !== 'instagram');
            setConnectedPlatforms(enabled);
            setSelectedPlatforms(enabled);
            const initialStatus = {} as Record<ConnectionType, 'idle' | 'publishing' | 'published' | 'error'>;
            enabled.forEach(p => initialStatus[p] = 'idle');
            setPublishingStatus(initialStatus);
        }
    }, [isOpen]);

    const togglePlatform = (platform: ConnectionType) => {
        setSelectedPlatforms(prev => prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]);
    };

    const handlePublish = async () => {
        selectedPlatforms.forEach(async (platform) => {
            setPublishingStatus(prev => ({ ...prev, [platform]: 'publishing' }));
            
            const connection = connections[platform];
            if (!connection || !('workerUrl' in connection) || !connection.workerUrl) {
                setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
                return;
            }

            try {
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (connection.workerSecret) {
                    headers['Authorization'] = `Bearer ${connection.workerSecret}`;
                }
                
                const response = await fetch(connection.workerUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(podcast),
                });

                if (!response.ok) {
                    throw new Error(`Worker responded with status: ${response.status}`);
                }
                
                setPublishingStatus(prev => ({ ...prev, [platform]: 'published' }));

            } catch (error) {
                console.error(`Failed to publish to ${platform}:`, error);
                setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`glass-morphism w-full max-w-lg rounded-2xl p-6 relative animate-enter ${fontClass}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                <h2 className="text-2xl font-bold text-center mb-2 neon-text-cyan">{t('share_title')}</h2>
                <p className="text-center text-gray-400 mb-6">{t('share_desc')}</p>

                <div className="space-y-3">
                    {connectedPlatforms.length > 0 ? connectedPlatforms.map(platform => (
                        <div key={platform} onClick={() => publishingStatus[platform] === 'idle' && togglePlatform(platform)} className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selectedPlatforms.includes(platform) ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
                            <span className="font-semibold capitalize">{t(platform as any)}</span>
                            {publishingStatus[platform] === 'idle' && <div className={`w-6 h-6 rounded-md border-2 ${selectedPlatforms.includes(platform) ? 'bg-cyan-500 border-cyan-400' : 'border-gray-500'}`} />}
                            {publishingStatus[platform] === 'publishing' && <Loader size={20} className="animate-spin text-cyan-400"/>}
                            {publishingStatus[platform] === 'published' && <Check size={20} className="text-green-400"/>}
                            {publishingStatus[platform] === 'error' && <AlertTriangle size={20} className="text-red-400"/>}
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-4">{t('notConnected')}</p>
                    )}
                </div>

                {connectedPlatforms.length > 0 && (
                    <div className="mt-6">
                        <Button onClick={handlePublish} glowColor="cyan" className="w-full" disabled={selectedPlatforms.length === 0 || Object.values(publishingStatus).some(s => s === 'publishing')}>
                            {t('publish')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};


interface ResultsViewProps {
    podcast: GeneratedPodcast;
    onBack: () => void;
    onUpdateTranscript: (id: string, newTranscript: string) => void;
}

const SocialIcon: React.FC<{ platform: SocialPost['platform'] }> = ({ platform }) => {
    if (platform === 'Instagram') return <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600" />;
    if (platform === 'Twitter/X') return <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white font-bold">X</div>;
    if (platform === 'Telegram') return <div className="w-6 h-6 rounded-full bg-blue-400" />;
    return null;
};

export const ResultsView: React.FC<ResultsViewProps> = ({ podcast, onBack, onUpdateTranscript }) => {
    const { t, fontClass } = useLanguage();
    const [activeTab, setActiveTab] = useState<'transcript' | 'references' | 'social'>('transcript');
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [voiceVolume, setVoiceVolume] = useState(1);
    const [musicVolume, setMusicVolume] = useState(0.2);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const musicAudioRef = useRef<HTMLAudioElement>(null);
    const voiceGainNodeRef = useRef<GainNode | null>(null);
    const startTimeRef = useRef(0);
    const pausedTimeRef = useRef(0);
    const animationFrameRef = useRef(0);
    const [isEditingTranscript, setIsEditingTranscript] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState(podcast.transcript);
    const [showSaveNotification, setShowSaveNotification] = useState(false);
    const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => { setEditedTranscript(podcast.transcript); }, [podcast.transcript]);

    const handleSaveTranscript = () => {
        onUpdateTranscript(podcast.id, editedTranscript);
        setIsEditingTranscript(false);
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 2000);
    };

    const cleanupAudio = useCallback(() => {
        if (sourceNodeRef.current) { try { sourceNodeRef.current.stop(); } catch (e) {} sourceNodeRef.current.disconnect(); sourceNodeRef.current = null; }
        if (musicAudioRef.current) { musicAudioRef.current.pause(); musicAudioRef.current.src = ''; }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close(); audioContextRef.current = null; }
        cancelAnimationFrame(animationFrameRef.current);
    }, []);

    useEffect(() => {
        const initializeAudio = async () => {
            cleanupAudio();
            if (!podcast.audioBase64Chunks || podcast.audioBase64Chunks.length === 0) return;
            try {
                const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                audioContextRef.current = context;
                const voiceGain = context.createGain();
                voiceGain.connect(context.destination);
                voiceGainNodeRef.current = voiceGain;
                voiceGain.gain.value = voiceVolume;
                
                const audioBuffers: AudioBuffer[] = await Promise.all(podcast.audioBase64Chunks.map(b64Chunk => decodeAudioData(decode(b64Chunk), context, 24000, 1)));
                if (audioBuffers.length === 0) { setIsReady(false); return; }

                const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
                const combinedBuffer = context.createBuffer(1, totalLength, 24000);
                const channelData = combinedBuffer.getChannelData(0);
                let offset = 0;
                for (const buffer of audioBuffers) { channelData.set(buffer.getChannelData(0), offset); offset += buffer.length; }
                
                audioBufferRef.current = combinedBuffer;
                setDuration(combinedBuffer.duration);
                setIsReady(true);
            } catch (error) { console.error("Failed to initialize audio:", error); setIsReady(false); }
        };
        initializeAudio();
        return cleanupAudio;
    }, [podcast.audioBase64Chunks, cleanupAudio, voiceVolume]);
    
    const updateProgress = useCallback(() => {
        if (!isPlaying || !audioContextRef.current || !audioBufferRef.current) return;
        const elapsed = pausedTimeRef.current + (audioContextRef.current.currentTime - startTimeRef.current);
        if (elapsed < duration) {
            setCurrentTime(elapsed);
            setProgress((elapsed / duration) * 100);
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
            setCurrentTime(duration);
            setProgress(100);
            setIsPlaying(false);
            pausedTimeRef.current = 0;
            if (musicAudioRef.current) musicAudioRef.current.pause();
        }
    }, [isPlaying, duration]);

    useEffect(() => {
        if (isPlaying) { animationFrameRef.current = requestAnimationFrame(updateProgress); } 
        else { cancelAnimationFrame(animationFrameRef.current); }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isPlaying, updateProgress]);

    const togglePlay = () => {
        if (!isReady || !audioContextRef.current || !audioBufferRef.current) return;
        if (isPlaying) {
            cancelAnimationFrame(animationFrameRef.current);
            pausedTimeRef.current += audioContextRef.current.currentTime - startTimeRef.current;
            if (sourceNodeRef.current) try { sourceNodeRef.current.stop(); } catch (e) {}
            if (musicAudioRef.current) musicAudioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
            const newSource = audioContextRef.current.createBufferSource();
            newSource.buffer = audioBufferRef.current;
            newSource.connect(voiceGainNodeRef.current!);
            newSource.onended = () => { if (animationFrameRef.current) { setIsPlaying(false); cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = 0; const elapsed = pausedTimeRef.current + (audioContextRef.current!.currentTime - startTimeRef.current); if (elapsed >= duration - 0.1) { pausedTimeRef.current = 0; setCurrentTime(0); setProgress(0); } } };
            newSource.start(0, pausedTimeRef.current % duration);
            sourceNodeRef.current = newSource;
            if (musicAudioRef.current?.src) musicAudioRef.current.play();
            startTimeRef.current = audioContextRef.current.currentTime;
            setIsPlaying(true);
        }
    };
    
    const handleDownloadPackage = async () => {
        if (typeof JSZip === 'undefined' || !audioBufferRef.current) { alert('Could not create zip file.'); return; }
        const zip = new JSZip();
        zip.file('podcast.wav', bufferToWav(audioBufferRef.current));
        if (podcast.thumbnailBase64s) {
            podcast.thumbnailBase64s.forEach((dataUrl, index) => {
                const thumbnailData = dataUrl.split(',')[1];
                const mimeType = dataUrl.match(/:(.*?);/)?.[1] || 'image/jpeg';
                const extension = mimeType.split('/')[1] || 'jpeg';
                zip.file(`thumbnail_${index + 1}.${extension}`, thumbnailData, { base64: true });
            });
        }
        zip.file('transcript.txt', podcast.transcript);
        const socialPostsContent = `Social Media Posts for: ${podcast.settings.topic}\n\n` + podcast.socialPosts.map(p => `--- ${p.platform} ---\nCaption: ${p.caption}\nHashtags: ${p.hashtags}\n`).join('\n');
        zip.file('social_posts.txt', socialPostsContent);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `podcast_${podcast.settings.topic.replace(/\s/g, '_')}.zip`);
    };

    const hasThumbnails = podcast.thumbnailBase64s && podcast.thumbnailBase64s.length > 0;
    const showCarouselControls = hasThumbnails && podcast.thumbnailBase64s!.length > 1;

    const nextThumbnail = () => setCurrentThumbnailIndex(i => (i + 1) % podcast.thumbnailBase64s!.length);
    const prevThumbnail = () => setCurrentThumbnailIndex(i => (i - 1 + podcast.thumbnailBase64s!.length) % podcast.thumbnailBase64s!.length);

    return (
        <>
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} podcast={podcast} />
        <Card className={`w-full max-w-6xl animate-enter ${fontClass}`}>
            <div className="p-4">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 neon-text-cyan">{t('resultsTitle')}</h1>
                <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">"{podcast.settings.topic}"</p>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative group">
                            {hasThumbnails ? (
                                <img src={podcast.thumbnailBase64s![currentThumbnailIndex]} alt={podcast.settings.topic} className="w-full aspect-square object-cover rounded-2xl shadow-lg neon-glow-magenta" />
                            ) : (
                                <div className="w-full aspect-square rounded-2xl bg-black/20 flex items-center justify-center"><ListMusic size={64} className="text-gray-500" /></div>
                            )}
                            {showCarouselControls && (
                                <>
                                <button onClick={prevThumbnail} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft/></button>
                                <button onClick={nextThumbnail} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight/></button>
                                </>
                            )}
                        </div>
                        
                        <div className="glass-morphism p-4 rounded-xl flex items-center gap-4">
                           <button onClick={togglePlay} disabled={!isReady} className="bg-cyan-500/20 text-cyan-400 p-3 rounded-full hover:bg-cyan-500/40 disabled:opacity-50">{isPlaying ? <Pause size={28}/> : <Play size={28} className="ml-1"/>}</button>
                           <div className="flex-grow h-2 bg-black/30 rounded-full relative"><div className="absolute top-0 left-0 h-full bg-cyan-400 rounded-full" style={{ width: `${progress}%` }}></div></div>
                           <span className="text-sm text-gray-400 w-24 text-center">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        </div>
                        
                        <div className="space-y-3">
                             <Button onClick={() => setIsShareModalOpen(true)} glowColor="cyan" className="w-full flex justify-center gap-2"><Share2 size={20} /> {t('share')}</Button>
                             <Button onClick={handleDownloadPackage} glowColor="magenta" className="w-full flex justify-center gap-2"><Download size={20} /> {t('downloadPackage')}</Button>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="flex border-b border-white/10 mb-4">
                            <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 font-semibold ${activeTab === 'transcript' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>{t('transcript')}</button>
                            <button onClick={() => setActiveTab('references')} className={`px-4 py-2 font-semibold ${activeTab === 'references' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>{t('references')}</button>
                            <button onClick={() => setActiveTab('social')} className={`px-4 py-2 font-semibold ${activeTab === 'social' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>{t('socialMedia')}</button>
                        </div>
                        <div className="glass-morphism p-6 rounded-xl h-[40rem] lg:h-[calc(100%-3rem)] overflow-y-auto relative">
                             {activeTab === 'transcript' && (<>
                                {isEditingTranscript ? (<div className="flex gap-2 absolute top-2 right-2 z-10"><button onClick={handleSaveTranscript} className="p-2 rounded-md bg-green-500/20 text-green-400"><CheckCircle size={18} /></button><button onClick={() => setIsEditingTranscript(false)} className="p-2 rounded-md bg-red-500/20 text-red-400"><XCircle size={18} /></button></div>) : (<button onClick={() => setIsEditingTranscript(true)} className="p-2 rounded-md hover:bg-white/10 absolute top-2 right-2 z-10"><Edit3 size={18} /></button>)}
                                {showSaveNotification && <div className="absolute top-2 left-2 bg-green-500/80 text-white text-sm px-3 py-1 rounded-md">{t('transcriptUpdated')}</div>}
                                <textarea readOnly={!isEditingTranscript} value={editedTranscript} onChange={(e) => setEditedTranscript(e.target.value)} className="w-full h-full bg-transparent resize-none focus:outline-none whitespace-pre-wrap leading-relaxed"/>
                             </>)}
                            {activeTab === 'references' && <ul className="space-y-4">{podcast.sources.length > 0 ? podcast.sources.map(src => (<li key={src.url} className="bg-black/20 p-3 rounded-lg"><p className="font-bold text-cyan-300">{src.title}</p><p className="text-sm text-gray-400">by {src.author}</p><a href={src.url} target="_blank" rel="noopener noreferrer" className="text-magenta-400 text-sm hover:underline flex items-center gap-1"><Link size={14}/>{src.url}</a></li>)) : <p className='text-gray-400 text-center mt-8'>No external sources were used.</p>}</ul>}
                            {activeTab === 'social' && <div className="space-y-6">{podcast.socialPosts.map(post => (<div key={post.platform} className="bg-black/20 p-4 rounded-lg"><div className="flex justify-between items-center mb-3"><div className="flex items-center gap-3"><SocialIcon platform={post.platform} /><h4 className="font-bold text-lg">{post.platform}</h4></div><button onClick={() => navigator.clipboard.writeText(post.caption + ' ' + post.hashtags)} className="p-2 rounded-md hover:bg-white/10"><Copy size={18} /></button></div><p className="text-gray-300 whitespace-pre-wrap">{post.caption}</p><p className="text-cyan-400 mt-2 font-semibold">{post.hashtags}</p></div>))}</div>}
                        </div>
                    </div>
                </div>
                <div className="text-center mt-8"><button onClick={onBack} className="font-bold text-gray-300 hover:text-white">{t('back')}</button></div>
            </div>
        </Card>
        </>
    );
};