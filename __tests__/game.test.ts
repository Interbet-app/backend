import { describe, it, expect, beforeAll } from "@jest/globals";
import api from "../src/api";
import request from "supertest";
import { events } from "../src/models";

let token: string;
let gameId: number;
let event: any;

beforeAll(async () => {
   const response = await request(api).post("/dashboard/signin").send({
      username: "root",
      password: "ibm2023",
   });
   expect(response.status).toBe(200);
   expect(response.body).toHaveProperty("token");
   token = response.body.token;
   event = await events.findAll();
});

describe("Admin -> create new game", () => {
   it("should admin create new game", async () => {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      const game = {
         eventId: event[0].id,
         name: "Teste Cases",
         startDate: start,
         winnerCommission: 0,
         status: "open",
         modality: "futsal",
         location: "Test Street",
      };

      const response = await request(api).post("/games").set("Authorization", `${token}`).send(game);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("startDate");
      expect(response.body).toHaveProperty("winnerCommission");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("modality");
      expect(response.body).toHaveProperty("createdAt");
       expect(response.body).toHaveProperty("updatedAt");
       
       gameId = response.body.id;
   });
});

describe("User -> game details", () => {
    it("should user get game details", async () => {
        const response = await request(api).get(`/games/${gameId}`).set("Authorization", `${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("startDate");
        expect(response.body).toHaveProperty("winnerCommission");
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("modality");
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("updatedAt");
    });
});

describe("Admin -> delete game", () => {
    it("should admin delete game", async () => {
        const response = await request(api).delete(`/games/${gameId}`).set("Authorization", `${token}`);
        expect(response.status).toBe(204);
    });
});
