import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("users", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         name: { type: DataTypes.STRING, allowNull: false },
         email: { type: DataTypes.STRING, allowNull: false, unique: true },
         team: { type: DataTypes.STRING, allowNull: true },
         affiliateId: { type: DataTypes.INTEGER, allowNull: true },
         externalId: { type: DataTypes.STRING, allowNull: false, unique: true },
         oauth: { type: DataTypes.ENUM, values: ["google", "ig", "facebook"], allowNull: true },
         picture: { type: DataTypes.STRING, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("users");
   },
};




