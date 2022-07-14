import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("maintenances", {
         id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         path: { type: DataTypes.STRING, allowNull: false },
         method: { type: DataTypes.ENUM("ALL", "DELETE", "GET", "POST", "PUT", "PATCH"), allowNull: false },
         group: { type: DataTypes.STRING(60), allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("maintenances");
   },
};








