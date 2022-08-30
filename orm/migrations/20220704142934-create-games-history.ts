import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("games-history", {
         id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
         event: { type: DataTypes.STRING(40), allowNull: false },
         teamA: { type: DataTypes.STRING(40), allowNull: false },
         teamB: { type: DataTypes.STRING(40), allowNull: false },
         scoreA: { type: DataTypes.INTEGER, allowNull: false },
         scoreB: { type: DataTypes.INTEGER, allowNull: false },
         date: { type: DataTypes.DATE, allowNull: false },
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("games-history");
   },
};

