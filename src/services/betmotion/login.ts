import Betmotion from "./api";
import logger from "../../log";

type ISignInResponse = {
   token: string | null;
};
const BETMOTION_GAME_ID = process.env.BETMOTION_GAME_ID as string;
export async function SignIn(token: string): Promise<ISignInResponse> {
   try {
      const res = await Betmotion.post(
         "/games/start.do",
         {
            id: BETMOTION_GAME_ID,
            mode: "REAL",
            platform: "DESKTOP",
            language: "BR",
         },
         {
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
         }
      );

      return res.data;
   } catch (error) {
      logger.error("BetmotionSignIn ->" + error);
      return { token: null };
   }
}
