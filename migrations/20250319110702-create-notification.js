'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
      },
      libelle: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      title: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      message: {
          type: DataTypes.TEXT,
          allowNull: true,
      },
      isRead: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false, // Par défaut, la notification est non lue
      },
      isExpired: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false, // Indique si la notification est dépassée
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
    await queryInterface.dropTable('Notifications');
  }
};