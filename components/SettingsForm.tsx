import React, { useState, useRef, useEffect } from 'react';
import type { PodcastSettings, CustomImage, ImageCustomizationSettings, TextEffectStyle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UploadCloud, Link as LinkIcon, Trash2, FileText, History, Image, Type as TypeIcon, Settings2, X, PlugZap } from 'lucide-react';
import type { TranslationKeys } from '../context/LanguageContext';
import { fileToDataUrl } from '../utils/file';


// --- Image Editor Modal Component ---
interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    initialSettings: ImageCustomizationSettings;
    onApply: (newSettings: ImageCustomizationSettings) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, imageSrc, initialSettings, onApply }) => {
    const { t, fontClass } = useLanguage();
    const [settings, setSettings] = useState<ImageCustomizationSettings>(initialSettings);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new window.Image());

    const fonts = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Vazirmatn'];

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);

        if (settings.textOverlay) {
            const fontSize = settings.fontSize * (rect.width / 500); // Scale font size with preview size
            ctx.font = `${fontSize}px ${settings.font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Apply styles
            switch (settings.effectStyle) {
                case 'Neon':
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = settings.color;
                    ctx.shadowBlur = 15;
                    ctx.fillText(settings.textOverlay, rect.width / 2, rect.height / 2);
                    ctx.shadowBlur = 0; // Reset
                    ctx.fillStyle = settings.color;
                    break;
                case 'Gradient':
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, settings.color);
                    gradient.addColorStop(1, '#ffffff');
                    ctx.fillStyle = gradient;
                    break;
                case 'Glass':
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.filter = 'blur(1px)';
                    break;
                default: // Normal
                    ctx.fillStyle = settings.color;
                    break;
            }
            
            ctx.fillText(settings.textOverlay, rect.width / 2, rect.height / 2);
            ctx.filter = 'none'; // Reset filters
        }
    };

    useEffect(() => {
        const img = imageRef.current;
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;
        img.onload = () => drawCanvas();
    }, [imageSrc]);

    useEffect(() => {
        drawCanvas();
    }, [settings]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`glass-morphism w-full max-w-4xl rounded-2xl p-6 relative animate-enter ${fontClass}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                <h2 className="text-2xl font-bold text-center mb-4 neon-text-cyan">{t('imageSettings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div>
                        <canvas ref={canvasRef} className="w-full aspect-square rounded-lg bg-black/20"></canvas>
                    </div>
                    {/* Controls */}
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold">{t('textOverlay')}</label>
                            <input type="text" value={settings.textOverlay} onChange={e => setSettings(s => ({ ...s, textOverlay: e.target.value }))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">{t('font')}</label>
                                <select value={settings.font} onChange={e => setSettings(s => ({ ...s, font: e.target.value }))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 mt-1">
                                    {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold">{t('fontSize')}</label>
                                <input type="range" min="10" max="100" value={settings.fontSize} onChange={e => setSettings(s => ({ ...s, fontSize: parseInt(e.target.value) }))} className="w-full mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">{t('color')}</label>
                                <input type="color" value={settings.color} onChange={e => setSettings(s => ({ ...s, color: e.target.value }))} className="w-full h-10 bg-transparent border-none p-0 cursor-pointer mt-1" />
                            </div>
                            <div>
                                <label className="font-semibold">{t('style')}</label>
                                <select value={settings.effectStyle} onChange={e => setSettings(s => ({ ...s, effectStyle: e.target.value as TextEffectStyle }))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 mt-1">
                                    <option value="Normal">{t('style_Normal')}</option>
                                    <option value="Neon">{t('style_Neon')}</option>
                                    <option value="Gradient">{t('style_Gradient')}</option>
                                    <option value="Glass">{t('style_Glass')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button onClick={handleApply} glowColor="cyan" className="w-full">{t('apply')}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Settings Form ---
interface SettingsFormProps {
    onGenerate: (settings: PodcastSettings) => void;
    onViewHistory: () => void;
    onViewConnections: () => void;
}

const toneOptionKeys: TranslationKeys[] = [
    'tone_Normal', 'tone_Friendly', 'tone_Formal', 'tone_News_style', 'tone_Inspirational', 'tone_Sports_commentary', 'tone_Poetic_Recitation', 'tone_Enthusiastic'
];

export const SettingsForm: React.FC<SettingsFormProps> = ({ onGenerate, onViewHistory, onViewConnections }) => {
    const { t, fontClass, dir } = useLanguage();
    const [settings, setSettings] = useState<PodcastSettings>({
        generationMode: 'topic', topic: '', duration: 10, tone: 'Normal', gender: 'female', speed: 'normal',
        outputFormat: ['audio', 'text'], sourceUrls: [], sourceFiles: [], sourceScope: 'both', verbalCitation: true,
        backgroundMusic: false, musicStyle: 'Calm, lo-fi instrumental', scriptText: '', scriptFile: undefined,
        thumbnailMode: 'ai', customImages: [],
    });
    const [urlInput, setUrlInput] = useState('');
    const [imageUrlInput, setImageUrlInput] = useState('');
    const sourceFileInputRef = useRef<HTMLInputElement>(null);
    const scriptFileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
    
    // Image Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<CustomImage | null>(null);

    const handleChange = (field: keyof PodcastSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleCustomImageChange = async (files: FileList | null) => {
        if (!files) return;
        const newImages: CustomImage[] = await Promise.all(Array.from(files).map(async file => {
            const preview = await fileToDataUrl(file);
            return {
                id: `${file.name}-${Date.now()}`,
                source: 'file' as 'file',
                value: file,
                preview,
                settings: { textOverlay: '', font: 'Arial', fontSize: 50, color: '#FFFFFF', effectStyle: 'Normal' },
            };
        }));
        setSettings(prev => ({ ...prev, customImages: [...prev.customImages, ...newImages] }));
    };

    const handleAddImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        const newImage: CustomImage = {
            id: `${imageUrlInput}-${Date.now()}`,
            source: 'url',
            value: imageUrlInput,
            preview: imageUrlInput, // Use URL directly as preview
            settings: { textOverlay: '', font: 'Arial', fontSize: 50, color: '#FFFFFF', effectStyle: 'Normal' },
        };
        setSettings(prev => ({ ...prev, customImages: [...prev.customImages, newImage] }));
        setImageUrlInput('');
    };
    
    const removeCustomImage = (id: string) => {
        setSettings(prev => ({ ...prev, customImages: prev.customImages.filter(img => img.id !== id) }));
    };

    const openEditor = (image: CustomImage) => {
        setEditingImage(image);
        setIsEditorOpen(true);
    };

    const handleApplyEditorSettings = (newImageSettings: ImageCustomizationSettings) => {
        if (!editingImage) return;
        setSettings(prev => ({
            ...prev,
            customImages: prev.customImages.map(img =>
                img.id === editingImage.id ? { ...img, settings: newImageSettings } : img
            ),
        }));
        setEditingImage(null);
    };

    const handleScriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleChange('scriptFile', e.target.files[0]);
            handleChange('scriptText', '');
        }
    };
    
    const handleScriptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleChange('scriptText', e.target.value);
        if (settings.scriptFile) handleChange('scriptFile', undefined);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (settings.topic.trim()) {
            const englishToneValue = settings.tone.startsWith('tone_') ? settings.tone.substring(5).replace('_', ' ') : settings.tone;
            onGenerate({ ...settings, tone: englishToneValue });
        }
    };

    return (
        <Card className={`w-full max-w-4xl animate-enter ${fontClass}`}>
            {editingImage && (
                <ImageEditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    imageSrc={editingImage.preview}
                    initialSettings={editingImage.settings}
                    onApply={handleApplyEditorSettings}
                />
            )}
            <LanguageSwitcher />
            <h1 className="text-4xl font-bold text-center mb-2 neon-text-cyan">{t('title')}</h1>
            <p className="text-center text-gray-400 mb-6">Craft your perfect podcast with AI precision.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Generation Mode & Topic */}
                <div className="segmented-control max-w-sm mx-auto">
                    <button type="button" onClick={() => handleChange('generationMode', 'topic')} className={settings.generationMode === 'topic' ? 'active' : ''}>{t('fromTopic')}</button>
                    <button type="button" onClick={() => handleChange('generationMode', 'script')} className={settings.generationMode === 'script' ? 'active' : ''}>{t('fromScript')}</button>
                </div>
                <div>
                    <label htmlFor="topic" className="block text-lg font-semibold mb-2 neon-text-magenta">{settings.generationMode === 'topic' ? t('topic') : t('podcastTitleTopic')}</label>
                    <input id="topic" type="text" value={settings.topic} onChange={e => handleChange('topic', e.target.value)} placeholder={settings.generationMode === 'topic' ? t('topicPlaceholder') : t('podcastTitleTopicPlaceholder')} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow" required />
                </div>
                
                {/* Script Input Section */}
                {settings.generationMode === 'script' && (
                    <div className="glass-morphism p-4 rounded-lg space-y-3">
                        <textarea value={settings.scriptText} onChange={handleScriptTextChange} placeholder={t('typeOrPaste')} className="w-full h-24 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-magenta-500 transition-shadow resize-y" />
                        <button type="button" onClick={() => scriptFileInputRef.current?.click()} className="w-full text-center bg-black/20 border border-dashed border-white/20 rounded-lg px-4 py-3 hover:bg-black/30 transition-colors flex items-center justify-center gap-2"><UploadCloud size={18}/> {t('uploadScriptFile')}</button>
                        <input type="file" ref={scriptFileInputRef} onChange={handleScriptFileChange} className="hidden" accept=".pdf,.docx,.txt,image/*" />
                        {settings.scriptFile && <div className="flex justify-between items-center bg-black/20 p-2 rounded text-sm"><span className="truncate text-magenta-300 flex items-center gap-2">{settings.scriptFile.type.startsWith('image/') ? <Image size={16}/> : <FileText size={16}/>}{settings.scriptFile.name}</span><button type="button" onClick={() => handleChange('scriptFile', undefined)}><Trash2 size={16} className="text-red-500 hover:text-red-400"/></button></div>}
                    </div>
                )}

                {/* Core Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="duration" className="block text-sm font-semibold mb-2">{t('duration')}</label>
                        <div className="flex items-center gap-4"><input id="duration" type="range" min="1" max="30" value={settings.duration} onChange={e => handleChange('duration', parseInt(e.target.value))} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer" /><span className="bg-black/20 px-3 py-1 rounded-md text-cyan-400 font-bold w-16 text-center">{settings.duration} min</span></div>
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-semibold mb-2">{t('tone')}</label>
                        <select id="tone" value={settings.tone} onChange={e => handleChange('tone', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">{toneOptionKeys.map(key => <option key={key} value={key}>{t(key)}</option>)}</select>
                    </div>
                    <div className="segmented-control"><button type="button" onClick={() => handleChange('gender', 'male')} className={settings.gender === 'male' ? 'active' : ''}>{t('male')}</button><button type="button" onClick={() => handleChange('gender', 'female')} className={settings.gender === 'female' ? 'active' : ''}>{t('female')}</button></div>
                    <div className="segmented-control"><button type="button" onClick={() => handleChange('speed', 'slow')} className={settings.speed === 'slow' ? 'active' : ''}>{t('slow')}</button><button type="button" onClick={() => handleChange('speed', 'normal')} className={settings.speed === 'normal' ? 'active' : ''}>{t('normal')}</button><button type="button" onClick={() => handleChange('speed', 'fast')} className={settings.speed === 'fast' ? 'active' : ''}>{t('fast')}</button></div>
                </div>

                {/* Thumbnail Source */}
                <div>
                    <label className="block text-lg font-semibold mb-2 neon-text-magenta">{t('thumbnailSource')}</label>
                    <div className="segmented-control">
                        <button type="button" onClick={() => handleChange('thumbnailMode', 'ai')} className={settings.thumbnailMode === 'ai' ? 'active' : ''}>{t('aiGenerated')}</button>
                        <button type="button" onClick={() => handleChange('thumbnailMode', 'upload')} className={settings.thumbnailMode === 'upload' ? 'active' : ''}>{t('uploadCustom')}</button>
                        <button type="button" onClick={() => handleChange('thumbnailMode', 'url')} className={settings.thumbnailMode === 'url' ? 'active' : ''}>{t('fromUrl')}</button>
                        <button type="button" onClick={() => handleChange('thumbnailMode', 'none')} className={settings.thumbnailMode === 'none' ? 'active' : ''}>{t('noThumbnail')}</button>
                    </div>
                    {(settings.thumbnailMode === 'upload' || settings.thumbnailMode === 'url') && (
                        <div className="mt-4 glass-morphism p-4 rounded-lg">
                            {settings.thumbnailMode === 'upload' && (
                                <button type="button" onClick={() => thumbnailFileInputRef.current?.click()} className="w-full text-center bg-black/20 border border-dashed border-white/20 rounded-lg px-4 py-3 hover:bg-black/30 transition-colors flex items-center justify-center gap-2"><UploadCloud size={18}/> {t('uploadCustom')}</button>
                            )}
                            <input type="file" multiple ref={thumbnailFileInputRef} onChange={(e) => handleCustomImageChange(e.target.files)} className="hidden" accept="image/*" />
                            {settings.thumbnailMode === 'url' && (
                                <div className="flex gap-2">
                                    <input type="url" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder={t('addImageUrl')} className="flex-grow bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-magenta-500" />
                                    <button type="button" onClick={handleAddImageUrl} className="bg-magenta-600 hover:bg-magenta-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">{t('addUrl')}</button>
                                </div>
                            )}
                            {settings.customImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {settings.customImages.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.preview} alt="preview" className="w-full aspect-square object-cover rounded-lg"/>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button type="button" onClick={() => openEditor(img)} className="p-2 bg-black/50 rounded-full text-white hover:bg-cyan-500"><Settings2 size={16}/></button>
                                                <button type="button" onClick={() => removeCustomImage(img.id)} className="p-2 bg-black/50 rounded-full text-white hover:bg-red-500"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Submit */}
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button type="button" onClick={onViewHistory} glowColor="magenta" className="text-lg flex items-center gap-2"><History size={20} /> {t('history')}</Button>
                     <Button type="button" onClick={onViewConnections} glowColor="magenta" className="text-lg flex items-center gap-2"><PlugZap size={20} /> {t('connections')}</Button>
                    <Button type="submit" glowColor="cyan" className="text-lg">{t('generate')}</Button>
                </div>
            </form>
        </Card>
    );
};