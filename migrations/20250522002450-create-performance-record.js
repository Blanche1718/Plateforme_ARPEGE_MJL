// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('PerformanceRecords', {
//       id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true, // Auto-incrementing integer
//       },
//       year: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//       },
//       month: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//       },
//       comment: {
//         type: DataTypes.TEXT,
//         allowNull: true,
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
//     await queryInterface.dropTable('PerformanceRecords');
//   }
// };