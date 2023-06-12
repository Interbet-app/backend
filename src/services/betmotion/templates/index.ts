export interface IPlaceBet {
   userToken: string;
   amount: number;
   betId: number;
   gameId: number;
   oddValue: number;
}

export interface IBetLoss {
   userToken: string;
   betId: number;
   gameName: string;
}

export interface IBetWinner {
   userToken: string;
   betId: number;
   amount: number;
   gameName?: string;
}

//? XML para informar uma aposta realizada pelo usuário
export const XmlPlaceBet = ({ userToken, amount, betId, gameId, oddValue }: IPlaceBet) => `<PKT>
  <Method Name="PlaceBet">
    <Auth Login="" Password="" />
    <Params>
      <Token Type="string" Value="${userToken + new Date().valueOf()}" /> //? timestamp da hora ddo envio
      <TransactionID Type="int" Value="${new Date().valueOf()}" />
      <BetAmount Type="int" Value="${(amount * 100).toFixed(0)}" />
      <BetReferenceNum Type="string" Value="${betId}" />
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

//? XML para informar o resultado de uma aposta perdida
export const XmlBetLoss = ({ userToken, betId, gameName }: IBetLoss) => `<PKT>
<Method Name="LossSignal">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken + new Date().valueOf()}" />
      <TransactionID Type="int" Value="${new Date().valueOf()}" />
      <BetAmount Type="int" Value="0" />
      <BetReferenceNum Type="string" Value="${betId}" /> //? id da aposta na tabela de bets
      <GameReference Type="string" Value="${gameName}" />
      <BetMode Type="string" Value="Live" />
      <Description Type="string" Value="${gameName}" />
      <ExternalUserID Type="string" Value="ABC123456" />
      <FrontendType Type="int" Value="2" />
      <BetStatus Type="string" Value="N" />
      <SportIDs Type="string" Value="1" />
      <SiteId Type="string" Value="5" />
      </Params>
</Method>
</PKT>`;

//? XML para informar o resultado de uma aposta ganhadora
export const XmlBetWinner = ({ userToken, betId, amount, gameName }: IBetWinner) => `<PKT>
<Method Name="AwardWinnings">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken + new Date().valueOf()}" />
    <TransactionID Type="int" Value="${new Date().valueOf()}" />
    <WinAmount Type="int" Value="${(amount * 100).toFixed(0)}" />
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

//? XML para informar o cancelamento de uma aposta
export const XmlRefundBet = ({ userToken, amount, betId, gameName }: IBetWinner) => `<PKT>
  <Method Name="RefundBet">
    <Auth Login="" Password="" />
    <Params>
      <Token Type="string" Value="${userToken + new Date().valueOf()}" />
      <SiteId Type="string" Value="5" />
      <TransactionID Type="int" Value="${new Date().valueOf()}" />
      <BetReferenceNum Type="string" Value="${betId}" />
      <RefundAmount Type="int" Value="${(amount * 100).toFixed(0)}" />
      <GameReference Type="string" Value="INTER_BET_GAMES" />
      <BetMode Type="string" Value="Live" />
      <Description Type="string" Value="${gameName}" />
      <ExternalUserID Type="string" Value="inter_bet" />
      <FrontendType Type="int" Value="0" />
      <BetStatus Type="string" Value="A" />
      <SportIDs Type="string" Value="66" />
    </Params>
  </Method>
</PKT>`;

//? XML para informar uma deposito
export const XmlNewCredit = ({ userToken, amount, betId }: IBetWinner) => `<PKT>
<Method Name="NewCredit">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken + new Date().valueOf()}" />
    <SiteId Type="string" Value="5" />
    <TransactionID Type="int" Value="${new Date().valueOf()}" />
    <NewCreditReferenceNum Type="string" Value="${betId}" />
    <NewCreditAmount Type="int" Value="${(amount * 100).toFixed(0)}" />
    <GameReference Type="string" Value="INTER_BET_GAMES" />
    <BetMode Type="string" Value="Live" />
    <Description Type="string" Value="Live bet (Multiple)" />
    <ExternalUserID Type="string" Value="inter_bet" />
    <FrontendType Type="int" Value="0" />
    <BetStatus Type="string" Value="S" />
    <SportIDs Type="string" Value="66" />
    <ClientIP Type="string" Value="2804:30c:a15:7700:992e:79a:127d:cbe6" />
  </Params>
</Method>
</PKT>`;

//? XML para informar uma retirada
export const XmlNewDebit = ({ userToken, amount, betId }: IBetWinner) => `<PKT>
<Method Name="NewDebit">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken + new Date().valueOf()}" />
    <SiteId Type="string" Value="5" />
    <TransactionID Type="int" Value="${new Date().valueOf()}" />
    <NewDebitReferenceNum Type="string" Value="${betId}" />
    <NewDebitAmount Type="int" Value="${(amount * 100).toFixed(0)}" />
    <GameReference Type="string" Value="INTER_BET_GAMES" />
    <BetMode Type="string" Value="Live" />
    <Description Type="string" Value="Live bet (Multiple)" />
    <ExternalUserID Type="string" Value="inter_bet" />
    <FrontendType Type="int" Value="0" />
    <BetStatus Type="string" Value="S" />
    <SportIDs Type="string" Value="66" />
    <ClientIP Type="string" Value="2804:30c:a15:7700:992e:79a:127d:cbe6" />
  </Params>
</Method>
</PKT>`;

export const XmlCashOutBet = ({userToken, amount, betId} : IBetWinner) => `<PKT>
<Method Name="CashoutBet">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken + new Date().valueOf()}" />
    <TransactionID Type="int" Value="${new Date().valueOf()}" />
    <CashoutAmount Type="int" Value="${(amount * 100).toFixed(0)}" />
    <BetReferenceNum Type="string" Value="${betId}" />
    <GameReference Type="string" Value="SPORTSBOOK2.0" />
    <BetMode Type="string" Value="PreLive" />
    <Description Type="string" Value="Everton FC vs. Stoke City: 1" />
    <ExternalUserID Type="string" Value="P172900" />
    <FrontendType Type="int" Value="2" />
    <BetStatus Type="string" Value="T" />
    <SportIDs Type="string" Value="1" />
    <SiteId Type="string" Value="5" />
  </Params>
</Method>
</PKT>`