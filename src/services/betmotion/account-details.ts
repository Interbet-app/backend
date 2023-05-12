import Betmotion from "./api";
import { checkStatusOfRequest, convertXMLtoJson } from "../../utils/xml";
import logger from "../../log";

interface IAccountDetails {
   token: string;
   loginName: string;
   currency: string;
   country: string;
   externalUserType: string;
   externalUserID: string;
   affiliationPath: string;
}

const XmlTemplate = (token: string) => `<PKT>
<Method Name="GetAccountDetails">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${token}" />
    <SiteId Type="string" Value="5" />
  </Params>
</Method>
</PKT>`;

export async function AccountDetails(token: string) {
   try {
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlTemplate(token));
      if (!checkStatusOfRequest(response.data).ok) return null;

      const convertedXML = convertXMLtoJson(response.data, [
         "token",
         "loginName",
         "currency",
         "externalUserID",
         "externalUserType",
         "country",
         "affiliationPath",
      ]) as IAccountDetails;

      return convertedXML;
   } catch (error) {
      logger.error("BetmotionAccountDetails ->" + error);
   }
}
