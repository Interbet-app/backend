import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("teams", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         name: { type: DataTypes.STRING, allowNull: false },
         abbreviation: { type: DataTypes.STRING, allowNull: false },
         location: { type: DataTypes.STRING, allowNull: false },
         picture: { type: DataTypes.STRING, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("teams");
   },
};




