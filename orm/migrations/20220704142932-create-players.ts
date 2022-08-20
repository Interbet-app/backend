import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("players", {
         id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
         teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
         name: { type: DataTypes.STRING(40), allowNull: false },
         position: { type: DataTypes.STRING(40), allowNull: false },
         holder: { type: DataTypes.BOOLEAN, allowNull: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("players");
   },
};
