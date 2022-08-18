import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("withdrawals", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         status: { type: DataTypes.ENUM, values: ["pendent", "completed"], allowNull: false },
         pixKey: { type: DataTypes.STRING, allowNull: false },
         pixKeyType: { type: DataTypes.ENUM, values: ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"], allowNull: false },
         externalStatus: { type: DataTypes.STRING, allowNull: true },
         externalId: { type: DataTypes.STRING, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("withdrawals");
   },
};
