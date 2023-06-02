import logger from "../log";
import { xml2json } from "xml-js";

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const checkStatusOfRequest = (xml: string) => {
   const xmlResponse = JSON.parse(xml2json(xml, { compact: true, spaces: 4 }));
   const result = xmlResponse.PKT.Result;

   if (result._attributes.Success === "0") {
      return {
         ok: false,
      };
   } else {
      return {
         ok: true,
      };
   }
};

export const convertXMLtoJson = (xml: any, options: string[]) => {
   try {
      const xmlResponse = JSON.parse(xml2json(xml, { compact: true, spaces: 4 }));
      const result = xmlResponse.PKT.Result;
      const returnSet = result.Returnset;
      const response = [...options]?.reduce(
         (a, v) => ({
            ...a,
            [v]: returnSet[capitalizeFirstLetter(v)]?._attributes.Value,
         }),
         {}
      );
      return response;
   } catch (error) {
      logger.error("convertXMLtoJson ->" + error);
      return null;
   }
};
