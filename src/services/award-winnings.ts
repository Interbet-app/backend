import axios from "axios";
import { convertXMLtoJson } from "../utils/xml";
import { String } from "aws-sdk/clients/acm";

interface XMLBody {
   userToken: string;
   transactionId: number;
   betId: string;
   amount: string;
}

interface Response {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
}

const xmlBody = ({ userToken, transactionId, betId, amount }: XMLBody) => `<PKT>
<Method Name="AwardWinnings">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken}" />
    <TransactionID Type="int" Value="${transactionId}" />
    <WinAmount Type="int" Value="${amount}" />
    <WinReferenceNum Type="string" Value="${betId}" />
    <GameReference Type="string" Value="INTER_BET_GAMES" />
    <BetMode Type="string" Value="Live" />
    <Description Type="string" Value="Live bet (Multiple)" />
    <ExternalUserID Type="string" Value="asdasd" />
    <FrontendType Type="int" Value="4" />
    <BetStatus Type="string" Value="S" />
    <SportIDs Type="string" Value="1" />
  </Params>
</Method>
</PKT>`;

export async function awardWinnings(betId : string, userId: string, amount: string) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";
   try {
      const response = await axios.post(
         endpoint,
         xmlBody({
            userToken: userId + "-inter_bet_game-1680806812759",
            transactionId: new Date().valueOf(),
            betId,
            amount
         }),
         {
            headers: { "Content-Type": "text/xml" },
         }
      );

      const convertedXML = convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as Response;
         console.log(convertedXML)
      return convertedXML;
   } catch (error) {
      console.log(error);
   }
}

