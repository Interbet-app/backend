import { QueryInterface ,DataTypes} from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("games", "endDate", { type: DataTypes.DATE, allowNull: false });
      await queryInterface.addColumn("games", "goalsA", { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 });
      await queryInterface.addColumn("games", "goalsB", { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 });
      await queryInterface.addColumn("games", "winnerCommission", { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: -1 });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("games", "endDate");
      await queryInterface.removeColumn("games", "goalsA");
      await queryInterface.removeColumn("games", "goalsB");
      await queryInterface.removeColumn("games", "winnerCommission");
   },
};

