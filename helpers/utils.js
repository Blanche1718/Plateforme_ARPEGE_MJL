const { v4: uuidv4 } = require('uuid');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require("crypto");
const forge = require('node-forge');
const bcrypt = require('bcryptjs');
const db = require('../models/index');
const TaskScheduler = require('../helpers/taskScheduler');
const minioTools = require('../helpers/minioFonction')
const User = db.User;


async function deconUser(id) {
    console.log("Deactivating user with ID: ", id);
  
    // Requesting a user by their ID, including the "Role" relationship
    try {
        let user = await User.findByPk(id);
        console.log("User found: ", user);

        if (user) {
            user.actif = false;
            user.currentToken = "";
            console.log("Deactivating user...");

            const saveResult = await user.save();
            console.log("User save result: ", saveResult);

            if (!saveResult) {
                console.log("Failed to save user changes.");
                return 2; // Indicating failure
            }
            console.log("User successfully deactivated.");
            return 0; // Indicating success
        } else {
            console.log("No user found with the provided ID.");
            return 0; // User not found
        }   
    } catch (error) {
        console.error("Error in deconUser: ", error);
        return 2; // Indicating error
    }
}

const myModule  = {
    convertToDate: (dateString) =>  {
        const dateParts = dateString.split('/');
        // Vérifiez si le tableau a exactement 3 parties
        if (dateParts.length !== 3) {
            throw new Error('Format de date invalide, veuillez utiliser DD/MM/YYYY');
        }
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        // Créez une date au format ISO
        const isoDateString = `${year}-${month}-${day}T00:00:00Z`;
        return isoDateString;
    },
    signToken: (id) => {
        let payload = {
            user: {
                _id: id
            }
        };
        let options = {
            expiresIn: '2h', // Expiration courte pour l'access token
            algorithm: 'RS256'
        };
        try {
            let privateKey = fs.readFileSync(path.join(global.projectRoot, 'keys', 'private_key.pem'), 'utf8');
            return jwt.sign(payload, privateKey, options);
        } catch (error) {
            console.log(error);
            return 0;
        }
    },
    // Fonction pour générer un refresh token (période plus longue)
    signRefreshToken: (id) => {
        let payload = {
            user: {
                _id: id
            }
        };
        let options = {
            expiresIn: '2h', // Expiration longue pour le refresh token
            algorithm: 'RS256'
        };
        try {
            let privateKey = fs.readFileSync(path.join(global.projectRoot, 'keys', 'private_key.pem'), 'utf8');
            return jwt.sign(payload, privateKey, options);
        } catch (error) {
            console.log(error);
            return 0;
        }
    },
    // Fonction pour vérifier un access token
    verifyToken: (token) => {
        let options = {
            expiresIn: '2h', // Expiration courte pour l'access token
            algorithm: 'RS256'
        };
        try {
            let publicKey = fs.readFileSync(path.join(global.projectRoot, 'keys', 'public_key.pem'), 'utf8');
            return jwt.verify(token, publicKey, options);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { expired: true, message: 'Access token has expired' };
            }
            console.log(error);
            return 0;
        }
    },
    // Fonction pour vérifier un refresh token et générer un nouveau access token si valide
    verifyRefreshToken: (refreshToken) => {
        let options = {
            expiresIn: '7d', // Expiration longue pour le refresh token
            algorithm: 'RS256'
        };
        try {
            let publicKey = fs.readFileSync(path.join(global.projectRoot, 'keys', 'public_key.pem'), 'utf8');
            let decoded = jwt.verify(refreshToken, publicKey, options);

            // Si le refresh token est valide, générer un nouveau access token
            return tokenService.signToken(decoded.user._id);
        } catch (error) {
            console.log('Invalid refresh token:', error);
            return 0;
        }
    },
    refreshToken: (refreshToken) => {
        try {
            console.log("Tentative de vérification du refresh token...");
    
            // Vérifier si le refreshToken est valide
            let publicKey = fs.readFileSync(path.join(global.projectRoot, 'keys', 'public_key.pem'), 'utf8');
            const decoded = jwt.verify(refreshToken, publicKey, { algorithm: 'RS256' });
            console.log("Refresh token validé avec succès. Décodé :", decoded);
            console.log(this);
    
            // Si valide, générer un nouveau token d'accès
            const newAccessToken = myModule.signToken(decoded.user._id);
            console.log("Nouveau token d'accès généré :", newAccessToken);
    
            // Générer également un nouveau refreshToken (optionnel)
            const newRefreshToken = myModule.signRefreshToken(decoded.user._id);
            console.log("Nouveau refresh token généré :", newRefreshToken);
    
            // Retourner les nouveaux tokens
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            console.log('Erreur lors de la vérification du refresh token:', error.message);
            return null; // Retourne null si le refresh token est invalide
        }
    },
    formatString: (input, params) => {
      let options = {}; 
      console.log("params: ", params, 'input', input);
      if (params != null) {
          options =  params;
      }
      let formatted = input;

        // Convert to uppercase
        if (options.uppercase) {
            formatted = formatted.toUpperCase();
        }
    
        // Convert to lowercase
        if (options.lowercase) {
            formatted = formatted.toLowerCase();
        }
    
        // Trim spaces
        if (options.trim) {
            formatted = formatted.trim();
        }
    
        // Replace spaces with another character if specified
        if (options.replaceSpaces) {
            formatted = formatted.replace(/\s+/g, options.replaceSpacesWith || '');
        }
    
        // Remove non-alphanumeric characters
        if (options.alphanumericOnly) {
            formatted = formatted.replace(/[^a-z0-9]/gi, '');
        }
        //console.log("Show:",formatted,options.removeAccent)
        // Remove accent
        if (options.removeAccent) {
          formatted = formatted.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        //console.log(formatted)
    
        if (options.lowercase &&  typeof(formatted) === 'string') {
          formatted = formatted.toLowerCase();
        }

        if (options.firstCapital &&  typeof(formatted) === 'string') {
          formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
        }

        if(options.everyFirstLetter)
        {
          formatted = formatted.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }).join(' ');
        }
        
        return formatted;
        
    },
    // Fonction pour savoir si un nombre est pair
    isEven: (num) => {
        if ((num % 2) == 0) return true;
        return false;
    },
    getFilteredAttributes: (model, exclude) => {
      const attributes = model.rawAttributes;
      //console.log('Attributes:',attributes)
      const filteredAttributes = {};
    
      for (const key in attributes) {
        if (attributes.hasOwnProperty(key) && !exclude.includes(key)) {
          filteredAttributes[key] = attributes[key];
        }
      }
    
      return filteredAttributes;
    },
    getStatus: (user) => {
        let status = "";
        if(user.disabled){
            status = "Bloqué";
        }else{
            // if (user.actif) {
            //     status = "Actif";
            // }else{
            //     status = "Non Actif";
            // }
            status = "Actif";
        }
        return status;
    },
    entite_cities: ()  => [
        { code: 'APB', city: 'Cotonou' },
        { code: 'EFPJ', city: 'Cotonou' },
        { code: 'ANEPIJ', city: 'Cotonou' },
        { code: 'CNCJ', city: 'Cotonou' },
        { code: 'ANRACS', city: 'Cotonou' },
        { code: 'CDSP', city: 'Cotonou' },
        { code: 'BCEJ', city: 'Cotonou' },
        { code: 'CDIJ', city: 'Cotonou' },
        { code: 'DACS', city: 'Cotonou' },
        { code: 'DSPJ', city: 'Cotonou' },
        { code: 'DLC', city: 'Cotonou' },
        { code: 'DDH', city: 'Cotonou' },
        { code: 'DPJJE', city: 'Cotonou' },
        { code: 'AJE', city: 'Cotonou' },
        { code: 'DAPG', city: 'Cotonou' },
        { code: 'DRIPDS', city: 'Cotonou' },
        { code: 'DPAF', city: 'Cotonou' },
        { code: 'DSI', city: 'Cotonou' },
        { code: 'CCMP', city: 'Cotonou' },
        { code: 'CJ', city: 'Cotonou' },
        { code: 'SGM', city: 'Cotonou' },
        { code: 'CM', city: 'Cotonou' },
        { code: 'PRM', city: 'Cotonou' },
        { code: 'CA-COT', city: 'Cotonou' },
        { code: 'CA-ABO', city: 'Abomey' },
        { code: 'CA-PAR', city: 'Parakou' },
        { code: 'TC-COT', city: 'Cotonou' },
        { code: 'CAC-POR', city: 'Porto-Novo' },
        { code: 'CRIET', city: 'Cotonou' },
        { code: 'CSAF', city: 'Cotonou' },
        { code: 'TPI-COT', city: 'Cotonou' },
        { code: 'TPI-PAR', city: 'Parakou' },
        { code: 'TPI-POR', city: 'Porto-Novo' },
        { code: 'TPI-ABO', city: 'Abomey' },
        { code: 'TPI-CAL', city: 'Abomey-Calavi' },
        { code: 'TPI-OUI', city: 'Ouidah' },
        { code: 'TPI-NAT', city: 'Natitingou' },
        { code: 'TPI-DJO', city: 'Djougou' },
        { code: 'TPI-MAL', city: 'Malanville' },
        { code: 'TPI-KAN', city: 'Kandi' },
        { code: 'TPI-DAS', city: 'Dassa-Zoumè' },
        { code: 'TPI-SAV', city: 'Savalou' },
        { code: 'TPI-LOK', city: 'Lokossa' },
        { code: 'TPI-APL', city: 'Aplahoué' },
        { code: 'TPI-COM', city: 'Comè' },
        { code: 'TPI-POB', city: 'Pobè' },
        { code: 'TPI-ALL', city: 'Allada' }
    ],
    expired: async (token) => {
        // Verify and decode the token
        const decodedToken = jwt.decode(token, { complete: true });
        // Check if the token has an 'exp' claim
        if (decodedToken && decodedToken.payload.exp) {
            // Get the current time in seconds (UNIX timestamp)
            const currentTime = Math.floor(Date.now() / 1000);

            // Compare the 'exp' claim with the current time
            if (decodedToken.payload.exp <= currentTime) {
                //console.log('Token has expired');
                //console.log('ID of User if exist: ',decodedToken.payload.user._id)
                const ret = await deconUser(decodedToken.payload.user?._id)
                //console.log(ret)
                if(ret == 2) return null;
                return true;
            } else {
                //console.log('Token is still valid');
                return false;
            }
        } else {
            //console.log('Token does not have an expiration claim (exp)');
            return null;
        }

    },
    isTokenExpiringSoon: async (token, thresholdInMinutes = 20) => {
        console.log("Checking if token is expiring soon...");
        
        // Verify and decode the token
        const decodedToken = jwt.decode(token, { complete: true });
        console.log("Decoded token: ", decodedToken);
    
        // Check if the token has an 'exp' claim
        if (decodedToken && decodedToken.payload.exp) {
            console.log("Token has 'exp' claim. Expiration time: ", decodedToken.payload.exp);
            
            // Get the current time in seconds (UNIX timestamp)
            const currentTime = Math.floor(Date.now() / 1000);
            console.log("Current time in seconds: ", currentTime);
            
            // Check how soon the token will expire (threshold in seconds)
            const thresholdInSeconds = thresholdInMinutes * 60;
            const timeToExpire = decodedToken.payload.exp - currentTime;
            console.log("Time until token expires (in seconds): ", timeToExpire);
    
            // If the token will expire within the threshold
            if (timeToExpire <= thresholdInSeconds) {
                console.log("Token is expiring soon (within threshold of " + thresholdInMinutes + " minutes).");
    
                // If the token has already expired, execute the logic of your existing expired() function
                if (timeToExpire <= 0) {
                    console.log("Token has already expired. Executing deconUser...");
                    const ret = await deconUser(decodedToken.payload.user._id);
                    console.log("Result of deconUser: ", ret);
                    if (ret == 2) return null;
                }
                return true;  // Token is close to expiring
            } else {
                console.log("Token is still valid and not expiring soon.");
                return false;  // Token is still valid
            }
        } else {
            console.log("Token does not have an 'exp' claim.");
            // If the token does not have an 'exp' claim
            return null;
        }
    }, 
    identifiant: async () => {
        const n = crypto.randomInt(0, 9999999);
        const timestamp = Date.now(); // Utilise le timestamp
        const salt = await bcrypt.genSalt(12);
        const identifiantHaché = await bcrypt.hash(`${n}-${timestamp}`, salt);
        return identifiantHaché;
    },
    isGouvOrJusticeMail: (email) => {
        // Expression régulière pour vérifier que l'email se termine par "@gouv.bj" ou "@justice.bj"
        const gouvJusticeBjRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?(gouv|justice)\.bj$/;
        return gouvJusticeBjRegex.test(email);
    },
    isGouvMail: (email) => {
        // Vérifie si l'e-mail se termine strictement par "@gouv.bj"
        const gouvBjRegex = /^[a-zA-Z0-9._%+-]+@gouv\.bj$/;
        return gouvBjRegex.test(email);
    },
    isValidMail: (email)  => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    // Fonction pour vérifier le format UUID
    isValidUUID: (id) => {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return uuidRegex.test(id);
    },
    generateCode: (lenght = 10) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomChars = '';
    
        // Generate 10 random alphanumeric characters
        for (let i = 0; i < lenght; i++) {
            randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    
        const year = '2025';
        return `${randomChars}-${year}`;
    },
    generateUniqueNumero: async (model, colonne, len, code = "") => {
        let numero;
        let isUnique = false;
    
        while (!isUnique) {
            numero = myModule.generateCode(len); // Generate the code with specified length
    
            // Check if the number already exists in the database
            const existingOrg = await model.findOne({ where: { [colonne]: numero } });
            isUnique = !existingOrg; // If no existing organization is found, the number is unique
        }
    
        return code + numero;
    },
    // Fonction pour obtenir le nom complet jusqu'à "Département"
    getFullNameUntilDepartment: async (locality) => {
        let current = locality;
        let fullName = current.name; // Commence avec le nom de la localité
        console.log('In Locality')
        while (current && current.parent) {
            const parent = await db.Locality.findOne({
                where: { id: current.parent.id },
                include: [
                    {
                        model: db.Locality,
                        as: 'parent',
                        include: [
                            {
                                model: db.Locality,
                                as: 'parent',
                                include: [
                                    {
                                        model: db.Locality,
                                        as: 'parent',
                                        include: [
                                            {
                                                model: db.LocalityLevel,
                                                as: 'level'
                                            }
                                        ]
                                    },
                                    {
                                        model: db.LocalityLevel,
                                        as: 'level'
                                    }
                                ]
                            },
                            {
                                model: db.LocalityLevel,
                                as: 'level'
                            }
                        ]
                    },
                    {
                        model: db.LocalityLevel,
                        as: 'level'
                    }
                ]
            });
    
            if (parent) {
                fullName = `${fullName} - ${parent.name}`; // Concatène le nom du parent
                if (parent.level && parent.level.code  === 'ADMIN') {
                    break; // Arrête si on atteint le niveau "Département"
                }
                current = parent; // Continue à remonter
            } else {
                break; // Si pas de parent, arrête
            }
        }
    
        return fullName;
    },

    juridictionCodes: () => {
        return [
            'CA-COT', 'CA-ABO', 'CA-PAR', 'TC-COT', 'CAC-POR',
            'CRIET', 'CSAF', 'TPI-COT', 'TPI-PAR', 'TPI-POR',
            'TPI-ABO', 'TPI-CAL', 'TPI-OUI', 'TPI-NAT', 'TPI-DJO',
            'TPI-MAL', 'TPI-KAN', 'TPI-DAS', 'TPI-SAV', 'TPI-LOK',
            'TPI-APL', 'TPI-COM', 'TPI-POB', 'TPI-ALL'
        ]
    },
    getPublicKey: (jwks, kid) => {
        const key = jwks.find(k => k.kid === kid);
        if (!key) {
          throw new Error('Public key not found for kid: ' + kid);
        }
        console.log("key:", key);
        // Convertir n et e en base64url
        const modulus = Buffer.from(key.n, 'base64url');
        const exponent = Buffer.from(key.e, 'base64url');
      
        // Utilisation de forge pour créer la clé publique
        const publicKey = forge.pki.setRsaPublicKey(
          new forge.jsbn.BigInteger(modulus.toString('hex'), 16),
          new forge.jsbn.BigInteger(exponent.toString('hex'), 16)
        );
      
        return forge.pki.publicKeyToPem(publicKey);
      },
    formatDate: (dateString) => {
        const date = new Date(dateString);
        
        // Options pour le formatage
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        // Formater la date selon la locale française
        return date.toLocaleDateString('fr-FR', options);
    },
    formatDateDirect: (dateString) => {
        
        // Options pour le formatage
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        // Formater la date selon la locale française
        return dateString.toLocaleDateString('fr-FR', options);
    },
    generateRandomString: (size) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';
        
        // Générer une chaîne alphanumérique de longueur spécifiée
        for (let i = 0; i < size; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            randomString += chars[randomIndex];
        }
    
        // Affichage pour vérification dans la console
        console.log("Random string: ", randomString), size;
        
        return randomString; // Retourne une chaîne de taille 'size'
    },
    generateOTP:  () => {
        try {
            return Math.floor(100000 + Math.random() * 900000).toString();
        } catch (error) {
            console.error('Error generating OTP:', error);
            throw error;
        }
    },
    generateAndStoreLoginCode: async (email) => {
        try {
            // Create the option
            const code = myModule.generateRandomString(16)  +'-' + uuidv4()
            const secret = myModule.generateRandomString(16) +'-' + uuidv4()
            await db.LoginCode.create({ code, email, secret});
            return code;
        } catch (error) {
            console.error('Error generating and storing option:', error);
            throw error;
        }
    },
    generateAndStoreOTP: async (email) => {
        try {
            // Create the option
            const code = myModule.generateOTP()
            const secret = myModule.generateRandomString(16) +'-' + uuidv4()
            await db.CodeOTP.create({ code, email, secret });
            TaskScheduler.addJob('Delete Code Otp', 'delete_code_otp', new Date(Date.now() + (5 * 60 * 1000)));
            return code;
        } catch (error) {
            console.error('Error generating and storing option:', error);
            throw error;
        }
    },
    deletePieces: async (pieces) => {
        for (const piece of pieces) {
            if(piece.id){
                const pieceCreated = await db.Document.findOne({
                    where: { 
                        id: piece.id
                    }
                });
                if (pieceCreated && !pieceCreated.organisationId && !pieceCreated.typeDocumentId) {
                    await minioTools.deleteDocument(pieceCreated.id);
                }
            }
        }
    }
}


module.exports = myModule;