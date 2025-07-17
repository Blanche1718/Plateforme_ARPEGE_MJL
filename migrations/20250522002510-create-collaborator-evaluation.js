// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('CollaboratorEvaluations', {
//       id: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         primaryKey: true,
//         defaultValue: DataTypes.UUIDV4
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
//     await queryInterface.dropTable('CollaboratorEvaluations');
//   }
// };