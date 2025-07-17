'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documents', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER, // Correction: Utiliser Sequelize.INTEGER
        allowNull: false,
        primaryKey: true
      },
      titre: {
        type: Sequelize.STRING,
        allowNull: false, // Titre du document
      },
      dateCreation: {
        type: Sequelize.DATE,
        allowNull: false // Date de création du document
      },
      cheminFichier: {
        type: Sequelize.STRING,
        allowNull: false, // Chemin d'accès au fichier
      },
      description: {
        type: Sequelize.TEXT, // Détails supplémentaires concernant le document
        allowNull: true
      },
      typeDocumentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TypeDocuments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documents');
  }
};
