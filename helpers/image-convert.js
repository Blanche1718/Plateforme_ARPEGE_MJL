const path = require('path');
const db = require('../models/index');
const minioTools = require('../helpers/minioFonction');

const projectRoot = path.resolve(__dirname, '../');

module.exports = async (docId) => {
    try {
        // Retrieve the document from the database
        const doc = await db.Document.findByPk(docId);
        if (!doc) {
            throw new Error('Document non trouvé pour l\'ID : ' + docId);
        }

        const filePath = doc.path;
        console.log('File path:', filePath);
        // Determine the MIME type based on the file extension
        const ext = path.extname(filePath).toLowerCase();
        let mimeType;
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
            default:
                throw new Error('Type de fichier non supporté : ' + ext);
        }

        console.log('Extension du fichier :', ext);
        console.log('Type MIME :', mimeType);
        // Read the image file using the readFile function
        const result = await minioTools.readFileToBase64(filePath, ext, mimeType); // Pass the file name directly

        if (result.status === "failure") {
            throw new Error(result.message);
        }

        console.log("result >>")

        // The content of the image is now in result.content
        // const base64Image = Buffer.from(result.content, 'binary').toString('base64');
        
        
        // Add the Base64 string to the data URI scheme
        // const base64ImageUri = `data:${mimeType};base64,${base64Image}`;
        console.log('Base64 image URI ...');

        return result.base64Uri;
    } catch (error) {
        console.error('Erreur lors de la conversion de l\'image en Base64 :', error);
        return null; // Consider returning a more descriptive error if needed
    }
};