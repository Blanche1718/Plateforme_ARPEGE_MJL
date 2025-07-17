const db = require("../models/index");
const bodyCheck = require('../helpers/bodyCheck')
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sendEmail = require("../helpers/sendEmail");
const utils = require('../helpers/utils');
const { Op, Sequelize } = require('sequelize');
const path = require('path');
const User = db.User;
const Role = db.Role;
const ValidToken = db.ValidToken;

const projectRoot = path.resolve(__dirname, '../');

const registerUser = async (req, res) => {
    console.log("In registering: ", req.body);
    let transaction = null;
    try {
        transaction = await db.sequelize.transaction();

        const bodyIsOk = await bodyCheck.registerBodyCheck(req.body);
        if (!bodyIsOk) {
            return res.status(400).json({ status: "failure", message: "Vérifiez vos champs et réessayez." });
        }

        let { nom, prenoms, email, password, password_confirmation, telephone, roleId } = req.body;
        // if (password != password_confirmation) {
        //     return res.status(400).json({ status: "failure", message: "Veuillez vérifier les champs de mot de passe." });
        // }

        if (!password) password = process.env.DEFAULT_PASSWD;

        const role = await Role.findOne({ where: { id: roleId }, transaction });
        if (!role) {
            return res.status(400).json({ status: "failure", message: "Rôle non valide." });
        }

        const existingUser = await User.findOne({ where: { email }, transaction });
        if (existingUser) {
            return res.status(400).json({ status: "failure", message: "Email déjà utilisé." });
        }

        const saltPass = await bcrypt.genSalt(12);
        const hashPwd = await bcrypt.hash(password, saltPass);

        const newUser = await User.create({
            nom,
            prenoms,
            email,
            password: hashPwd,
            tel: telephone
        }, { transaction });

        await newUser.setRole(role, { transaction });
        await role.addUsers(newUser, { transaction });

        // Envoi de l'email de confirmation
        const params = {
            name: `${newUser.prenoms} ${newUser.nom}`,
            username: newUser.email,
            password,
            url: `${process.env.APP_URL}/login`
        };

        const emailResult = await sendEmail.sendMail({
            to: newUser.email,
            type: "register",
            parameters: params,
            customSubject: "Finalisation de l'inscription"
        });

        if (emailResult.error) {
            console.warn("L'utilisateur a été créé, mais l'email n'a pas pu être envoyé:", emailResult.message);
        }

        await transaction.commit();

        return res.status(200).json({ status: "success", id: newUser.id, user: newUser });

    } catch (error) {
        console.error('Erreur lors de l’enregistrement de l’utilisateur : ', error);
        if (transaction) await transaction.rollback();
        return res.status(500).json({ status: "failure", message: "Un problème interne. Veuillez patienter." });
    }
};

const loginLogic = async (email, password) => {
    const t = await db.sequelize.transaction(); // Commence une transaction

    try {
        console.log("Getting User: ", email);
        let user = await User.findOne({
            where: { email, disabled: false },
            include: [
                { model: Role, as: 'role' }
            ],
            transaction: t
        });

        if (!user) {
            console.log("User not found or disabled");
            await t.rollback();
            return { status: "failure", message: "Nom d'utilisateur incorrect ou utilisateur désactivé." };
        }

        const nb_con = await ValidToken.count({
            include: {
                model: User,
                as: 'tokenUser',
                where: { id: user.id }
            },
            transaction: t
        });

        console.log('Connexion: n', nb_con);
        if (nb_con > 100) {
            await t.rollback();
            return { status: "failure", message: "Vous avez beaucoup de comptes actifs, déconnectez-vous de l'un." };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Wrong password");
            await t.rollback();
            return { status: "failure", message: "Nom d'utilisateur ou mot de passe incorrect." };
        }

        console.log(user.id);
        const jwtToken = utils.signToken(user.id);
        const refreshToken = utils.signRefreshToken(user.id);

        if (!jwtToken) {
            await t.rollback();
            return { status: "failure", message: "Une erreur s'est produite." };
        }

        user.derniere_connexion = new Date();

        const validToken = await ValidToken.create({ token: jwtToken }, { transaction: t });
        if (!validToken) {
            await t.rollback();
            return { status: "failure", message: "Un problème interne. Veuillez patienter." };
        }

        await validToken.setTokenUser(user, { transaction: t });
        await user.addTokens(validToken, { transaction: t });

        const savedUser = await user.save({ transaction: t });
        if (!savedUser) {
            await t.rollback();
            return { status: "failure", message: "Un problème interne. Veuillez patienter." };
        }

        await t.commit(); // Tout est bon, on valide la transaction

        const status = utils.getStatus(user);
        const userToSend = {
            refreshToken,
            user: {
                id: user.id,
                nom: user.nom,
                prenoms: user.prenoms,
                email: user.email,
                tel: user.tel,
                first_connect: user.first_connect,
                derniere_connexion: user.derniere_connexion,
                status: status,
                role: user.role.label,
                organisation: user.organisation
            }
        };

        console.log('Before returning');
        return { status: "success", token: jwtToken, userToSend };

    } catch (error) {
        console.error(error);
        await t.rollback(); // Problème => rollback
        return { status: "failure", message: "Un problème interne. Veuillez patienter." };
    }
};


const login = async (req, res) => {
    console.log("IN login");
    const bodyIsOk = await bodyCheck.loginBodyCheck(req.body);
    if (!bodyIsOk) {
        return res.status(400).json({ status: "failure", message: "Veuillez remplir tous les champs." });
    }

    const { email, password } = req.body;
    const result = await loginLogic(email, password);
    
    if (result.status === "success") {
        // 🔐 Génère le token CSRF après une authentification réussie
        // const csrfToken = req.csrfToken(); 

        // // 📦 Envoie le token dans un cookie accessible côté client
        // res.cookie('XSRF-TOKEN', csrfToken, {
        //     httpOnly: false,   // Important pour que le frontend puisse lire le token
        //     secure: true,      // Ne marche qu’en HTTPS
        //     sameSite: 'strict'
        // });
        return res.status(200).json({ ...result });
    } else {
        return res.status(result.status === "failure" ? 400 : 500).json(result);
    }
};


const handleToken = async (req, res) => {
    let transaction;

    try {
        const { jwtToken, refreshToken } = req.body;

        console.log("Token d'accès reçu :", jwtToken);
        console.log("Refresh token reçu :", refreshToken);

        if (!jwtToken || !refreshToken) {
            console.log("❌ Requête invalide : token ou refresh token manquant.");

            transaction = await db.sequelize.transaction();
            await transaction.rollback();
            console.log("⛔ Transaction rollback (params manquants)");
            return res.status(400).json({
                status: "failure",
                message: "Token d'accès ou refresh token manquant."
            });
        }

        transaction = await db.sequelize.transaction();

        const isExpiring = await utils.isTokenExpiringSoon(jwtToken);
        console.log("⏰ Token va-t-il expirer ? :", isExpiring);

        if (isExpiring) {
            console.log("🔄 Le token d'accès expire bientôt, tentative de rafraîchissement...");

            const newTokens = await utils.refreshToken(refreshToken);

            if (newTokens && newTokens.accessToken && newTokens.refreshToken) {
                console.log("✅ Nouveaux tokens générés :", newTokens);

                await transaction.commit();
                console.log("✅ Transaction commitée");

                return res.status(200).json({
                    status: "success",
                    message: "Tokens rafraîchis avec succès.",
                    accessToken: newTokens.accessToken,
                    refreshToken: newTokens.refreshToken
                });
            } else {
                console.log("❌ Rafraîchissement échoué : refresh token invalide ou expiré.");

                await transaction.rollback();
                console.log("⛔ Transaction rollback (refresh échoué)");

                return res.status(401).json({
                    status: "failure",
                    message: "Session expirée, veuillez vous reconnecter."
                });
            }
        }

        console.log("👍 Token toujours valide. Aucune mise à jour nécessaire.");
        await transaction.commit();
        console.log("✅ Transaction commitée (token encore valide)");

        return res.status(200).json({
            status: "success",
            message: "Le token est encore valide.",
            accessToken: jwtToken
        });

    } catch (error) {
        console.error("🔥 Erreur dans handleToken :", error);

        if (transaction) {
            await transaction.rollback();
            console.log("⛔ Transaction rollback (catch général)");
        }

        return res.status(500).json({
            status: "failure",
            message: "Une erreur interne s'est produite."
        });
    }
};

const updateProfilePassword = async (req, res) => {
    //requête d'un utilisateur par son identifiant avec inclusion de la relation "Role"
    const bodyIsOk = await bodyCheck.updateProfilePasswordBodyCheck(req.body);
    //console.log("bodyisOk:",bodyIsOk)
    if (!bodyIsOk) {
        res.status(400).json({status: "failure", message: "Remplissez tous les champs correctement"});
    }
    const {email, apassword, password, password_confirmation } = req.body;
    if(password != password_confirmation) return res.status(400).json({status: "failure", message: "Username ou mot de passe incorrects"});
    
    try {
        let user = await User.findOne({ 
            where: {email: email},
            include: {
                model: db.Role, 
                as: 'role', 
                where: {
                    code: { [Sequelize.Op.ne]: 'admin' }
                }
            }
        });
        if (!user) {
            return res.status(400).json({status: "failure", message: "Email incorrect"});
        } 
        
        const isMatch = await bcrypt.compare(apassword, user.password)
        if(!isMatch){
            return res.status(400).json({status: "failure", message: "Ancien mot de passe invalide"});
        }
        
        const saltPass = await bcrypt.genSalt(12);
        const hashPwd = await bcrypt.hash(password,saltPass)
        
        user.password = hashPwd;
        if (user.first_connect == true) user.first_connect = false;
        if(!user.save()) res.status(500).json({status: "failure", message: "Un problème lors de la mise à jour. Veuillez réessayer."});  
        
        return res.status(200).json({status: "success", id: user.id});
    } catch (error) {
        console.log("Error: ", error)
        return res.status(500).json({status: "failure", message: "success"});  
    }
}   

const disableUser = async (req, res) => {
    try {
        console.log("ID: ", req.body.id)
        let id = req.body.id;
        let user = await User.findByPk(id, {
            where: {
                disabled: false
            },
            include: {
                model: db.Role, 
                as: 'role', 
                where: {
                    code: { [Sequelize.Op.ne]: 'admin' }
                }
            }
        });
        if (user) {
            user.disabled = true;
            const saveResult = await user.save();
            if (!saveResult) {
                return res.status(500).json({ status: "failure", message: 'Erreur serveur: Impossible de désactiver l\'utilisateur.' });
            }
            return res.status(200).json({ status: "success", id: id });
        } else {
            return res.status(422).json({ status: "failure", message: "Utilisateur inconnu." });
        }   
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "failure", message: "Erreur serveur." });
    }
}

const ableUser = async (req, res) => {
    let id = req.body.id;
    try {
        let user = await User.findByPk(id, {
            include: {
                model: db.Role, 
                as: 'role', 
                where: {
                    code: { [Sequelize.Op.ne]: 'admin' }
                }
            }
        });
        if (user) {
            user.disabled = false;
            const saveResult = await user.save();
            if (!saveResult) {
                return res.status(500).json({ status: "failure", message: 'Erreur serveur: Impossible de réactiver l\'utilisateur.' });
            }
            return res.status(200).json({ status: "success", id: id, user });
        } else {
            return res.status(422).json({ status: "failure", message: "Utilisateur inconnu." });
        }   
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "failure", message: "Erreur serveur." });
    }
}

const logout = async (req, res) => {
    console.log('In logout');
    console.log('User ID from request: ', req.userId);

    if (!req.userId) {
        console.log("User ID is missing, aborting logout.");
        return res.status(400).json({ status: "failure", message: "Utilisateur non trouvé. Vous devez être connecté pour vous déconnecter." });
    }

    // Démarrage de la transaction
    let t = null;

    try {
        t = await db.sequelize.transaction();
        console.log("Starting transaction...");
        
        // Recherche du ValidToken lié à l'utilisateur
        const valid = await ValidToken.findOne({
            where: {
                user_id: req.userId,
                token: req.token
            },
            transaction: t // Transaction liée à cette requête
        });

        if (!valid) {
            console.log("ValidToken not found for the given user ID and token");
            // Si le token n'existe pas, on fait un rollback et retourne l'erreur
            await t.rollback();
            return res.status(405).json({ status: "failure", message: "Veuillez vous connecter." });
        }

        console.log('ValidToken found, attempting to delete...');
        
        // Suppression du ValidToken
        await valid.destroy({ transaction: t });

        console.log('ValidToken successfully deleted');
        
        // Commit de la transaction si la suppression s'est bien déroulée
        await t.commit();
        console.log('Transaction committed successfully');

        return res.status(200).json({ status: "success", message: "Déconnexion réussie." });

    } catch (error) {
        // Si une erreur se produit, on effectue un rollback
        console.error('Error during logout transaction:', error);
        
        // Effectuer un rollback pour annuler toute modification effectuée dans cette transaction
        if(t) await t.rollback();
        console.log('Transaction rolled back due to an error');

        return res.status(500).json({ status: "failure", message: "Un problème lors de la déconnexion. Veuillez réessayer." });
    }
};


const viewAllUsers = (req, res) => { 
    User.findAll({
        where: {
            disabled: false
        },
        attributes: [
            'id', 'nom', 'prenoms', 'email', 'tel', 'derniere_connexion',
            [Sequelize.literal('CASE WHEN "disabled" = true THEN \'Bloqué\' ELSE \'Actif\' END'), 'status']
        ],
        include: [
            {
                model: db.Role,
                as: 'role'
            }
        ],
    }).then(users => { 
        console.log(users);
        return res.status(200).json({ status: "success", users });
    }).catch(function (error) { 
        console.error(error);
        return res.status(500).json({ status: "failure", message: "Un problème lors de la récupération des utilisateurs." });  
    });
};

const agentList = async (req, res) => {
    const { page = 1, limit = 10, search = '', startDate, endDate } = req.query;

    const offset = (page - 1) * limit;

    // Prepare date filters
    const dateFilters = {};
    if (startDate) {
        dateFilters[Op.gte] = new Date(startDate);
    }
    if (endDate) {
        dateFilters[Op.lte] = new Date(endDate);
    }

    // Build the where clause
    const whereClause = {
        disabled: false,
        in_ad: false,
        [Op.or]: [
            { first_name: { [Op.iLike]: `%${search}%` } },
            { last_name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { tel: { [Op.iLike]: `%${search}%` } },
            { matricule: { [Op.iLike]: `%${search}%` } },
            { title: { [Op.iLike]: `%${search}%` } },
            { actual_grade_class: { [Op.iLike]: `%${search}%` } },
            { recrut_class: { [Op.iLike]: `%${search}%` } },
        ]
    };

    // Add date filters to the where clause
    if (Object.keys(dateFilters).length > 0) {
        whereClause[Op.and] = [
            ...(startDate || endDate ? [{ date_of_service: dateFilters }] : []),
            ...(startDate || endDate ? [{ date_actual_grade_class: dateFilters }] : [])
        ];
    }

    try {
        const { count, rows: agents } = await User.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: db.Role,
                    as: 'role',
                    where: {
                        code: {
                            [Op.notIn]: ['super_admin']
                        }
                    }
                },
                {
                    model: db.Corps,
                    as: 'body'
                },
                {
                    model: db.Juridiction,
                    as: 'juridiction'
                },
                {
                    model: db.Entite,
                    as: 'entite'
                },
            ],
            attributes: { exclude: ['password', 'in_ad'] }, // Exclude password from the result
            limit,
            offset,
            distinct: true,
            order: [['first_name', 'ASC']]
        });

        return res.status(200).json({ 
            status: "success", 
            agents, 
            total: count, 
            page: Number(page), 
            totalPages: Math.ceil(count / limit) 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "failure", message: "Un problème lors de la récupération des utilisateurs." });
    }
};
const getRoles = async (req, res) => {
    try {
        // Récupération des rôles de la base de données
        const roles = await db.Role.findAll(); // Remplacez par votre méthode de récupération

        // Formatage de la réponse en cas de succès
        return res.status(200).json({
            status: 'success',
            data: roles
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        
        // Formatage de la réponse en cas d'échec
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la récupération des rôles'
        });
    }
};


const viewUser = (req, res) => {
    let id = req.userId;
    if (!id) {
        return res.status(401).json({ status: "failure", message: "Veuillez vous connecter." });  
    }
    User.findOne({
        attributes: [
            'id', 'first_name', 'last_name', 'email', 'tel', 'last_connexion',
            [Sequelize.literal('CASE WHEN "User"."disabled" = true THEN \'Bloqué\' ELSE \'Actif\' END'), 'status'] // Specify the table alias
        ],
        where: { id },
        include: [
            {
                model: Role,
                as: 'role'
            }
        ]
    }).then(user => {
        if (!user) {
            return res.status(404).json({ status: "failure", message: "Veuillez envoyer un bon utilisateur." });  
        }
        return res.status(200).json({ status: "success", user });
    }).catch(error => {
        console.error(error);
        return res.status(500).json({ status: "failure", message: "Un problème lors de la récupération de l'utilisateur." });  
    });
};


const session = (req, res) => {
    let id = req.userId;
    if (!id) {
        return res.status(401).json({ status: "failure", message: "Veuillez vous connecter." });  
    }
    User.findOne({
        attributes: [
            'id', 'first_name', 'last_name', 'email', 'tel', 'last_connexion',
            [Sequelize.literal('CASE WHEN "User"."disabled" = true THEN \'Bloqué\' ELSE \'Actif\' END'), 'status'] // Specify the table alias
        ],
        where: { id },
        include: [
            {
                model: Role,
                as: 'role'
            }
        ]
    }).then(async (user) => {
        if (!user) {
            return res.status(404).json({ status: "failure", message: "Veuillez envoyer un bon utilisateur." });  
        }
        let jwt = await  db.ValidToken.findOne({
            attributes: [
                'id', 'token'
            ],
            where: {
                token: req.token,
                user_id: user.id
            },
        })
        if(!jwt) return res.status(401).json({ status: "failure", message: "Veuillez vous authentifier." });  
        user.jwt = jwt
        return res.status(200).json({ status: "success", data: {user, jwt} });
    }).catch(error => {
        console.error(error);
        return res.status(500).json({ status: "failure", message: "Un problème lors de la récupération de l'utilisateur." });  
    });
};

const restoreUserPassword = async (req, res) => {
    let transaction;

    try {
        const { id, email } = req.body;
        console.log("🔧 Restauration du mot de passe pour ID:", id, "et email:", email);

        // Vérification des champs requis
        if (!id || !email) {
            console.log("❌ ID ou email manquant.");
            return res.status(400).json({ status: "failure", message: "Champs manquants." });
        }

        // Vérification que l'email appartient au domaine gouv.bj
        if (!utils.isGouvMail(email)) {
            console.log("❌ Email non autorisé:", email);
            return res.status(403).json({ status: "failure", message: "Email non autorisé pour cette opération." });
        }

        const default_password = process.env.DEFAULT_PASSWD;

        transaction = await db.sequelize.transaction();

        const user = await User.findOne({ 
            where: { id, email },
            transaction
        });

        if (!user) {
            console.log("❌ Utilisateur non trouvé.");
            await transaction.rollback();
            return res.status(400).json({ status: "failure", message: "Email invalide." });
        } 

        const saltPass = await bcrypt.genSalt(12);
        const hashPwd = await bcrypt.hash(default_password, saltPass);

        user.password = hashPwd;
        user.first_connect = true;

        const saveResult = await user.save({ transaction });

        if (!saveResult) {
            console.log("❌ Échec de l'enregistrement.");
            await transaction.rollback();
            return res.status(500).json({ status: "failure", message: "Un problème lors de la mise à jour. Veuillez réessayer." });
        }

        await transaction.commit();
        console.log("✅ Mot de passe restauré avec succès.");
        return res.status(200).json({ status: "success", id: user.id, email: user.email });

    } catch (error) {
        console.error("🔥 Erreur lors de la restauration du mot de passe :", error);
        if (transaction) await transaction.rollback();
        console.log("⛔ Transaction rollback.");
        return res.status(500).json({ status: "failure", message: "Un problème lors de la mise à jour. Veuillez réessayer." });
    }
};


const check_login_code = async (req, res) => {
    let transaction;
    try {
        const code = req.body.login_code;
        console.log("🔍 Vérification du code de connexion :", code);

        transaction = await db.sequelize.transaction();
        const exist = await db.LoginCode.findOne({
            where: { code },
            transaction
        });

        if (exist) {
            console.log("✅ Code trouvé :", exist);
            await transaction.commit();
            return res.status(200).json({
                status: 'success',
                message: 'Code de connexion valide.',
                data: exist
            });
        } else {
            console.log("❌ Code invalide.");
            await transaction.rollback();
            return res.status(404).json({
                status: 'failure',
                message: 'Code de connexion invalide.'
            });
        }

    } catch (error) {
        console.error('🔥 Erreur check_login_code :', error);
        if (transaction) await transaction.rollback();
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur serveur.'
        });
    }
};


const send_otp = async (req, res) => {
    let transaction;
    try {
        const email = req.body.email;
        console.log("📩 Envoi de l'OTP à :", email);

        transaction = await db.sequelize.transaction();

        const organization = await db.Organisation.findOne({
            where: { email },
            include: {
                model: db.Status,
                as: 'statutIn',
                required: true,
                where: { code: 'valide' }
            },
            transaction
        });

        if (!organization) {
            console.log("❌ Organisation non trouvée ou invalide.");
            await transaction.rollback();
            return res.status(404).json({
                status: 'failure',
                message: 'Organisation invalide ou non validée.'
            });
        }

        const otpCode = await utils.generateAndStoreOTP(email); // Ceci devrait déjà gérer sa propre transaction si besoin

        const params = { otp: otpCode };
        const type = "sendOtpCode";
        const mailOptions = {
            to: organization.email,
            subject: "Code de connexion"
        };

        sendEmail(mailOptions, params, type);
        await transaction.commit();

        console.log("✅ OTP envoyé avec succès à :", email);
        return res.status(200).json({
            status: 'success',
            message: 'Un code OTP a été envoyé à votre email.'
        });

    } catch (error) {
        console.error('🔥 Erreur send_otp :', error);
        if (transaction) await transaction.rollback();
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur serveur.'
        });
    }
};


const check_otp_code = async (req, res) => {
    let transaction;
    try {
        const { email, otp: code } = req.body;
        console.log("🔍 Vérification OTP pour :", email);

        if (!email || !code) {
            console.log("❌ Champs manquants.");
            return res.status(400).json({
                status: "failure",
                message: "Les champs email et otp sont réquis"
            });
        }

        transaction = await db.sequelize.transaction();

        const codeOtp = await db.CodeOTP.findOne({
            where: { email, code },
            transaction
        });

        if (!codeOtp) {
            console.log("❌ Code OTP invalide.");
            await transaction.rollback();
            return res.status(404).json({
                status: 'failure',
                message: 'Le code OTP est invalide ou a expiré.'
            });
        }

        const organization = await db.Organisation.findOne({
            where: { email },
            include: {
                model: db.Status,
                as: 'statutIn',
                required: true,
                where: { code: 'valide' }
            },
            transaction
        });

        if (!organization) {
            console.log("❌ Organisation introuvable ou invalide.");
            await transaction.rollback();
            return res.status(404).json({
                status: 'failure',
                message: 'L\'organisation associée à cet email n\'existe pas ou n\'est pas validée.'
            });
        }

        await transaction.commit();
        console.log("✅ Code OTP validé pour :", email);
        return res.status(200).json({
            status: 'success',
            message: 'Le code OTP a été vérifié avec succès.',
            data: codeOtp
        });

    } catch (error) {
        console.error('🔥 Erreur check_otp_code :', error);
        if (transaction) await transaction.rollback();
        return res.status(500).json({
            status: 'failure',
            message: 'Une erreur est survenue lors du traitement de votre demande.'
        });
    }
};




module.exports = {
    registerUser,
    login,
    updateProfilePassword,
    logout,
    viewAllUsers,
    viewUser,
    ableUser,
    disableUser,
    restoreUserPassword,
    handleToken,
    check_login_code,
    send_otp,
    check_otp_code,
    getRoles,
    session,
    agentList
};