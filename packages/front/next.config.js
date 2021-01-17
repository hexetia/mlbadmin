module.exports = {
    async rewrites() {
        return [
            {
                source: '/__/firebase/8.2.3/firebase-app.js',
                destination: 'http://localhost:5000/__/firebase/8.2.3/firebase-app.js', // Proxy to Backend
            },
            {
                source: '/__/firebase/8.2.3/firebase-auth.js',
                destination: 'http://localhost:5000/__/firebase/8.2.3/firebase-auth.js', // Proxy to Backend
            },
            {
                source: '/__/firebase/8.2.3/firebase-firestore.js',
                destination: 'http://localhost:5000/__/firebase/8.2.3/firebase-firestore.js', // Proxy to Backend
            },
            {
                source: '/__/firebase/8.2.3/firebase-functions.js',
                destination: 'http://localhost:5000/__/firebase/8.2.3/firebase-functions.js', // Proxy to Backend
            },
            {
                source: '/__/firebase/8.2.3/firebase-storage.js',
                destination: 'http://localhost:5000/__/firebase/8.2.3/firebase-storage.js', // Proxy to Backend
            },
            {
                source: '/__/firebase/init.js',
                destination: 'http://localhost:5000/__/firebase/init.js', // Proxy to Backend
            },
            // {
            //     source: '/__/firebase/:path',
            //     destination: 'http://localhost:5000/__/firebase/:path', // Proxy to Backend
            // },
        ];
    },
};
