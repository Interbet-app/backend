import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("games", {
         fields: ["eventId"],
         type: "foreign key",
         name: "FK_games.eventId_to_events.id",
         references: {
            table: "events",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("wallets", "FK_wallets.userId_to_users.id");
   },
};

