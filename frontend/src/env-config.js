return (
    <div>
        <h3 className="mb-2 font-semibold text-gray-800">Streak</h3>
        <div className="bg-white p-3 rounded shadow">
            <div
                className="grid grid-cols-6 grid-rows-5 gap-1"
                style={{ width: 164 }} // 6 cols * 24px + 5 gaps * 4px = 164px
            >
                {last30Days.map((date) => {
                    const hours = dailyHours[date] || 0
                    const bgColor =
                        hours >= 3
                            ? 'bg-logs1'
                            : hours > 0
                                ? 'bg-logs2'
                                : 'bg-gray-200'

                    return (
                        <div
                            key={date}
                            title={`${date} — ${hours.toFixed(2)} hrs`}
                            className={`w-6 h-6 rounded-sm cursor-default ${bgColor}`}
                        />
                    )
                })}
            </div>
        </div>
    </div>
)
  
  // const isEnvInjected = import.meta.env.VITE_BACKEND_API_BASE_URL === '__VITE_BACKEND_API_BASE_URL__';

//  const envConfig = {
//     VITE_BACKEND_API_BASE_URL: isEnvInjected
//         ? '__VITE_BACKEND_API_BASE_URL__'
//         : import.meta.env.VITE_BACKEND_API_BASE_URL,

//     VITE_FIREBASE_API_KEY: isEnvInjected
//         ? '__VITE_FIREBASE_API_KEY__'
//         : import.meta.env.VITE_FIREBASE_API_KEY,

//     VITE_FIREBASE_AUTH_DOMAIN: isEnvInjected
//         ? '__VITE_FIREBASE_AUTH_DOMAIN__'
//         : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

//     VITE_FIREBASE_PROJECT_ID: isEnvInjected
//         ? '__VITE_FIREBASE_PROJECT_ID__'
//         : import.meta.env.VITE_FIREBASE_PROJECT_ID,

//     VITE_FIREBASE_STORAGE_BUCKET: isEnvInjected
//         ? '__VITE_FIREBASE_STORAGE_BUCKET__'
//         : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

//     VITE_FIREBASE_MESSAGING_SENDER_ID: isEnvInjected
//         ? '__VITE_FIREBASE_MESSAGING_SENDER_ID__'
//         : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

//     VITE_FIREBASE_APP_ID: isEnvInjected
//         ? '__VITE_FIREBASE_APP_ID__'
//         : import.meta.env.VITE_FIREBASE_APP_ID,
// };

// export default envConfig;
