// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('IndicatorModels', {
//       id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true, // Auto-incrementing integer
//       },
//       goal: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       indicator: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       code: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       }
//     });
//   },
//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable('IndicatorModels');
//   }
// };