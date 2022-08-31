import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("rankings", {
         id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
         eventId: { type: DataTypes.INTEGER, allowNull: false },
         teamId: { type: DataTypes.INTEGER, allowNull: false },
         name: { type: DataTypes.STRING(60), allowNull: false },
         score: { type: DataTypes.INTEGER, allowNull: false },
         wins: { type: DataTypes.INTEGER, allowNull: false },
         draws: { type: DataTypes.INTEGER, allowNull: false },
         losses: { type: DataTypes.INTEGER, allowNull: false },
         goalFor: { type: DataTypes.INTEGER, allowNull: false },
         goalAgainst: { type: DataTypes.INTEGER, allowNull: false },
         goalDifference: { type: DataTypes.INTEGER, allowNull: false },
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("rankings");
   },
};

