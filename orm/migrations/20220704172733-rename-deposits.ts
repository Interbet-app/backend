import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.renameColumn("deposits", "mp_ticker_url", "externalUrl");
      await queryInterface.renameColumn("deposits", "mp_status", "externalStatus");
      await queryInterface.renameColumn("deposits", "mp_id", "externalId");
      await queryInterface.renameColumn("deposits", "mp_qr_code", "externalQrCode");
      await queryInterface.renameColumn("deposits", "mp_expires", "expireAt");
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.renameColumn("deposits", "externalUrl", "mp_ticker_url");
      await queryInterface.renameColumn("deposits", "externalStatus", "mp_status");
      await queryInterface.renameColumn("deposits", "externalId", "mp_id");
      await queryInterface.renameColumn("deposits", "externalQrCode", "mp_qr_code");
      await queryInterface.renameColumn("deposits", "expireAt", "mp_expires");
   },
};













