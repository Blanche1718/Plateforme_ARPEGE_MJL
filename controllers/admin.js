const db = require("../models/index");
const minioTools = require('../helpers/minioFonction');
const minioClient = require('../helpers/minio');
const helper = require('../helpers/utils');
const zlib = require('zlib');
const { Op, Sequelize } = require('sequelize');
const TaskScheduler = require('../helpers/taskScheduler');

const createTypePermission = async (req, res) => {
    const t = await db.sequelize.transaction(); // Démarrer une transaction

    try {
        const { code, label, ressource } = req.body; // Récupérer les données de la requête
        const userId = req.userId; // Récupérer l'ID de l'utilisateur depuis la requête

        // Vérification du rôle d'admin
        const user = await db.User.findByPk(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                status: 'failure',
                message: 'Accès refusé. Seuls les administrateurs peuvent créer des permissions.',
            });
        }

        // Validation des données
        if (!code || !label) {
            return res.status(400).json({
                status: 'failure',
                message: 'Code et label sont requis.',
            });
        }

        // Créer le nouveau type de permission
        const newTypePermission = await db.TypePermission.create({
            code,
            label,
            ressource
        }, { transaction: t });

        await t.commit(); // Valider la transaction

        return res.status(201).json({
            status: 'success',
            message: 'Type de permission créé avec succès.',
            data: {
                id: newTypePermission.id,
                code: newTypePermission.code,
                label: newTypePermission.label,
            },
        });
    } catch (error) {
        await t.rollback(); // Annuler la transaction en cas d'erreur
        console.error('Erreur lors de la création du type de permission:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la création du type de permission.',
        });
    }
};

async function updatePermissions(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
        const adminId = req.userId; // ID de l'utilisateur connecté
        const roleId = req.params.roleId; // ID du rôle à modifier
        const newPermissions = req.body.permissions; // Permissions à mettre à jour

        // Vérifier si l'utilisateur est authentifié
        if (!adminId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Authentifiez-vous.',
            });
        }

        // Trouver l'utilisateur connecté
        const adminUser = await db.User.findByPk(adminId);
        if (!adminUser) {
            return res.status(404).json({
                status: 'failure',
                message: 'Utilisateur non trouvé.',
            });
        }

        // Trouver le rôle cible
        const role = await db.Role.findByPk(roleId, {
            include: {
                model: db.TypePermission,
                as: 'permissions',
            },
            transaction,
        });

        if (!role) {
            return res.status(404).json({
                status: 'failure',
                message: 'Rôle non trouvé.',
            });
        }

        // Récupérer les permissions actuelles
        const currentPermissions = role.permissions.map(permission => permission.code);

        // Déterminer les permissions à ajouter et à supprimer
        const permissionsToAdd = newPermissions.filter(
            perm => !currentPermissions.includes(perm)
        );
        const permissionsToRemove = currentPermissions.filter(
            perm => !newPermissions.includes(perm)
        );

        // Ajouter les nouvelles permissions
        await role.addPermissions(permissionsToAdd, { transaction });

        // Supprimer les permissions non désirées
        await role.removePermissions(permissionsToRemove, { transaction });

        // Valider la transaction
        await transaction.commit();

        return res.status(200).json({
            status: 'success',
            message: 'Permissions mises à jour avec succès.',
        });
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await transaction.rollback();
        console.error('Erreur lors de la mise à jour des permissions:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la mise à jour des permissions.',
        });
    }
}


const deleteTypePermission = async (req, res) => {
    const t = await db.sequelize.transaction(); // Démarrer une transaction

    try {
        const { id } = req.params; // Récupérer l'ID de la permission depuis les paramètres de la requête
        const userId = req.userId; // Récupérer l'ID de l'utilisateur depuis la requête

        // Vérifier le rôle d'admin
        const user = await db.User.findByPk(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                status: 'failure',
                message: 'Accès refusé. Seules les administrateurs peuvent supprimer des permissions.',
            });
        }

        // Vérifier si la permission existe
        const permission = await db.TypePermission.findByPk(id);
        if (!permission) {
            return res.status(404).json({
                status: 'failure',
                message: 'Permission non trouvée.',
            });
        }

        // Supprimer la permission
        await db.TypePermission.destroy({ where: { id } }, { transaction: t });

        await t.commit(); // Valider la transaction

        return res.status(200).json({
            status: 'success',
            message: 'Permission supprimée avec succès.',
        });
    } catch (error) {
        await t.rollback(); // Annuler la transaction en cas d'erreur
        console.error('Erreur lors de la suppression de la permission:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la suppression de la permission.',
        });
    }
};

const deletePermission = async (req, res) => {
    const t = await db.sequelize.transaction(); // Démarrer une transaction

    try {
        const { role_id, type_permission_id } = req.params; // Récupérer les IDs depuis les paramètres
        const userId = req.userId; // Récupérer l'ID de l'utilisateur depuis la requête

        // Vérifier le rôle d'admin
        const user = await db.User.findByPk(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                status: 'failure',
                message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des permissions.',
            });
        }

        // Vérifier si la permission existe
        const permission = await db.Permission.findOne({
            where: {
                role_id,
                type_permission_id
            }
        });

        if (!permission) {
            return res.status(404).json({
                status: 'failure',
                message: 'Permission non trouvée.',
            });
        }

        // Supprimer la permission
        await db.Permission.destroy({
            where: {
                role_id,
                type_permission_id
            }
        }, { transaction: t });

        await t.commit(); // Valider la transaction

        return res.status(200).json({
            status: 'success',
            message: 'Permission supprimée avec succès.',
        });
    } catch (error) {
        await t.rollback(); // Annuler la transaction en cas d'erreur
        console.error('Erreur lors de la suppression de la permission:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la suppression de la permission.',
        });
    }
};

module.exports = {
    updatePermissions,
    deletePermission,
    createTypePermission,
    deleteTypePermission
}