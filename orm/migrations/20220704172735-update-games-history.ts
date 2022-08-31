import { QueryInterface,DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("games-history", "ref_table", {
         type: DataTypes.STRING(60),
         allowNull: true,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("games-history", "ref_table");
   },
};


