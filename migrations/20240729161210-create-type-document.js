'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TypeDocuments', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER, // Correction: Utiliser Sequelize.INTEGER au lieu de DataTypes.INTEGER
        allowNull: false,
        primaryKey: true
      },
      libelle: {
        type: Sequelize.STRING,
        allowNull: false, // Nom ou description du type de document
        unique: true // Unicité du type de document
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
    await queryInterface.dropTable('TypeDocuments');
  }
};
