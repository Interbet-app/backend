import { describe, it, expect, beforeAll } from "@jest/globals";
import api from "../src/api";
import request from "supertest";

let token: string;

beforeAll(async () => {
   const response = await request(api).post("/dashboard/signin").send({
      username: "root",
      password: "ibm2023",
   });
   expect(response.status).toBe(200);
   expect(response.body).toHaveProperty("token");
   token = response.body.token;
});

describe("Admin -> get settings", () => {
   it("should admin get api settings", async () => {
      const response = await request(api).get("/dashboard/settings/tests").set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("stage");
      expect(response.body).toHaveProperty("userMaxBetAmount");
   });
});


describe("Admin -> update settings", () => {
   it("should admin update api settings", async () => {
      const response = await request(api).post("/dashboard/settings/tests").set("Authorization", `${token}`).send({
         stage: "tests",
         userMaxBetAmount: 1000,
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("stage");
      expect(response.body).toHaveProperty("userMaxBetAmount");
      expect(response.body.stage).toBe("tests");
      expect(response.body.userMaxBetAmount).toBe(1000);
   });
});
