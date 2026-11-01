const applicationService = require("../services/applicationService");

const createApplication = async (req, res) => {
  try {
    const application = await applicationService.createApplication(
      req.body,
      req.session.userId,
    );

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await applicationService.getApplications();
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getApplicationById = async (req, res) => {
  try {
    const id = req.params.id;
    const application = await applicationService.getApplicationbyId(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateApplication = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const application = await applicationService.updateApplication(
      id,
      updateData,
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteApplication = async (req, res) => {
  try {
    const id = req.params.id;

    const application = await applicationService.deleteApplication(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
