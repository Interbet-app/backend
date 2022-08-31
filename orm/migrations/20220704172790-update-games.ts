import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("games", "endDate");
   },
};
