const Application = require("../models/Application");

async function createApplication(applicationData, ownerId) {
  // Application.create() validates the data against our Mongoose schema and saves the document to MongoDB.
  // it retiurns athe saved document object with all id,etc
  const application = await Application.create({
    ...applicationData,
    applicationData,
  });
  return application;
}
async function getApplications() {
  const applications = await Application.find();
  return applications;
}
async function getApplicationbyId(id) {
  const application = await Application.findById(id);
  return application;
}
async function updateApplication(id, updateData) {
  const application = await Application.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return application;
}
async function deleteApplication(id) {
  const application = await Application.findByIdAndDelete(id);
  return application;
}
module.exports = {
  createApplication,
  getApplications,
  getApplicationbyId,
  updateApplication,
  deleteApplication,
};
