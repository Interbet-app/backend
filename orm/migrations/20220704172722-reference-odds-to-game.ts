import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("odds", {
         fields: ["gameId"],
         type: "foreign key",
         name: "FK_odds.gameId_to_games.id",
         references: {
            table: "games",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("odds", "FK_odds.gameId_to_games.id");
   },
};

