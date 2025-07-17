const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const handlebars = require('handlebars');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');
const db = require("../models/index");

const { v4: uuidv4 } = require('uuid');
const projectRoot = path.resolve(__dirname, '../');
const moment = require('moment');
const minioClient = require('../helpers/minio');
const minioTools = require('../helpers/minioFonction');
require('moment/locale/fr');
const htmlDocx = require('html-docx-js'); // Ensure this is included



function formatFrenchDate(date) {
    const formattedDate = moment(date).locale('fr').format('dddd D MMMM YYYY');
    console.log("formattedDate: ", formattedDate);
    const reformatted = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    console.log("reformatted: ", reformatted);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}
/**
 * Génère un nom de fichier unique pour le PDF.
 * @param {string} prefix - Le préfixe à utiliser pour le nom du fichier.
 * @returns {string} - Le nom de fichier unique.
 */
function generateUniqueFilename(uniqueId, type = "pdf") {
    let prefix = 'document';
    const timestamp = Date.now(); // Obtenir le timestamp actuel en millisecondes

    // Définir l'extension en fonction du type
    const extension = type === "word" ? "docx" : "pdf";

    return `${prefix}_${timestamp}_${uniqueId}.${extension}`;
}


// Create a function to wait for 2 seconds
function waitForTwoSeconds() {
    return new Promise(resolve => setTimeout(resolve, 2000));
}

// Maintain a pool of browser instances
let browserPool = null;

const getBrowserInstance = async () => {
    if (!browserPool) {
        browserPool = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    }
    return browserPool;
};

// Fonction pour générer un PDF multipage à partir d'un template HTML
//Template HTML : Le template HTML doit contenir des balises (comme <div class="page-break"></div>) pour définir les sauts de page.

//Gestion des pages : Le code divise le template HTML en pages distinctes et ajoute chaque page au PDF.
// Définir le helper 'empty'
handlebars.registerHelper('empty', function(value) {
    return !value || value.trim() === '';
});
// Définir le helper 'not'
handlebars.registerHelper('not', function(value) {
    return !value;
  });

handlebars.registerHelper('increment', function(index) {
    return index + 1;
});

// Définir un helper pour la comparaison
handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('eq', function (arg1, arg2) {
    return arg1 === arg2;
});

handlebars.registerHelper('neq', function (arg1, arg2) {
    return arg1 !== arg2;
});

handlebars.registerHelper('add', function (a, b) {
    return a + b;
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = {
    generatePDF: async (parameters, t, typeDemande = "bulletin", useSecu = true) => {
        try {
            const uniqueId = uuidv4();
            const outputPath = path.join(projectRoot, "Files", "pdf", generateUniqueFilename(uniqueId));
            let uniqueIdentifier = null;
    
            // Définir le chemin du template selon typeDemande
            let templatePath;
            switch (typeDemande) {
                case 'bulletin_note': templatePath = "helpers/template/actes/bulletin_note.ejs"; break;
                case 'attestation_presence_poste': templatePath = "helpers/template/actes/attestation_presence_poste.ejs"; break;
                case 'attestation_service_start': templatePath = "helpers/template/actes/attestation_service_start.ejs"; break;
                default: throw new Error('Type d\'acte inconnu');
            }
            
            // Lire et compiler le template
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const template = handlebars.compile(templateSource);
            // console.log(templateSource, template)
            parameters._verificationCode = uniqueId;
            parameters._generatedAt = formatFrenchDate(new Date());
            parameters.uniqueId = uniqueId;
            let html = null;
            if(!useSecu){
                // Manipulate HTML using jsdom
                const dom = new JSDOM(templateSource);
                const document = dom.window.document;

                const qrCodeDiv = document.getElementById('qrcode');
                // console.log(qrCodeDiv)
                if (!qrCodeDiv) {
                    throw new Error("L'élément avec l'ID qrcode n'existe pas.");
                }

                const w = qrCodeDiv.dataset.w ? qrCodeDiv.dataset.w : 'auto';
                const h = qrCodeDiv.dataset.h ? qrCodeDiv.dataset.h : 'auto';
                if (qrCodeDiv) {
                    const img = document.createElement('img');
                    img.src = "data:image/png;base64,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";
                    img.alt = 'QR Code';
                    // Apply styles
                    img.style.height = h;
                    img.style.width = w;
                    img.style.objectFit = 'contain'; // Ensure the image fits within the specified width
                    console.log('Img: ', img);
                    qrCodeDiv.parentNode.replaceChild(img, qrCodeDiv);
                }
                // Obtenir le HTML avec le QR Code
                html = dom.serialize();
                html = handlebars.compile(html)(parameters);
            }else{
                html = template(parameters);
            }
            
            console.log('Template rendered..');
            console.log("Usesecu: ", useSecu)
            if (useSecu) {
                // Génération via l'URL sécurisée
                const data = new FormData();
                data.append('title', 'Permis de visite');
                data.append('description', 'Ceci est un document sécurisé.');
                data.append('file', html, {
                    filename: 'permis_de_visite.html',
                    contentType: 'text/html'
                });
                data.append('filename', 'permis_de_visite.pdf');
                data.append('registered', '' + parameters.registered);
                data.append('uniqueIdentifier', '');
                data.append('signed', '' + parameters.signed);
                data.append('isFinal', '' + parameters.isFinal);
    
                const url = process.env.DOCSECU_SIGNE_GENERATE || "http://172.17.57.110:7010/api/documents/generate-single";
                console.log('Setting formdata and URL:', url);
    
                const config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url,
                    headers: {
                        'X-Client-id': process.env.SECU_CLIENT_ID,
                        'X-Client-secret': process.env.SECU_CLIENT_SECRET,
                        ...data.getHeaders()
                    },
                    data
                };
    
                console.log('Preparing configuration...');
                const response = await axios.request(config);
                if (!(response.status >= 200 && response.status < 300)) {
                    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
                }
    
                uniqueIdentifier = response.data.results[0]['id'];
                console.log("Unique Identifier: ", uniqueIdentifier, response.data.results[0])
                const apiPdfUrl = process.env.DOCSECU_SIGNE_PREVIEW+'/'+uniqueIdentifier+'?signed=false' ||  `http://172.17.57.110:7010/api/documents/previewDocument/${uniqueIdentifier}?signed=false`;
                console.log('Downloading from secu:', apiPdfUrl);
    
                const pdfResponse = await axios.get(apiPdfUrl, {
                    responseType: 'stream',
                    headers: {
                        'X-Client-id': process.env.SECU_CLIENT_ID,
                        'X-Client-secret': process.env.SECU_CLIENT_SECRET
                    }
                });
    
                if (pdfResponse.headers['content-type'] !== 'application/pdf') {
                    throw new Error('Réponse non-PDF reçue');
                }
    
                // Sauvegarde du PDF
                const writer = fs.createWriteStream(outputPath);
                pdfResponse.data.pipe(writer);
    
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
    
                console.log('PDF téléchargé localement');
            } else {
                
                // Defining header and footer 
                // Définir les templates d'en-tête et de pied de page
                let headerTemplate = `<div style="width: 100%; text-align: center;"></div>`;
                let footerTemplate = `
                    <div style="width: 100%; text-align: center; font-size: 10px;">
                        <p>Pour verifier l\'authenticité  du document, télécharger l\'application JUSTICE.BJ dans play store ou apple store pour le scanner</p>
                        <div style="position: relative; width: 50%; display: flex; justify-content: center; margin: 0 auto; bottom: 0px;">
                            <hr style="width: 33.33%; border-top: 5px solid green; margin: 0;">
                            <hr style="width: 33.33%; border-top: 5px solid yellow; margin: 0;">
                            <hr style="width: 33.33%; border-top: 5px solid red; margin: 0;">
                        </div>
                    </div>`;
                // Lancer Puppeteer et générer le PDF
                const browser = await getBrowserInstance();
                const page = await browser.newPage();
                await page.setContent(html);
                await page.pdf({
                    path: outputPath,
                    format: 'A4',
                    displayHeaderFooter: true,
                    printBackground: true,
                    headerTemplate,
                    footerTemplate
                });
                await page.close(); 
                // Wait for two seconds before deleting the document
                //await util.waitForTwoSeconds(); // Assuming this is a utility function
                console.log('Document path: ');
                // await fs.unlink(documentPath); // Use async unlink
                console.log("HTML deleted: ");
    
            }
            await waitForTwoSeconds();
            console.log("")
            // Téléversement vers MinIO
            const bucketName = process.env.MINIO_BUCKET_NAME;
            const objectName = path.basename(outputPath);
            const stream = fs.createReadStream(outputPath);
            await minioTools.createBucketIfNotExists();
            await minioClient.putObject(bucketName, objectName, stream, fs.statSync(outputPath).size);
            console.log(`Fichier ${objectName} téléversé vers MinIO`);
    
            // Vérifier l'existence du fichier
            if (!fs.existsSync(outputPath)) {
                throw new Error(`Le fichier PDF n'a pas été créé à : ${outputPath}`);
            }
    
            const pathFile = path.basename(outputPath);
            return { pathFileLink: pathFile, t, outputPath, reference: uniqueId, uniqueIdentifier };
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            return { pathFileLink: null, t, uniqueIdentifier };
        }
    }

}
