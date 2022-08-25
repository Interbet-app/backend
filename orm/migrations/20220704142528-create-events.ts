import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("events", {
         id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
         name: { type: DataTypes.STRING(60), allowNull: false },
         description: { type: DataTypes.STRING, allowNull: true },
         title: { type: DataTypes.STRING(40), allowNull: false },
         location: { type: DataTypes.STRING(80), allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("events");
   },
};



