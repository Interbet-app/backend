import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("bets", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         oddId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
         payout: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         status: { type: DataTypes.ENUM("pendent", "completed"), allowNull: false },
         result: { type: DataTypes.ENUM("pendent", "win", "lose"), allowNull: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("bets");
   },
};

