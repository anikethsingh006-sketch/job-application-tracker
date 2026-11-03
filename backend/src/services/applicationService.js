const Application = require("../models/Application");

async function createApplication(data, ownerId) {
  const initialStatus = data.status || "Saved";

  return await Application.create({
    ...data,
    ownerId,
    status: initialStatus,
    statusEvents: [
      {
        status: initialStatus,
        changedAt: new Date(),
      },
    ],
  });
}
async function getApplications(ownerId) {
  const applications = await Application.find({ ownerId });
  return applications;
}
async function getApplicationbyId(id, ownerId) {
  return await Application.findOne({
    _id: id,
    ownerId,
  });
}
async function updateApplication(id, data, ownerId) {
  const application = await Application.findOne({
    _id: id,
    ownerId,
  });

  if (!application) {
    return null;
  }

  if (data.status && data.status !== application.status) {
    application.statusEvents.push({
      status: data.status,
      changedAt: new Date(),
    });
  }

  const allowedFields = [
    "company",
    "role",
    "jobUrl",
    "location",
    "status",
    "appliedDate",
    "notes",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      application[field] = data[field];
    }
  }

  await application.save();

  return application;
}
async function deleteApplication(id, ownerId) {
  return await Application.findOneAndDelete({
    _id: id,
    ownerId,
  });
}
async function addInterview(applicationId, ownerId, interviewData) {
  const application = await Application.findOne({
    _id: applicationId,
    ownerId,
  });

  if (!application) {
    return null;
  }

  application.interviews.push(interviewData);

  await application.save();

  return application;
}
async function updateInterview(
  applicationId,
  interviewId,
  ownerId,
  interviewData,
) {
  const application = await Application.findOne({
    _id: applicationId,
    ownerId,
  });

  if (!application) {
    return null;
  }

  const interview = application.interviews.id(interviewId);

  if (!interview) {
    return null;
  }

  const allowedFields = [
    "round",
    "type",
    "scheduledAt",
    "durationMinutes",
    "meetingLink",
    "location",
    "notes",
    "outcome",
  ];

  for (const field of allowedFields) {
    if (interviewData[field] !== undefined) {
      interview[field] = interviewData[field];
    }
  }

  await application.save();

  return application;
}
async function deleteInterview(applicationId, interviewId, ownerId) {
  const application = await Application.findOne({
    _id: applicationId,
    ownerId,
  });

  if (!application) return null;

  const interview = application.interviews.id(interviewId);
  if (!interview) return null;

  interview.deleteOne();

  await application.save();
  return application;
}
module.exports = {
  createApplication,
  getApplications,
  getApplicationbyId,
  updateApplication,
  deleteApplication,
  addInterview,
  updateInterview,
  deleteInterview,
};
