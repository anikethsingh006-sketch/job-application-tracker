const Application = require("../models/Application");

async function createApplication(applicationData, ownerId) {
  // Application.create() validates the data against our Mongoose schema and saves the document to MongoDB.
  // it retiurns athe saved document object with all id,etc
  const application = await Application.create({
    ...applicationData,
    ownerId,
  });
  return application;
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
  return await Application.findOneAndUpdate({ _id: id, ownerId }, data, {
    new: true,
    runValidators: true,
  });
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
