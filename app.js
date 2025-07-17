const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const { sequelize } = require('./models');
const initRoutes = require('./routes/web');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./models/index');
const { Op } = require('sequelize');
const session = require('express-session');
const { exit } = require('process');
const memoryStore = new session.MemoryStore();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const TaskScheduler = require('./helpers/taskScheduler');



// Configuration  ENV
dotenv.config();

// Directory root
global.projectRoot = __dirname;



// Start the app
let  app = express();

// Variables et constantes 
const port = process.env.SERVER_PORT || 5090;
console.log("Port de connexion: ", port)
// Middleware
// app.use(morgan('dev')); // Logging requests
app.use(cors()); // Enable CORS
//app.use(helmet()); // Secure HTTP headers
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })) // Body Parsing for POST or PUT or others Request with Body
app.use(cookieParser()); // Parsing cookies

// Loging
// morgan.token("host", function(req, res) {  // Logging
//     return req.headers['host']
// })
// morgan.token("custom", "HOST => :host, Version => :http-version,  (:method) :url , Status :status Content-lengh :res[content-length] - Temps de réponse :response-time ms")
// if(process.env.NODE_ENV == "production") {
//     //use the new format by name
//     let accessLogStream = fs.createWriteStream(__dirname + '/logs/' + "access.log", {flags: 'a'});
//     app.use(morgan("custom",{stream: accessLogStream}));
// }
//  else {
//     app.use(morgan("dev")); //log to console on development
// }

TaskScheduler.scheduleJobs();

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));



// Swagger
// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API Documentation',
        },
        servers: [
            {
                url: process.env.APP_URL,
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentication endpoints',
            },
            {
                name: 'Agent Profile',
                description: 'Profile update agent endpoints',
            },
            {
                name: 'Bulletin',
                description: 'Bulletin and its evaluation endpoints',
            },
            {
                name: 'Attestation Presence',
                description: 'Attestation de présence au poste',
            },
            {
                name: 'Attestation de Prise de service',
                description: 'Attestation de Prise de service',
            },
            {
                name: 'Performances',
                description: 'Performances des agents',
            },
            {
                name: 'Collaborators Evaluations',
                description: 'Collaborators evaluations',
            },
            {
                name: 'Utils',
                description: 'Utility endpoints like health checks',
            },
            {
                name: 'Admin',
                description: 'Profile Admin',
            },
            
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',  // Optional, specify the format if needed
                },
            },
        },
    },
    apis: ['./routes/*.js', './routes/user/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/* Routes */
console.log('Setting Routes')
initRoutes(app);



/****   Sync DB Model   *****/ 
const removeIndexesWithColumnsForTable = async (tableName) => {
    const query = `
        SELECT 
            indexname, 
            indexdef 
        FROM 
            pg_indexes 
        WHERE 
            tablename =  :tableName
    `;

    try {
        const results = await db.sequelize.query(query, {
            replacements: { tableName },
            type: db.Sequelize.QueryTypes.SELECT
        });

        let duplicates = [];

        let indexesname = [];

        let tmp = [];

        for (const index of results) {
            const baseIndexName = index.indexname.split('_key')[0];

            if (tmp.includes(baseIndexName)) {
                duplicates.push(index.indexname);
                 indexesname.push(index.indexname);
            } else {
                tmp.push(baseIndexName);
                indexesname.push(index.indexname);
            }
        }


        console.log('Doublons:',tmp,  duplicates, indexesname);
        // Parcour duplicates et garde les index qui sont dans indexesname puis supprimer les autres
        for (const duplicate of duplicates) {
            console.log("Dans le form", duplicate, indexesname);
            if (indexesname.includes(duplicate)) {
                console.log("Suppression de l'index", duplicate);
                await db.sequelize.query(`
                    ALTER TABLE "${tableName}" DROP CONSTRAINT "${duplicate}";
                `);
            }
        }



        return results;
    } catch (error) {
        console.error('Erreur lors de la récupération des index et colonnes :', error);
        throw error;
    }
};

const removeDuplicatesFromAllTables = async () => {
    console.log("Suppression des doublons...");
    const modelNames = Object.keys(db.sequelize.models);

    for (const modelName of modelNames) {
        const model = db.sequelize.models[modelName];
        const tableName = model.getTableName(); // Récupère le nom de la table

        console.log("Traitement de la table : ", tableName);
        await removeIndexesWithColumnsForTable(tableName);
    }

    console.log("Suppression des doublons terminée");
};

(async ()=> {

    // Alter database
    //      &&
    //Import the seeder file


    
    // await db.sequelize.sync({logging: console.log, alter: true  });
    // await removeDuplicatesFromAllTables();
    // require('./db/seedDatabase');


    // Supprimer les index doublons de toutes les tables
    

    // Production
    // await db.sequelize.sync({logging: console.log, force: true  });
    // require('./db/seedDatabase');


})();





// // Start server
if (process.env.NODE_ENV != "production") {
    app.listen(port, function(err){
        if (err) console.log("Error HTTP listening on Port", port);
        console.log("Server HTTP listening on Port", port);
    });

}else{
    const sslServer = https.createServer({
        key: fs.readFileSync(path.join(__dirname,'/certs','privkey.pem')),
        cert: fs.readFileSync(path.join(__dirname,'/certs','fullchain.pem'))
    },app);
    
    sslServer.listen(port,() => console.log('Server HTTPS listening on '+ port))
    console.log("Serveur en écoute....")
}


module.exports =  app;








