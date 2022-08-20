import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.renameColumn("wallets", "blocked", "bonus");
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.renameColumn("wallets", "bonus", "blocked");
   },
};
