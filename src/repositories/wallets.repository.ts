import { wallets } from "../models";
import { IWallet } from "../interfaces";

export class Wallets {
   static async All() {
      return (await wallets.findAll()) as IWallet[];
   }
   static async ById(id: number) {
      return (await wallets.findByPk(id)) as IWallet;
   }
   static async ByUserId(userId: number) {
      return (await wallets.findOne({ where: { userId: userId } })) as IWallet;
   }
   static async Create(wallet: IWallet) {
      return (await wallets.create(wallet)) as IWallet;
   }
   static async Destroy(id: number) {
      return await wallets.destroy({ where: { id: id } });
   }
}


