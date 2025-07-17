// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('CriteriaEvaluations', {
//       id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true, // Auto-incrementing integer
//       },
//       label: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       code: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       min_score: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0
//       },
//       max_score: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//       },
//       disabled: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       useCase: {
//         type: DataTypes.STRING,
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
//     await queryInterface.dropTable('CriteriaEvaluations');
//   }
// };