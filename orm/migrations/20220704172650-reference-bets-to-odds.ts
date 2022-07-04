import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("bets", {
         fields: ["oddId"],
         type: "foreign key",
         name: "FK_bets.oddId_to_odds.id",
         references: {
            table: "odds",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("bets", "FK_bets.oddId_to_odds.id");
   },
};


