import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("bets", "group", {
         type: DataTypes.STRING,
         allowNull: true,
      });
      await queryInterface.addColumn("bets", "paid", {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("bets", "group");
      await queryInterface.removeColumn("bets", "paid");
   },
};
