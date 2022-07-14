import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("maintenances", {
         fields: ["userId"],
         type: "foreign key",
         name: "FK_maintenances.userId_to_users.id",
         references: {
            table: "users",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("maintenances", "FK_maintenances.userId_to_users.id");
   },
};





