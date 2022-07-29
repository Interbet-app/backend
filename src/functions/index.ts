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


