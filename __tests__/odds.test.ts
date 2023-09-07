import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import api from "../src/api";
import request from "supertest";
import { teams, games, events, IGameModel } from "../src/models";

let token: string;
let game: IGameModel;
let OddId: number;
let team: any;

beforeAll(async () => {
   const response = await request(api).post("/dashboard/signin").send({
      username: "root",
      password: "ibm2023",
   });
   expect(response.status).toBe(200);
   expect(response.body).toHaveProperty("token");
   token = response.body.token;
   team = await teams.findAll();
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

afterAll(async () => {
   await games.destroy({ where: { id: game.id } });
});

describe("Admin -> create game odd", () => {
   it("should admin create game odd", async () => {
      const odd = {
         gameId: game.id,
         teamId: team[0].id,
         name: "Test case odd 1",
         payout: 1.5,
         maxBetAmount: 500,
         offer: false,
         status: "open",
      };

      const response = await request(api).post("/odds").set("Authorization", `${token}`).send(odd);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("gameId");
      expect(response.body).toHaveProperty("createdAt");

      OddId = response.body.id;
   });
});

describe("Admin -> update game odd", () => {
   it("should admin update game odd", async () => {
      const response = await request(api).put("/odds").set("Authorization", `${token}`).send({
         oddId: OddId,
         gameId: game.id,
         teamId: team[0].id,
         name: "Test case update odd 1",
         payout: 1.6,
         maxBetAmount: 1000,
         offer: false,
         status: "open",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("gameId");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
      expect(response.body.payout).toBe(1.6);
      expect(response.body.maxBetAmount).toBe(1000);
   });
});

describe("User -> get game odds", () => {
   it("should user get game odds", async () => {
      const response = await request(api).get(`/odds/game/${game.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("odds");
      expect(response.body.odds).toBeInstanceOf(Array);
      expect(response.body.odds[0].id).toBe(OddId);
   });
});

describe("User -> get odd", () => {
   it("should user get odd", async () => {
      const response = await request(api).get(`/odds/${OddId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
   });
});

describe("Admin -> delete game odd", () => {
   it("should admin delete game odd", async () => {
      const response = await request(api).delete(`/odds/${OddId}`).set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
   });
});
