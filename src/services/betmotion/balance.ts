import Betmotion from "./api";
import { convertXMLtoJson } from "../../utils/xml";
import logger from "../../log";

interface IBalanceResponse {
   token: string;
   currency: string;
   externalUserID: string;
   balance: string;
   Success: string;
}

//? XML para obter o saldo do usuário
const XmlParse = (userToken: string) => `<PKT>
<Method Name="GetBalance">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken}" />
    <ExternalUserID Type="string" Value="inter_bet" />
    <SiteId Type="string" Value="5" />
  </Params>
</Method>
</PKT>`;

export async function GetBalance(userToken: string) {
   try {
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlParse(userToken));
      
      logger.info("BetmotionGetBalance ->" + JSON.stringify(response.data));
      return convertXMLtoJson(response.data, ["token", "balance", "currency", "externalUserID", "Success"]) as IBalanceResponse;

   } catch (error) {
      logger.error("BetmotionGetBalance ->" + error);
   }
}

