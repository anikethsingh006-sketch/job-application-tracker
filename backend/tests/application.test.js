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

  it("should retrieve a single application by ID", async () => {
    const createResponse = await request(app).post("/api/applications").send({
      company: "Amazon",
      role: "SDE Intern",
      status: "Applied",
    });

    const applicationId = createResponse.body.data._id;

    const response = await request(app).get(
      `/api/applications/${applicationId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(applicationId);
    expect(response.body.data.company).toBe("Amazon");
    expect(response.body.data.role).toBe("SDE Intern");
  });

  it("should retrieve all applications", async () => {
    // Create an application in the test database first
    await request(app).post("/api/applications").send({
      company: "Microsoft",
      role: "Data Scientist",
      status: "Applied",
    });

    const response = await request(app).get("/api/applications");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          company: "Microsoft",
          role: "Data Scientist",
          status: "Applied",
        }),
      ]),
    );
  });

  it("should create an application successfully", async () => {
    const response = await request(app).post("/api/applications").send({
      company: "Google",
      role: "Software Engineer",
      status: "Applied",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.company).toBe("Google");
    expect(response.body.data.role).toBe("Software Engineer");
    expect(response.body.data.status).toBe("Applied");
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

  it("should reject an invalid application ID", async () => {
    const response = await request(app).get("/api/applications/not-a-valid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid application ID");
  });

  it("should return 404 when an application does not exist", async () => {
    const response = await request(app).get(
      "/api/applications/507f1f77bcf86cd799439011",
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
