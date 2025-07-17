const express = require("express");
const path = require("path");
const router = express.Router();
const csrfProtection = require('csurf')({ cookie: true });

const AuthModule = require('../middlewares/is-auth');


let routes = (app) => {
    // Middleware pour logger les requêtes
    app.use((req, res, next) => {
        console.log(`🟢 => ${req.method} ${req.originalUrl}`); // Log de la méthode et de l'URL avec émoticone
        next(); // Passe à la prochaine fonction middleware
    });
    
    
    app.get('/csrf-token', csrfProtection, (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
          httpOnly: false,
          secure: true,
          sameSite: 'strict'
        });
        res.json({ csrfToken: req.csrfToken() });
    });
      

    // Routes
    /**
     * @swagger
     * /api/health:
     *   get:
     *     summary: Health check
     *     tags: [Utils]
     *     responses:
     *       200:
     *         description: Health status
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Health OK
     */
    router.get('/api/health', (req, res) => {
        return res.json({ message: 'Health OK' });
    });

    router.get('/api/Oauth/token',  (req, res) => {
        return res.json({ message: 'Health OK' });
    });

    // Auth
    app.use('/api/admin', require('./admin'));

        // Auth
    app.use('/api/auth', require('./auth'));

    // Agent
    app.use('/api/agent', require('./user'));

    // Utils
    app.use('/api/utils', require('./utils'));

    
    /*  404 */
    // The 404 Route (ALWAYS Keep this as the last route)
    router.get('*', function(req, res) {
        res.status(404).send("Page not Found");
    });

    router.post('*', function(req, res) {
        res.status(404).send("Page not Found");
    });

    router.put('*', function(req, res) {
        res.status(404).send("Page not Found");
    });

    router.delete('*', function(req, res) {
        res.status(404).send("Page not Found");
    });

    /* ROUTES TO APP */
    return app.use("/", router);
};



module.exports = routes;