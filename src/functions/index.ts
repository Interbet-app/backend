export class File {
   static BreakMimetype(mimetype: string) {
      if (!mimetype) return;
      let setFirstMimeType = String(mimetype.split(",")[0]).trim();
      let parts = setFirstMimeType.split("/");
      return {
         type: parts[0].trim() || "",
         subType: parts[1].trim() || "",
      };
   }

   static getFileExtensionByName(filename: string) {
      if (!filename) return;
      let parts = filename.split(".");
      return parts[parts.length - 1].trim();
   }

   static FilterExtension(permittedExt: String[], mimetype: string): boolean {
      return permittedExt.includes(mimetype);
   }
}

export const RefreshOddsPayout = (balance: number[]) => {
   const equilibriumConst = balance[0] + balance[1] + 1000;
   const marginHouse = 0.1;
   const balanceListDuplicate = [...balance, ...balance];
   const newOdds = [] as any[];
   balance.forEach((bet) => {
      const A = balanceListDuplicate[balance.indexOf(bet)] + equilibriumConst;
      const B = balanceListDuplicate[balance.indexOf(bet) + 1] + equilibriumConst;
      const odd = (1 - marginHouse) * (1 + B / A);
      newOdds.push(Number(odd.toFixed(2)));
   });
   return newOdds;
};
