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
module.exports = {
  createApplication,
  getApplications,
  getApplicationbyId,
  updateApplication,
  deleteApplication,
};
