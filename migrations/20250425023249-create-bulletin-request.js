// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('BulletinRequests', {
//       id: {
//         autoIncrement: true,
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true
//       },
//       year: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//       },
//       evaluators: {
//         type: DataTypes.JSON,
//         allowNull: false,
//         defaultValue: []
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
//     await queryInterface.dropTable('BulletinRequests');
//   }
// };