/// <reference types="vite/client" />

interface Config {
    apiUrl: string;
    firebase: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
}

const getEnv = (key: string, defaultValue: string = ""): string => {
    // @ts-ignore
    if (window.env && window.env[key]) {
        // @ts-ignore
        return window.env[key];
    }
    return import.meta.env[key] || defaultValue;
};

export const config: Config = {
    apiUrl: getEnv("VITE_API_URL"),
    firebase: {
        apiKey: getEnv("VITE_FIREBASE_API_KEY"),
        authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
        projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
        storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
        messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
        appId: getEnv("VITE_FIREBASE_APP_ID"),
    },
};
