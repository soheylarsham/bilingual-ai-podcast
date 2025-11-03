import type { ConnectionType, ConnectionSettings, AllConnectionSettings } from '../types';

const STORAGE_PREFIX = 'podcast_connection_';

export const saveConnectionSetting = (id: ConnectionType, settings: ConnectionSettings): void => {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(settings));
    } catch (error) {
        console.error(`Failed to save settings for ${id}:`, error);
    }
};

export const getConnectionSetting = (id: ConnectionType): ConnectionSettings | null => {
    try {
        const settingsString = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
        return settingsString ? JSON.parse(settingsString) : null;
    } catch (error) {
        console.error(`Failed to load settings for ${id}:`, error);
        return null;
    }
};


export const getAllConnectionSettings = (): Partial<AllConnectionSettings> => {
     const allSettings: Partial<AllConnectionSettings> = {};
     // FIX: Replaced 'website' with 'webhook' to match ConnectionType.
     const keys: ConnectionType[] = ['telegram', 'discord', 'instagram', 'twitter', 'webhook', 'wordpress'];
     keys.forEach(key => {
         const setting = getConnectionSetting(key);
         if (setting) {
             (allSettings as any)[key] = setting;
         }
     });
     return allSettings;
}