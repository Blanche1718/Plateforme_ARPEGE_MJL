const Minio = require('minio');

console.log("MinIO Configuration:");
console.log("EndPoint:", process.env.MINIO_ENDPOINT);
console.log("Port:", parseInt(process.env.MINIO_PORT, 10));
console.log("Use SSL:", process.env.MINIO_USE_SSL === 'true');
console.log("Access Key:", process.env.MINIO_ACCESS_KEY);
console.log("Secret Key:", process.env.MINIO_SECRET_KEY);

// Initialiser le client MinIO
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

// Test de connexion
minioClient.listBuckets((err, buckets) => {
    if (err) {
        console.error("❌ Échec de la connexion à MinIO :", err.message);
    } else {
        console.log("✅ Connexion à MinIO réussie. Buckets disponibles :", buckets.map(b => b.name));
    }
});

module.exports = minioClient;
