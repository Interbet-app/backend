import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("adds", {
         id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
         image: { type: DataTypes.STRING, allowNull: false },
         url: { type: DataTypes.STRING, allowNull: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("adds");
   },
};


