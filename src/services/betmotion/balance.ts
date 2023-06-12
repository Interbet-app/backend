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

export async function GetBalance(userToken: string): Promise<IBalanceResponse | null> {
   try {
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlParse(userToken));
      return convertXMLtoJson(response.data, ["token", "balance", "currency", "externalUserID", "Success"]) as IBalanceResponse | null;
   } catch (error) {
      logger.error("BetmotionGetBalance ->" + error);
      return null;
   }
}
