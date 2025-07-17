'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Countries', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      iso3: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      iso2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      numeric_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      capital: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency_symbol: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tld: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      native: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emoji: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emojiu: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timezones: {
        type: Sequelize.JSON, // Storing arrays as JSON in Sequelize
        allowNull: true,
      },
      translations: {
        type: Sequelize.JSON, // Storing arrays as JSON in Sequelize
        allowNull: true,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      can_request: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      automatic_generation: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      created_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Countries');
  }
};