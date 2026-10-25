import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("POST /api/applications", () => {
  it("should reject an application without a company name", async () => {
    const response = await request(app).post("/api/applications").send({
      role: "Software Engineer",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "company",
          message: "Company name is required",
        }),
      ]),
    );
  });
  it("should reject an invalid application status", async () => {
    const response = await request(app).post("/api/applications").send({
      company: "Google",
      role: "Software Engineer",
      status: "Flying to Mars",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "status",
          message: "Invalid application status",
        }),
      ]),
    );
  });
});
