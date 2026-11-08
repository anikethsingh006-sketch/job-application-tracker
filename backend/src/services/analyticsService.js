const mongoose = require("mongoose");
const Application = require("../models/Application");

async function getAnalytics(ownerId) {
  const userId = new mongoose.Types.ObjectId(ownerId);

  // 1. Overview KPIs
  const [overviewResult] = await Application.aggregate([
    { $match: { ownerId: userId } },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        totalInterviews: {
          $sum: { $size: { $ifNull: ["$interviews", []] } },
        },
        totalOffers: {
          $sum: {
            $cond: [{ $eq: ["$status", "Offer"] }, 1, 0],
          },
        },
        respondedApplications: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  ["Online Assessment", "Interview", "Offer", "Rejected"],
                ],
              },
              1,
              0,
            ],
          },
        },
        eligibleApplications: {
          $sum: {
            $cond: [
              {
                $not: [{ $in: ["$status", ["Saved", "Withdrawn"]] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const eligible = overviewResult?.eligibleApplications || 0;
  const responded = overviewResult?.respondedApplications || 0;

  const overview = {
    totalApplications: overviewResult?.totalApplications || 0,
    totalInterviews: overviewResult?.totalInterviews || 0,
    totalOffers: overviewResult?.totalOffers || 0,
    responseRate: eligible
      ? Number(((responded / eligible) * 100).toFixed(1))
      : 0,
  };

  // 2. Status distribution
  const statusDistribution = await Application.aggregate([
    { $match: { ownerId: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  // 3. Application trend: current month + previous 5 months
  const now = new Date();
  const firstMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
  );

  const trendResults = await Application.aggregate([
    {
      $match: {
        ownerId: userId,
        createdAt: { $gte: firstMonth },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const trendMap = new Map(trendResults.map((item) => [item._id, item.count]));

  const applicationTrend = [];

  for (let i = 0; i < 6; i++) {
    const date = new Date(
      Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + i, 1),
    );

    const month = date.toISOString().slice(0, 7);

    applicationTrend.push({
      month,
      count: trendMap.get(month) || 0,
    });
  }

  // 4. Upcoming interviews
  const upcomingInterviews = await Application.aggregate([
    { $match: { ownerId: userId } },
    { $unwind: "$interviews" },
    {
      $match: {
        "interviews.scheduledAt": { $gte: new Date() },
        "interviews.outcome": "Pending",
      },
    },
    { $sort: { "interviews.scheduledAt": 1 } },
    { $limit: 5 },
    {
      $project: {
        _id: "$interviews._id",
        company: 1,
        role: 1,
        round: "$interviews.round",
        type: "$interviews.type",
        scheduledAt: "$interviews.scheduledAt",
      },
    },
  ]);

  // 5. Recent activity: latest applications created
  const recentApplications = await Application.find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("company role status createdAt")
    .lean();

  const recentActivity = recentApplications.map((application) => ({
    id: application._id,
    company: application.company,
    role: application.role,
    status: application.status,
    action: "Application added",
    date: application.createdAt,
  }));

  return {
    overview,
    statusDistribution,
    applicationTrend,
    upcomingInterviews,
    recentActivity,
  };
}

module.exports = { getAnalytics };
