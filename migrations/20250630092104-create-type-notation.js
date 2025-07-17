// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('TypeNotations', {
//       id: {
//         autoIncrement: true,
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true
//       },
//       label: {
//         type: DataTypes.STRING,
//         allowNull: false, // Nom ou description du type d'accord
//       },
//       code: {
//         type: DataTypes.STRING,
//         allowNull: false, // Nom ou description du type d'accord
//         unique: true // Unicité du type d'accord
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
//     await queryInterface.dropTable('TypeNotations');
//   }
// };