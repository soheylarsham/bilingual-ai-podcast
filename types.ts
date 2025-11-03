export type Language = 'en' | 'fa';

export type TextEffectStyle = 'Normal' | 'Neon' | 'Gradient' | 'Glass';

export type ImageCustomizationSettings = {
    textOverlay: string;
    font: string;
    fontSize: number;
    color: string;
    effectStyle: TextEffectStyle;
};

export type CustomImage = {
    id: string;
    source: 'file' | 'url';
    value: File | string; // File object or URL string
    preview: string; // Data URL for preview
    settings: ImageCustomizationSettings;
};


export type PodcastSettings = {
    generationMode: 'topic' | 'script';
    scriptText?: string;
    scriptFile?: File;
    topic: string;
    duration: number;
    tone: string;
    gender: 'male' | 'female';
    speed: 'slow' | 'normal' | 'fast';
    outputFormat: ('audio' | 'text')[];
    sourceUrls: string[];
    sourceFiles: File[];
    sourceScope: 'internal' | 'external' | 'both';
    verbalCitation: boolean;
    backgroundMusic: boolean;
    musicStyle: string;
    thumbnailMode: 'ai' | 'upload' | 'url' | 'none';
    customImages: CustomImage[];
};

export type SocialPost = {
    platform: 'Instagram' | 'Twitter/X' | 'Telegram';
    caption: string;
    hashtags: string;
};

export type GeneratedPodcast = {
    id: string;
    settings: Omit<PodcastSettings, 'scriptFile' | 'scriptText' | 'sourceFiles' | 'customImages'>; // Files/complex objects are not stored in DB
    audioBase64Chunks: string[];
    transcript: string;
    thumbnailBase64s?: string[];
    sources: { title: string; author: string; url: string }[];
    socialPosts: SocialPost[];
    createdAt: string;
};

// --- Connection Settings ---
export type ConnectionType = 'telegram' | 'discord' | 'twitter' | 'wordpress' | 'webhook' | 'instagram';

export interface BaseConnection {
    id: ConnectionType;
    enabled: boolean;
    workerUrl: string;
    workerSecret: string;
}

export interface TelegramConnection extends BaseConnection {
    id: 'telegram';
}

export interface DiscordConnection extends BaseConnection {
    id: 'discord';
}

export interface TwitterConnection extends BaseConnection {
    id: 'twitter';
}

export interface WordPressConnection extends BaseConnection {
    id: 'wordpress';
}

export interface WebhookConnection extends BaseConnection {
    id: 'webhook';
}

export interface InstagramConnection extends Pick<BaseConnection, 'id' | 'enabled'> {
    id: 'instagram';
}


export type ConnectionSettings = TelegramConnection | DiscordConnection | TwitterConnection | WordPressConnection | WebhookConnection | InstagramConnection;
export type AllConnectionSettings = {
    [key in ConnectionType]: ConnectionSettings & { id: key };
};