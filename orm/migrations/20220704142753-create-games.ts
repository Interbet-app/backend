import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("games", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         eventId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
         name: { type: DataTypes.STRING(60), allowNull: false },
         status: { type: DataTypes.ENUM("open", "pendent", "closed"), allowNull: false, defaultValue: "open" },
         modality: { type: DataTypes.STRING(40), allowNull: true },
         winnerOddId: { type: DataTypes.INTEGER, allowNull: true },
         winnerCommission: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: -1 },
         goalsA: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
         goalsB: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
         location: { type: DataTypes.STRING(60), allowNull: true },
         startDate: { type: DataTypes.DATE, allowNull: true },
         endDate: { type: DataTypes.DATE, allowNull: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("games");
   },
};






