import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
const User = require("../src/models/User");

describe("POST /api/auth/register", () => {
  it("should register a user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Aniketh",
      email: "aniketh@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Aniketh");
    expect(response.body.data.email).toBe("aniketh@example.com");
    expect(response.body.data.password).toBeUndefined();

    const user = await User.findOne({
      email: "aniketh@example.com",
    }).select("+password");

    expect(user).not.toBeNull();
    expect(user.password).not.toBe("password123");
  });

  it("should reject registration with an invalid email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Aniketh",
      email: "invalid-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject a password shorter than 8 characters", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Aniketh",
      email: "aniketh2@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject an already registered email", async () => {
    const user = await User.create({
      name: "Existing User",
      email: "existing@example.com",
      password: "some-hashed-password",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: user.email,
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Email is already registered");
  });
});

describe("POST /api/auth/login", () => {
  it("should login successfully with correct credentials", async () => {
    // Register a user first
    await request(app).post("/api/auth/register").send({
      name: "Aniketh",
      email: "login@example.com",
      password: "password123",
    });

    // Attempt login
    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe("login@example.com");
    expect(response.body.data.password).toBeUndefined();
  });

  it("should reject an incorrect password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Aniketh",
      email: "wrong-password@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "wrong-password@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should reject a user who does not exist", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "unknown@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });
});
