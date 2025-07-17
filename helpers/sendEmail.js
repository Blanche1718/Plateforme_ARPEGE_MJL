const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const { dotenvx } = require('@dotenvx/dotenvx');
// Import external template configurations
const EMAIL_TEMPLATES = require('../config/emailTemplates');

// Cache for compiled templates
const templateCache = new Map();

const emailService = {
    // Initialize transport
    transport: null,

    // async init() {
    //     try {
    //         this.transport = nodemailer.createTransport({
    //             host: process.env.MAIL_HOST,
    //             port: parseInt(process.env.MAIL_PORT),
    //             secure: process.env.MAIL_PORT === '465',
    //             auth: {
    //                 user: process.env.MAIL_USERNAME,
    //                 pass: process.env.MAIL_PASSWORD
    //             },
    //             pool: true,
    //             maxConnections: 5
    //         });

    //         // Verify transport
    //         await this.transport.verify();
    //         console.log('Email transport initialized successfully');
    //     } catch (error) {
    //         console.error('Failed to initialize email transport:', error.message);
    //         throw error;
    //     }
    // },

    async sendMail({ to, type, parameters = {}, attachments = [], customSubject = null }) {
        try {
            // Validate inputs
            if (!to || !type) {
                throw new Error('Missing required parameters: to and type');
            }

            // Get template configuration
            const templateConfig = EMAIL_TEMPLATES[type];
            if (!templateConfig) {
                return { error: true, message: `Unknown template type: ${type}` };
            }

            // Get or compile template
            let template = templateCache.get(type);
            if (!template) {
                const templatePath = path.join(__dirname, '..', templateConfig.path);
                const templateSource = await fs.readFile(templatePath, 'utf8');
                template = handlebars.compile(templateSource);
                templateCache.set(type, template);
            }

            // Prepare mail options
            const mailOptions = {
                from: {
                    name: process.env.MAIL_FROM_NAME,
                    address: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME
                },
                replyTo: process.env.MAIL_REPLYTO,
                to,
                subject: customSubject || templateConfig.subject,
                html: template(parameters)
            };

            // Add attachments if provided
            if (attachments.length > 0) {
                mailOptions.attachments = attachments;
            }

            // Send email
            const info = await this.transport.sendMail(mailOptions);
            console.log(`Email sent successfully: ${info.messageId}`);
            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };

        } catch (error) {
            console.error(`Error sending email: ${error.message}`);
            return {
                error: true,
                message: error.message
            };
        }
    },

    
};

// Initialize the service
// emailService.init().catch(error => {
//     console.error('Email service initialization failed:', error);
//     process.exit(1);
// });

module.exports = emailService;