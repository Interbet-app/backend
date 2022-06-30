export interface IWallet {
   id?: number;
   userId: number;
   balance: number;
   blocked: number;
   score: number;
   createdAt: Date;
   updatedAt: Date;
}
