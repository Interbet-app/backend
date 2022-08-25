import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("athletics", {
         id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
         adminId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
         name: { type: DataTypes.STRING(60), allowNull: false },
         abbreviation: { type: DataTypes.STRING(20), allowNull: false },
         picture: { type: DataTypes.STRING, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("athletics");
   },
};





