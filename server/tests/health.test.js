const request = require("supertest");
const app = require("../server");

describe("Health API integration test", () => {
  test("GET /api/health returns API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("FastTrans API is healthy");
  });
});