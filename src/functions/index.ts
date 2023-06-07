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

export const RefreshOddsPayout = (balance: number[], startPayOuts: number[], totalBet: number) => {
   const profits = balance.map(balance => balance - totalBet)
   const equilibriumConst = totalBet + 1000;
   const rate = equilibriumConst/(500+equilibriumConst)
   const balanceListDuplicate = [...profits, ...profits];
   const newOdds = [] as any [];
   profits.forEach((bet) => {
      const A = (balanceListDuplicate[profits.indexOf(bet)] + equilibriumConst)/equilibriumConst;
      const B = (balanceListDuplicate[profits.indexOf(bet) + 1] + equilibriumConst)/equilibriumConst;
      const C = (balanceListDuplicate[profits.indexOf(bet) + 2] + equilibriumConst)/equilibriumConst;
      const odd = (1 + B / A + C/A) - 3;
      newOdds.push(Number(odd.toFixed(2)));
   });
   const finalOdds = startPayOuts.map(odd => (((odd * (1 - rate) + (newOdds[startPayOuts.indexOf(odd)] + odd)* rate) - 1) * 0.6) + 1)
   return finalOdds;
 };
