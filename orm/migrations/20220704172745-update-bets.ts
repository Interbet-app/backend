import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("bets", "bonusPercent", {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         defaultValue: 0,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("bets", "bonusPercent");
   },
};





