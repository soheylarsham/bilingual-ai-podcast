import type { GeneratedPodcast } from './types';

let db: IDBDatabase;

const DB_NAME = 'PodcastStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'podcasts';

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', request.error);
            reject('Error opening database');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
                objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                objectStore.createIndex('topic', 'settings.topic', { unique: false });
            }
        };
    });
};

export const addPodcast = async (podcast: GeneratedPodcast): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(podcast);
        
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error adding podcast:', request.error);
            reject(request.error);
        };
    });
};

export const getAllPodcasts = async (): Promise<GeneratedPodcast[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const result = request.result as GeneratedPodcast[];
            resolve(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
        request.onerror = () => {
            console.error('Error getting all podcasts:', request.error);
            reject(request.error);
        };
    });
};

export const updatePodcastTranscript = async (id: string, transcript: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const podcast = getRequest.result as GeneratedPodcast;
            if (podcast) {
                podcast.transcript = transcript;
                const putRequest = store.put(podcast);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => {
                    console.error('Error updating podcast:', putRequest.error);
                    reject(putRequest.error);
                };
            } else {
                reject('Podcast not found');
            }
        };
        getRequest.onerror = () => {
            console.error('Error getting podcast for update:', getRequest.error);
            reject(getRequest.error);
        };
    });
};
