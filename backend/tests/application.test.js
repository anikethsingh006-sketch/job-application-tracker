import { describe, it, expect, beforeEach } from "vitest";
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
  it("should prevent a user from deleting another user's application", async () => {
    const userA = await createAuthenticatedAgent("deleteA@example.com");
    const userB = await createAuthenticatedAgent("deleteB@example.com");

    const createResponse = await userA.post("/api/applications").send({
      company: "Microsoft",
      role: "SDE Intern",
    });

    const applicationId = createResponse.body.data._id;

    const response = await userB.delete(`/api/applications/${applicationId}`);

    expect(response.status).toBe(404);

    // Verify User A's application still exists
    const ownerResponse = await userA.get(`/api/applications/${applicationId}`);

    expect(ownerResponse.status).toBe(200);
    expect(ownerResponse.body.data.company).toBe("Microsoft");
  });
  it("should prevent a user from accessing another user's application", async () => {
    const userA = await createAuthenticatedAgent("userA@example.com");
    const userB = await createAuthenticatedAgent("userB@example.com");

    const createResponse = await userA.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    const applicationId = createResponse.body.data._id;

    const response = await userB.get(`/api/applications/${applicationId}`);

    expect(response.status).toBe(404);
  });
  it("should prevent a user from updating another user's application", async () => {
    const userA = await createAuthenticatedAgent("updateA@example.com");
    const userB = await createAuthenticatedAgent("updateB@example.com");

    const createResponse = await userA.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    const applicationId = createResponse.body.data._id;

    const response = await userB
      .put(`/api/applications/${applicationId}`)
      .send({
        company: "Amazon",
      });

    expect(response.status).toBe(404);
  });
  it("should only return applications belonging to the logged-in user", async () => {
    const userA = await createAuthenticatedAgent("listA@example.com");
    const userB = await createAuthenticatedAgent("listB@example.com");

    await userA.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    await userB.post("/api/applications").send({
      company: "Amazon",
      role: "SDE Intern",
    });

    const response = await userA.get("/api/applications");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].company).toBe("Google");
  });
  it("should not allow users to spoof ownerId", async () => {
    const userA = await createAuthenticatedAgent("spoofA@example.com");
    const userB = await createAuthenticatedAgent("spoofB@example.com");

    const userBMe = await userB.get("/api/auth/me");
    const userBId = userBMe.body.data.id;

    const response = await userA.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
      ownerId: userBId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.ownerId).not.toBe(userBId);
  });
  it("should reject unauthenticated requests to application routes", async () => {
    const applicationId = "507f1f77bcf86cd799439011";

    // GET all applications
    const getAllResponse = await request(app).get("/api/applications");

    // GET a single application
    const getOneResponse = await request(app).get(
      `/api/applications/${applicationId}`,
    );

    // CREATE an application
    const createResponse = await request(app).post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    // UPDATE an application
    const updateResponse = await request(app)
      .put(`/api/applications/${applicationId}`)
      .send({
        company: "Amazon",
      });

    // DELETE an application
    const deleteResponse = await request(app).delete(
      `/api/applications/${applicationId}`,
    );

    expect(getAllResponse.status).toBe(401);
    expect(getOneResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
    expect(updateResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
  });
  it("should allow a user to update their own application", async () => {
    const agent = await createAuthenticatedAgent("ownupdate@example.com");

    const createResponse = await agent.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    const applicationId = createResponse.body.data._id;

    const updateResponse = await agent
      .put(`/api/applications/${applicationId}`)
      .send({
        company: "Google India",
        status: "Interview",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.company).toBe("Google India");
    expect(updateResponse.body.data.status).toBe("Interview");
  });
  it("should allow a user to delete their own application", async () => {
    const agent = await createAuthenticatedAgent("owndelete@example.com");

    const createResponse = await agent.post("/api/applications").send({
      company: "Microsoft",
      role: "SDE Intern",
    });

    const applicationId = createResponse.body.data._id;

    const deleteResponse = await agent.delete(
      `/api/applications/${applicationId}`,
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Verify that the application no longer exists
    const getResponse = await agent.get(`/api/applications/${applicationId}`);

    expect(getResponse.status).toBe(404);
  });
  it("should record status changes in application history", async () => {
    const agent = await createAuthenticatedAgent("history@example.com");

    const createResponse = await agent.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
      status: "Applied",
    });

    expect(createResponse.status).toBe(201);

    const applicationId = createResponse.body.data._id;

    const updateResponse = await agent
      .put(`/api/applications/${applicationId}`)
      .send({
        status: "Interview",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe("Interview");

    expect(updateResponse.body.data.statusEvents).toHaveLength(2);

    expect(updateResponse.body.data.statusEvents[0].status).toBe("Applied");
    expect(updateResponse.body.data.statusEvents[1].status).toBe("Interview");
  });
  it("should not add a status event when the status remains unchanged", async () => {
    const agent = await createAuthenticatedAgent("same-status@example.com");

    const createResponse = await agent.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
      status: "Applied",
    });

    const applicationId = createResponse.body.data._id;

    const updateResponse = await agent
      .put(`/api/applications/${applicationId}`)
      .send({
        company: "Google India",
        status: "Applied",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.company).toBe("Google India");
    expect(updateResponse.body.data.statusEvents).toHaveLength(1);
  });
  it("should prevent users from changing application ownership", async () => {
    const userA = await createAuthenticatedAgent("ownerA@example.com");
    const userB = await createAuthenticatedAgent("ownerB@example.com");

    const userBResponse = await userB.get("/api/auth/me");
    const userBId = userBResponse.body.data.id;

    const createResponse = await userA.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    const applicationId = createResponse.body.data._id;

    // User A attempts to transfer ownership to User B
    const updateResponse = await userA
      .put(`/api/applications/${applicationId}`)
      .send({
        ownerId: userBId,
      });

    expect(updateResponse.status).toBe(200);

    // User A should still own and access the application
    const ownerResponse = await userA.get(`/api/applications/${applicationId}`);

    expect(ownerResponse.status).toBe(200);

    // User B must not gain access
    const otherUserResponse = await userB.get(
      `/api/applications/${applicationId}`,
    );

    expect(otherUserResponse.status).toBe(404);
  });
});

describe("Interview API", () => {
  it("should add an interview successfully", async () => {
    const agent = await createAuthenticatedAgent("interview1@example.com");

    const created = await agent.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    const response = await agent
      .post(`/api/applications/${created.body.data._id}/interviews`)
      .send({
        round: "Technical Round 1",
        type: "Video",
        scheduledAt: "2026-11-10T10:00:00.000Z",
        durationMinutes: 60,
        meetingLink: "https://meet.google.com/abc",
        notes: "Prepare DSA questions",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.interviews).toHaveLength(1);
    expect(response.body.data.interviews[0].round).toBe("Technical Round 1");
  });

  it("should reject invalid interview data", async () => {
    const agent = await createAuthenticatedAgent("interview2@example.com");

    const created = await agent.post("/api/applications").send({
      company: "Amazon",
      role: "SDE",
    });

    const response = await agent
      .post(`/api/applications/${created.body.data._id}/interviews`)
      .send({
        round: "",
        type: "Gaming",
        scheduledAt: "not-a-date",
        durationMinutes: -10,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("should update an interview successfully", async () => {
    const agent = await createAuthenticatedAgent("interview3@example.com");

    const created = await agent.post("/api/applications").send({
      company: "Microsoft",
      role: "SDE Intern",
    });

    const applicationId = created.body.data._id;

    const added = await agent
      .post(`/api/applications/${applicationId}/interviews`)
      .send({
        round: "Technical Round 1",
        scheduledAt: "2026-11-10T10:00:00.000Z",
      });

    const interviewId = added.body.data.interviews[0]._id;

    const response = await agent
      .put(`/api/applications/${applicationId}/interviews/${interviewId}`)
      .send({
        outcome: "Passed",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.interviews[0].outcome).toBe("Passed");
  });

  it("should reject invalid interview update data", async () => {
    const agent = await createAuthenticatedAgent("interview4@example.com");

    const created = await agent.post("/api/applications").send({
      company: "Amazon",
      role: "SDE",
    });

    const applicationId = created.body.data._id;

    const added = await agent
      .post(`/api/applications/${applicationId}/interviews`)
      .send({
        round: "HR Round",
        scheduledAt: "2026-11-10T10:00:00.000Z",
      });

    const interviewId = added.body.data.interviews[0]._id;

    const response = await agent
      .put(`/api/applications/${applicationId}/interviews/${interviewId}`)
      .send({
        outcome: "Selected Immediately",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should prevent a user from updating another user's interview", async () => {
    const userA = await createAuthenticatedAgent("interview5a@example.com");
    const userB = await createAuthenticatedAgent("interview5b@example.com");

    const created = await userA.post("/api/applications").send({
      company: "Google",
      role: "SDE",
    });

    const applicationId = created.body.data._id;

    const added = await userA
      .post(`/api/applications/${applicationId}/interviews`)
      .send({
        round: "Technical Round",
        scheduledAt: "2026-11-10T10:00:00.000Z",
      });

    const interviewId = added.body.data.interviews[0]._id;

    const response = await userB
      .put(`/api/applications/${applicationId}/interviews/${interviewId}`)
      .send({
        outcome: "Passed",
      });

    expect(response.status).toBe(404);
  });

  it("should reject an invalid interview ID", async () => {
    const agent = await createAuthenticatedAgent("interview6@example.com");

    const created = await agent.post("/api/applications").send({
      company: "Google",
      role: "SDE",
    });

    const response = await agent
      .put(`/api/applications/${created.body.data._id}/interviews/invalid-id`)
      .send({
        outcome: "Passed",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid interview ID");
  });

  it("should reject unauthenticated interview requests", async () => {
    const response = await request(app)
      .post("/api/applications/507f1f77bcf86cd799439011/interviews")
      .send({
        round: "Technical Round",
        scheduledAt: "2026-11-10T10:00:00.000Z",
      });

    expect(response.status).toBe(401);
  });
});

describe("Delete Interview API", () => {
  let agent;
  let applicationId;
  let interviewId;

  beforeEach(async () => {
    agent = await createAuthenticatedAgent(
      `delete-interview-${Date.now()}-${Math.random()}@test.com`,
    );

    const appResponse = await agent.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
    });

    applicationId = appResponse.body.data._id;

    const interviewResponse = await agent
      .post(`/api/applications/${applicationId}/interviews`)
      .send({
        round: "Technical Round",
        scheduledAt: "2026-12-10T10:00:00.000Z",
      });

    interviewId = interviewResponse.body.data.interviews[0]._id;
  });

  it("should delete an interview successfully", async () => {
    const response = await agent.delete(
      `/api/applications/${applicationId}/interviews/${interviewId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.interviews).toHaveLength(0);
  });

  it("should return 404 if the interview does not exist", async () => {
    const fakeInterviewId = "507f1f77bcf86cd799439011";

    const response = await agent.delete(
      `/api/applications/${applicationId}/interviews/${fakeInterviewId}`,
    );

    expect(response.status).toBe(404);
  });

  it("should return 404 if the application does not exist", async () => {
    const fakeApplicationId = "507f1f77bcf86cd799439011";

    const response = await agent.delete(
      `/api/applications/${fakeApplicationId}/interviews/${interviewId}`,
    );

    expect(response.status).toBe(404);
  });

  it("should reject an invalid interview ID", async () => {
    const response = await agent.delete(
      `/api/applications/${applicationId}/interviews/invalid-id`,
    );

    expect(response.status).toBe(400);
  });

  it("should reject an unauthenticated request", async () => {
    const response = await request(app).delete(
      `/api/applications/${applicationId}/interviews/${interviewId}`,
    );

    expect(response.status).toBe(401);
  });

  it("should prevent another user from deleting the interview", async () => {
    const anotherAgent = await createAuthenticatedAgent(
      `another-user-${Date.now()}@test.com`,
    );

    const response = await anotherAgent.delete(
      `/api/applications/${applicationId}/interviews/${interviewId}`,
    );

    expect(response.status).toBe(404);

    // Original owner should still have the interview.
    const ownerResponse = await agent.get(`/api/applications/${applicationId}`);

    expect(ownerResponse.body.data.interviews).toHaveLength(1);
  });
});

describe("Application Search, Filtering and Pagination", () => {
  let agent;

  beforeEach(async () => {
    agent = await createAuthenticatedAgent(
      `listing-${Date.now()}-${Math.random()}@test.com`,
    );

    // Create test applications
    await agent.post("/api/applications").send({
      company: "Google",
      role: "Software Engineer",
      status: "Applied",
    });

    await agent.post("/api/applications").send({
      company: "Amazon",
      role: "SDE Intern",
      status: "Interview",
    });

    await agent.post("/api/applications").send({
      company: "Microsoft",
      role: "Data Scientist",
      status: "Applied",
    });

    await agent.post("/api/applications").send({
      company: "Google",
      role: "Data Analyst",
      status: "Rejected",
    });

    await agent.post("/api/applications").send({
      company: "Netflix",
      role: "Backend Engineer",
      status: "Interview",
    });
  });

  it("should search applications by company", async () => {
    const response = await agent.get("/api/applications?search=Google");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((app) => app.company === "Google")).toBe(
      true,
    );
  });

  it("should search applications by role", async () => {
    const response = await agent.get("/api/applications?search=Data Scientist");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].role).toBe("Data Scientist");
  });

  it("should perform case-insensitive search", async () => {
    const response = await agent.get("/api/applications?search=google");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
  });

  it("should filter applications by status", async () => {
    const response = await agent.get("/api/applications?status=Interview");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((app) => app.status === "Interview")).toBe(
      true,
    );
  });

  it("should sort applications by oldest first", async () => {
    const response = await agent.get("/api/applications?sort=oldest");

    expect(response.status).toBe(200);

    const dates = response.body.data.map((app) =>
      new Date(app.createdAt).getTime(),
    );

    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it("should sort applications by newest first by default", async () => {
    const response = await agent.get("/api/applications");

    expect(response.status).toBe(200);

    const dates = response.body.data.map((app) =>
      new Date(app.createdAt).getTime(),
    );

    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("should return the requested page and pagination metadata", async () => {
    const response = await agent.get("/api/applications?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);

    expect(response.body.pagination).toEqual({
      total: 5,
      page: 1,
      limit: 2,
      totalPages: 3,
    });
  });

  it("should return the second page", async () => {
    const response = await agent.get("/api/applications?page=2&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination.page).toBe(2);
  });

  it("should return the remaining records on the last page", async () => {
    const response = await agent.get("/api/applications?page=3&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("should return no records for a page beyond the available pages", async () => {
    const response = await agent.get("/api/applications?page=10&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.pagination.totalPages).toBe(3);
  });

  it("should combine search, status filtering and pagination", async () => {
    const response = await agent.get(
      "/api/applications?search=Engineer&status=Interview&page=1&limit=1",
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].company).toBe("Netflix");
    expect(response.body.data[0].status).toBe("Interview");

    expect(response.body.pagination.total).toBe(1);
  });

  it("should reject an invalid status filter", async () => {
    const response = await agent.get("/api/applications?status=Hired");

    expect(response.status).toBe(400);
  });

  it("should reject an invalid page number", async () => {
    const response = await agent.get("/api/applications?page=0");

    expect(response.status).toBe(400);
  });

  it("should reject an invalid limit", async () => {
    const response = await agent.get("/api/applications?limit=101");

    expect(response.status).toBe(400);
  });

  it("should reject an invalid sort option", async () => {
    const response = await agent.get("/api/applications?sort=random");

    expect(response.status).toBe(400);
  });

  it("should only search applications belonging to the logged-in user", async () => {
    const anotherAgent = await createAuthenticatedAgent(
      `other-${Date.now()}@test.com`,
    );

    await anotherAgent.post("/api/applications").send({
      company: "Google",
      role: "SDE Intern",
      status: "Applied",
    });

    const response = await agent.get("/api/applications?search=Google");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((app) => app.ownerId)).toBe(true);
    expect(response.body.pagination.total).toBe(2);
  });
});
