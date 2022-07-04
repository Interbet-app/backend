import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("wallets", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
         blocked: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
         score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("wallets");
   },
};

