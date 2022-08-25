import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("notifications", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         title: { type: DataTypes.STRING(40), allowNull: false },
         message: { type: DataTypes.STRING, allowNull: false },
         unread: { type: DataTypes.BOOLEAN, allowNull: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("notifications");
   },
};







