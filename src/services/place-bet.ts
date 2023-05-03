import axios from "axios";
import { convertXMLtoJson } from "../utils/xml";

interface XMLBody {
   userToken: string;
   transactionId: number;
   amount: number;
   oddId: number;
   gameId: number;
   oddValue: number;
}

interface Response {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
}

const xmlBody = ({ userToken, amount, transactionId, oddId, gameId, oddValue }: XMLBody) => `<PKT>
  <Method Name="PlaceBet">
    <Auth Login="" Password="" />
    <Params>
      <Token Type="string" Value="${userToken}" />
      <TransactionID Type="int" Value="${transactionId}" />
      <BetAmount Type="int" Value="${amount}" />
      <BetReferenceNum Type="string" Value="${oddId}" />
      <GameReference Type="string" Value="INTER_BET_GAMES" />
      <BetMode Type="string" Value="Live" />
      <Description Type="string" Value="Marek, Wojciech vs. Duncan, Scott: Vencedor: Wojciech Marek" />
      <ExternalUserID Type="string" Value="asdasd" />
      <FrontendType Type="int" Value="4" />
      <BetStatus Type="string" Value="C" />
      <SportIDs Type="string" Value="4" />
      <ClientIP Type="string" Value="187.94.101.82" />
      <Bet>
        <IsSystem Type="bool" Value="false" />
        <EventCount Type="int" Value="1" />
        <BankerCount Type="int" Value="0" />
        <Events Type="string" Value="Marek, Wojciech vs. Duncan, Scott: Vencedor: Wojciech Marek;" />
        <EventList>
          <Event Type="string" Value="Marek, Wojciech vs. Duncan, Scott">
            <EventID Type="int" Value="${gameId}" />
            <CategoryID Type="int" Value="9" />
            <ChampionshipID Type="int" Value="3588" />
            <SportID Type="int" Value="4" />
            <ExtEventID Type="string" Value="sr:match:21370657" />
            <EventDate Type="string" Value="2020-02-18 10:55" />
            <Market Type="string" Value="Vencedor">
              <MarketID Type="string" Value="186" />
              <ExtType Type="string" Value="186/{$COMPETITOR1}" />
              <Outcome Type="string" Value="Wojciech Marek" />
              <Odds Type="double" Value="1.550" />
            </Market>
          </Event>
        </EventList>
        <BetStake Type="int" Value="2000">
          <CombLength Type="int" Value="1" />
          <Winnings Type="int" Value="2000" />
          <MultipleBonus Type="int" Value="0" />
          <Odds Type="double" Value="${oddValue}" />
        </BetStake>
      </Bet>
    </Params>
  </Method>
  </PKT>`;

export async function placeBet({ amount, oddId, gameId, oddValue, userToken }: Omit<XMLBody, "transactionId">) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";
   const amountInCentes = amount * 100;

   try {
      const response = await axios.post(
         endpoint,
         xmlBody({
            amount: amountInCentes,
            userToken,
            transactionId: new Date().valueOf(),
            oddId,
            gameId,
            oddValue,
         }),
         {
            headers: { "Content-Type": "text/xml" },
         }
      );
      const convertedXML = convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as Response;

      return convertedXML;
   } catch (error) {
      console.log(error);
   }
}

