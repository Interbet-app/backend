import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("odds", {
         fields: ["teamId"],
         type: "foreign key",
         name: "FK_odds.teamId_to_teams.id",
         references: {
            table: "teams",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("odds", "FK_odds.teamId_to_teams.id");
   },
};

