import React, { useState, useCallback, useEffect } from 'react';
import { SettingsForm } from './components/SettingsForm';
import { GenerationView } from './components/GenerationView';
import { ResultsView } from './components/ResultsView';
import { HistoryView } from './components/HistoryView';
import { ConnectionsView } from './components/ConnectionsView';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import type { PodcastSettings, GeneratedPodcast, ImageCustomizationSettings, CustomImage } from './types';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { addPodcast, getAllPodcasts, updatePodcastTranscript, initDB } from './db';
import { fileToDataUrl, fileToBase64 } from './utils/file';


type AppView = 'settings' | 'generating' | 'results' | 'history' | 'connections';

const cleanTranscript = (text: string): string => {
    let cleanedText = text;
    cleanedText = cleanedText.replace(/\(صدای .*?\)/g, '');
    cleanedText = cleanedText.replace(/\(با لحنی .*?\)/g, '');
    cleanedText = cleanedText.replace(/\(Sound of .*?\)/g, '');
    cleanedText = cleanedText.replace(/\(In a .*? tone\)/g, '');
    cleanedText = cleanedText.replace(/\([\w\s,]+\)/g, '');
    cleanedText = cleanedText.replace(/\[\d{1,2}:\d{2,2}-\d{1,2}:\d{2,2}\].*?\n?/g, '');
    return cleanedText.trim().replace(/\n\n+/g, '\n\n');
};

// Helper to apply customizations to an image via Canvas and return a data URL
const applyCanvasCustomizations = (imageSrc: string, settings: ImageCustomizationSettings): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas context not found');

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            if (settings.textOverlay) {
                const fontSize = settings.fontSize * (canvas.width / 500);
                ctx.font = `${fontSize}px ${settings.font}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                switch (settings.effectStyle) {
                    case 'Neon':
                        ctx.fillStyle = '#fff';
                        ctx.shadowColor = settings.color;
                        ctx.shadowBlur = 25 * (canvas.width / 500);
                        ctx.fillText(settings.textOverlay, canvas.width / 2, canvas.height / 2);
                        ctx.shadowBlur = 0;
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
                        ctx.filter = 'blur(2px)';
                        break;
                    default:
                        ctx.fillStyle = settings.color;
                        break;
                }
                ctx.fillText(settings.textOverlay, canvas.width / 2, canvas.height / 2);
                ctx.filter = 'none';
            }
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(`Failed to load image from: ${imageSrc}`);
        img.src = imageSrc;
    });
};


const AppContent: React.FC = () => {
    const [view, setView] = useState<AppView>('settings');
    const [generatedPodcast, setGeneratedPodcast] = useState<GeneratedPodcast | null>(null);
    const [allPodcasts, setAllPodcasts] = useState<GeneratedPodcast[]>([]);
    const { t, language } = useLanguage();

    useEffect(() => {
        initDB();
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const podcasts = await getAllPodcasts();
        setAllPodcasts(podcasts);
    };

    const handleGenerate = useCallback(async (settings: PodcastSettings) => {
        console.log("Generating with settings:", settings);
        setView('generating');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let transcript = '';
            let webSources: GeneratedPodcast['sources'] = [];

            if (settings.generationMode === 'script') {
                if (settings.scriptFile) {
                    if (settings.scriptFile.type.startsWith('image/')) {
                        const base64Data = await fileToBase64(settings.scriptFile);
                        const imagePart = { inlineData: { mimeType: settings.scriptFile.type, data: base64Data } };
                        const ocrPrompt = language === 'fa' ? "متن را از این تصویر استخراج کن." : "Extract the text from this image.";
                        const textPart = { text: ocrPrompt };

                        const ocrResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: { parts: [imagePart, textPart] } });
                        transcript = ocrResponse.text;
                    } else {
                        transcript = await settings.scriptFile.text();
                    }
                } else if (settings.scriptText) {
                    transcript = settings.scriptText;
                }
                if (!transcript.trim()) { throw new Error("The provided script is empty."); }
                transcript = cleanTranscript(transcript);

            } else {
                const scriptPrompt = `Generate a high-quality, engaging podcast script. Settings: Topic: "${settings.topic}", Duration: ${settings.duration} mins, Tone: ${settings.tone}, Gender: ${settings.gender}, Speed: ${settings.speed}, Language: ${language === 'fa' ? 'Persian' : 'English'}. ${settings.verbalCitation ? 'Verbally cite sources at the end.' : ''} Base content on credible sources.`;
                const scriptConfig: any = {};
                if (settings.sourceScope === 'external' || settings.sourceScope === 'both') {
                    scriptConfig.tools = [{ googleSearch: {} }];
                }
                const scriptResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: scriptPrompt, config: scriptConfig });
                transcript = cleanTranscript(scriptResponse.text);
                webSources = scriptResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web).filter(w => w?.uri && w.title).map(w => ({ title: w.title!, url: w.uri!, author: new URL(w.uri!).hostname })) || [];
            }

            const socialPrompt = `Based on this script for a podcast titled "${settings.topic}", create 3 social media posts (Instagram, Twitter/X, Telegram). Response must be a valid JSON object. Script: ${transcript.substring(0, 2000)}`;
            const socialConfig = { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { socialMediaPosts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING }, caption: { type: Type.STRING }, hashtags: { type: Type.STRING } }, required: ['platform', 'caption', 'hashtags'] } } }, required: ['socialMediaPosts'] } };
            const socialResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: socialPrompt, config: socialConfig });
            const socialPosts = JSON.parse(socialResponse.text).socialMediaPosts;

            let thumbnailDataUrls: string[] | undefined = undefined;
            if (settings.thumbnailMode === 'ai') {
                const thumbnailPrompt = `Podcast cover art for "${settings.topic}". Style: ${settings.tone}, modern, visually appealing. No text.`;
                const imageResponse = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: thumbnailPrompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' } });
                const thumbnailBase64 = imageResponse.generatedImages[0].image.imageBytes;
                thumbnailDataUrls = [`data:image/jpeg;base64,${thumbnailBase64}`];
            } else if ((settings.thumbnailMode === 'upload' || settings.thumbnailMode === 'url') && settings.customImages.length > 0) {
                thumbnailDataUrls = await Promise.all(
                    settings.customImages.map(img => applyCanvasCustomizations(img.preview, img.settings))
                );
            }

            const voiceName = settings.gender === 'female' ? 'Kore' : 'Zephyr';
            const transcriptChunks = transcript.match(/([^\.!\?]+[\.!\?]*)/g) || [];
            const audioBase64Chunks: string[] = [];
            for (const chunk of transcriptChunks) {
                if (!chunk.trim()) continue;
                const ttsPrompt = `In a ${settings.tone} tone at a ${settings.speed} pace, read: ${chunk}`;
                const audioResponse = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text: ttsPrompt }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } } });
                const audioChunkBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (audioChunkBase64) audioBase64Chunks.push(audioChunkBase64);
            }

            const settingsForDb = { ...settings };
            delete (settingsForDb as any).sourceFiles;
            delete (settingsForDb as any).scriptFile;
            delete (settingsForDb as any).scriptText;
            delete (settingsForDb as any).customImages;
            
            const finalPodcast: GeneratedPodcast = {
                id: new Date().toISOString(), settings: settingsForDb, transcript, socialPosts, sources: webSources,
                createdAt: new Date().toISOString(), thumbnailBase64s: thumbnailDataUrls, audioBase64Chunks,
            };

            await addPodcast(finalPodcast);
            await loadHistory();
            setGeneratedPodcast(finalPodcast);
            setView('results');

        } catch (error) {
            console.error("Error generating podcast:", error);
            alert("An error occurred while generating the podcast. Please check the console for details.");
            setView('settings');
        }

    }, [language]);
    
    const handleUpdateTranscript = async (id: string, newTranscript: string) => {
        await updatePodcastTranscript(id, newTranscript);
        setGeneratedPodcast(prev => prev ? { ...prev, transcript: newTranscript } : null);
        await loadHistory();
    };

    const handleBackToSettings = useCallback(() => setView('settings'), []);
    const handleViewHistory = useCallback(() => setView('history'), []);
    const handleViewConnections = useCallback(() => setView('connections'), []);
    const handleSelectPodcastFromHistory = (podcast: GeneratedPodcast) => {
        setGeneratedPodcast(podcast);
        setView('results');
    };

    const renderView = () => {
        switch (view) {
            case 'generating': return <GenerationView />;
            case 'results': return generatedPodcast && <ResultsView podcast={generatedPodcast} onBack={handleBackToSettings} onUpdateTranscript={handleUpdateTranscript} />;
            case 'history': return <HistoryView podcasts={allPodcasts} onSelectPodcast={handleSelectPodcastFromHistory} onBack={handleBackToSettings} />;
            case 'connections': return <ConnectionsView onBack={handleBackToSettings} />;
            case 'settings': default: return <SettingsForm onGenerate={handleGenerate} onViewHistory={handleViewHistory} onViewConnections={handleViewConnections} />;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden" style={{ perspective: '1000px' }}>
            {renderView()}
        </div>
    );
};

const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);

export default App;