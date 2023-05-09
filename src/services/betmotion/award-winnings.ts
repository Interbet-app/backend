import axios from "axios";
import { convertXMLtoJson } from "../../utils/xml";
import logger from "../../log";

interface XMLBody {
   userToken: string;
   transactionId: number;
   betId: number;
   amount: number;
   gameName: string;
}

interface Response {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
}

const xmlBody = ({ userToken, transactionId, betId, amount, gameName }: XMLBody) => `<PKT>
<Method Name="AwardWinnings">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken}" />
    <TransactionID Type="int" Value="${transactionId}" />
    <WinAmount Type="int" Value="${amount}" />
    <WinReferenceNum Type="string" Value="${betId}" />
    <GameReference Type="string" Value="${gameName}" />
    <BetMode Type="string" Value="Live" />
    <Description Type="string" Value="Live bet (Multiple)" />
    <ExternalUserID Type="string" Value="asdasd" />
    <FrontendType Type="int" Value="4" />
    <BetStatus Type="string" Value="S" />
    <SportIDs Type="string" Value="1" />
  </Params>
</Method>
</PKT>`;

export async function awardWinnings(betId: number, userId: string, amount: number, gameName: string) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";
   try {
      const xml = xmlBody({
         userToken: userId + "-inter_bet_game-1680806812759",
         transactionId: new Date().valueOf(),
         betId,
         amount,
         gameName,
      });

      const response = await axios.post(endpoint, xml, {
         headers: { "Content-Type": "text/xml" },
      });

      logger.info("awardWinnings xml send->" + xml);
      logger.info("awardWinnings response ->" + JSON.stringify(response.data));

      const convertedXML = convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as Response;
      logger.info("awardWinnings extract from xml ->" + JSON.stringify(convertedXML));
      return convertedXML;
   } catch (error) {
      logger.info("awardWinnings error ->" + error);
   }
}
