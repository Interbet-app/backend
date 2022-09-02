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
         percentIsBonus: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
         group: { type: DataTypes.STRING, allowNull: true, defaultValue: "0" },
         paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("bets");
   },
};



