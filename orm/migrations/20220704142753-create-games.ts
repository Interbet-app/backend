import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("games", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         eventId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
         name: { type: DataTypes.STRING, allowNull: false },
         status: { type: DataTypes.ENUM("open", "pendent", "closed"), allowNull: false, defaultValue: "open" },
         modality: { type: DataTypes.STRING, allowNull: true },
         winnerOddId: { type: DataTypes.INTEGER, allowNull: true },
         result: { type: DataTypes.STRING, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("games");
   },
};


