import { games} from "../models";

export async function CloseGames() {
   try {
      const jogos = await games.findAll({ where: { status: "open" } });
      jogos.forEach(async (jogo) => {
         if (jogo.startDate < new Date()) {
            jogo.status = "pendent";
            jogo.updatedAt = new Date();
            await jogo.save();
         }
      });
   } catch (error) {
      console.log(error);
   }
}

