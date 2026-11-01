import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

async function createAuthenticatedAgent(email) {
  const agent = request.agent(app);

  await agent.post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "password123",
  });

  await agent.post("/api/auth/login").send({
    email,
    password: "password123",
  });

  return agent;
}

describe("Application API", () => {
  it("should reject an application without a company name", async () => {
    const agent = await createAuthenticatedAgent("validation@example.com");

    const response = await agent.post("/api/applications").send({
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
    const agent = await createAuthenticatedAgent("single@example.com");

    const createResponse = await agent.post("/api/applications").send({
      company: "Amazon",
      role: "SDE Intern",
      status: "Applied",
    });

    expect(createResponse.status).toBe(201);

    const applicationId = createResponse.body.data._id;

    const response = await agent.get(`/api/applications/${applicationId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(applicationId);
    expect(response.body.data.company).toBe("Amazon");
    expect(response.body.data.role).toBe("SDE Intern");
  });

  it("should retrieve all applications belonging to the user", async () => {
    const agent = await createAuthenticatedAgent("list@example.com");

    await agent.post("/api/applications").send({
      company: "Microsoft",
      role: "Data Scientist",
      status: "Applied",
    });

    const response = await agent.get("/api/applications");

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
    const agent = await createAuthenticatedAgent("create@example.com");

    const response = await agent.post("/api/applications").send({
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
    const agent = await createAuthenticatedAgent("status@example.com");

    const response = await agent.post("/api/applications").send({
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
    const agent = await createAuthenticatedAgent("invalidid@example.com");

    const response = await agent.get("/api/applications/not-a-valid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid application ID");
  });

  it("should return 404 when an application does not exist", async () => {
    const agent = await createAuthenticatedAgent("missing@example.com");

    const response = await agent.get(
      "/api/applications/507f1f77bcf86cd799439011",
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
