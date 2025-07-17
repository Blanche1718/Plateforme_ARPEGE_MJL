'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Statuts', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Auto-incrementing integer
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false, // Nom ou description du type d'accord
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false, // Nom ou description du type d'accord
        unique: true // Unicité du type d'accord
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true, // Nom ou description du type d'accord
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
    await queryInterface.dropTable('Statuts');
  }
};