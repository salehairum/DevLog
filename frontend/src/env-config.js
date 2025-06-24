// const envConfig = {
//     VITE_BACKEND_API_BASE_URL: '__VITE_BACKEND_API_BASE_URL__',
//     VITE_FIREBASE_API_KEY: '__VITE_FIREBASE_API_KEY__',
//     VITE_FIREBASE_AUTH_DOMAIN: '__VITE_FIREBASE_AUTH_DOMAIN__',
//     VITE_FIREBASE_PROJECT_ID: '__VITE_FIREBASE_PROJECT_ID__',
//     VITE_FIREBASE_STORAGE_BUCKET: '__VITE_FIREBASE_STORAGE_BUCKET__',
//     VITE_FIREBASE_MESSAGING_SENDER_ID: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
//     VITE_FIREBASE_APP_ID: '__VITE_FIREBASE_APP_ID__',
// };

// export default envConfig;

// const isEnvInjected = import.meta.env.VITE_BACKEND_API_BASE_URL === '__VITE_BACKEND_API_BASE_URL__';
const isEnvInjected = typeof __VITE_BACKEND_API_BASE_URL__ !== 'undefined';

 const envConfig = {
    VITE_BACKEND_API_BASE_URL: isEnvInjected
        ? '__VITE_BACKEND_API_BASE_URL__'
        : import.meta.env.VITE_BACKEND_API_BASE_URL,

    VITE_FIREBASE_API_KEY: isEnvInjected
        ? '__VITE_FIREBASE_API_KEY__'
        : import.meta.env.VITE_FIREBASE_API_KEY,

    VITE_FIREBASE_AUTH_DOMAIN: isEnvInjected
        ? '__VITE_FIREBASE_AUTH_DOMAIN__'
        : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

    VITE_FIREBASE_PROJECT_ID: isEnvInjected
        ? '__VITE_FIREBASE_PROJECT_ID__'
        : import.meta.env.VITE_FIREBASE_PROJECT_ID,

    VITE_FIREBASE_STORAGE_BUCKET: isEnvInjected
        ? '__VITE_FIREBASE_STORAGE_BUCKET__'
        : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

    VITE_FIREBASE_MESSAGING_SENDER_ID: isEnvInjected
        ? '__VITE_FIREBASE_MESSAGING_SENDER_ID__'
        : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

    VITE_FIREBASE_APP_ID: isEnvInjected
        ? '__VITE_FIREBASE_APP_ID__'
        : import.meta.env.VITE_FIREBASE_APP_ID,
};

export default envConfig;
