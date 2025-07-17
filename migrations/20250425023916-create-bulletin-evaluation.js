// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('BulletinEvaluations', {
//       id: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         primaryKey: true,
//         defaultValue: DataTypes.UUIDV4
//       },
//       total_score: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         validate: {
//           min: 0,
//           max: 20
//         }
//       },
//       comment: {
//         type: DataTypes.TEXT,
//         allowNull: true
//       },
//       action_date: {
//         type: DataTypes.DATE,
//         allowNull: true,
//         defaultValue: DataTypes.NOW // Set default value to the current date and time
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
//     await queryInterface.dropTable('BulletinEvaluations');
//   }
// };