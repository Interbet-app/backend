import { describe, it, expect, beforeAll } from "@jest/globals";
import api from "../src/api";
import request from "supertest";

import { events, games, IGameModel, Settings } from "../src/models";

let token: string;
let game: IGameModel;


beforeAll(async () => {
   const response = await request(api).post("/dashboard/signin").send({
      username: "root",
      password: "ibm2023",
   });
   expect(response.status).toBe(200);
   expect(response.body).toHaveProperty("token");
   token = response.body.token;
   const event = await events.findAll();
   const start = new Date();
   start.setDate(start.getDate() + 1);
   game = await games.create({
      eventId: event[0].id!,
      name: "Teste Odd Cases",
      startDate: start,
      winnerCommission: 0,
      status: "open",
      modality: "futsal",
      location: "Test Street",
      createdAt: new Date(),
      updatedAt: new Date(),
   });

});

describe("User -> get all bets", () => {
   it("should return all bets", async () => {
      const response = await request(api).get("/bets").set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("bets");
   });
});

describe("User -> bet on odd whit exceed global amount", () => {
    it("should user bet on odd", async () => {
      const settings = await Settings.findOne({ where: { stage: "development" } });
      const response = await request(api).post("/bets").set("Authorization", `${token}`).send({
         oddId: 1,
         amount: Number(settings?.userMaxBetAmount!) + 1,
      });
      expect(response.status).toBe(400);
   });
});
