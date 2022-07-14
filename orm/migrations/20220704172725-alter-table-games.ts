import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("games", "startDate", {
         type: "DATE",
         allowNull: false,
      });
      await queryInterface.addColumn("games", "location", {
         type: "VARCHAR(60)",
         allowNull: false,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("games", "startDate");
      await queryInterface.removeColumn("games", "location");
   },
};

