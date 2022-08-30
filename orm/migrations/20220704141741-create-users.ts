import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("users", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         name: { type: DataTypes.STRING(60), allowNull: false },
         email: { type: DataTypes.STRING(60), allowNull: false, unique: true },
         teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
         affiliateId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
         externalId: { type: DataTypes.STRING, allowNull: false },
         level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
         oauth: { type: DataTypes.ENUM, values: ["google", "instagram", "facebook"], allowNull: true },
         picture: { type: DataTypes.STRING, allowNull: true },
         document: { type: DataTypes.STRING, allowNull: true },
         pixAddress: { type: DataTypes.STRING, allowNull: true },
         pixKeyType: { type: DataTypes.ENUM, values: ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"], allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("users");
   },
};








