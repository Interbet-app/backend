import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("players", {
         fields: ["teamId"],
         type: "foreign key",
         name: "FK_players.userId_to_teams.id",
         references: {
            table: "teams",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("players", "FK_players.userId_to_teams.id");
   },
};
