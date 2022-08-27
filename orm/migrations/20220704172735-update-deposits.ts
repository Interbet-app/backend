import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("deposits", "externalAmount", {
         type: "INTEGER",
         allowNull: true,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("deposits", "externalAmount");
   },
};

