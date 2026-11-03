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

async function getApplications(req, res) {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      sort: req.query.sort || "newest",
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const result = await applicationService.getApplications(
      req.session.userId,
      filters,
    );

    return res.status(200).json({
      success: true,
      data: result.applications,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
const getApplicationById = async (req, res) => {
  try {
    const id = req.params.id;
    const application = await applicationService.getApplicationbyId(
      id,
      req.session.userId,
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
      req.session.userId,
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

    const application = await applicationService.deleteApplication(
      id,
      req.session.userId,
    );

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
async function createInterview(req, res) {
  try {
    const application = await applicationService.addInterview(
      req.params.id,
      req.session.userId,
      req.body,
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Interview added successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function updateInterview(req, res) {
  try {
    const application = await applicationService.updateInterview(
      req.params.id,
      req.params.interviewId,
      req.session.userId,
      req.body,
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application or interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function deleteInterview(req, res) {
  try {
    const application = await applicationService.deleteInterview(
      req.params.id,
      req.params.interviewId,
      req.session.userId,
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application or interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  createInterview,
  updateInterview,
  deleteInterview,
};
