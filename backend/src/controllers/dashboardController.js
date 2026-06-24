const Url = require('../models/Url');
const HealthCheck = require('../models/HealthCheck');

/**
 * @desc    Get dashboard metrics (all monitored URLs with their latest health check)
 * @route   GET /api/dashboard
 * @access  Public
 */
const getDashboard = async (req, res) => {
  try {
    const dashboardData = await Url.aggregate([
      {
        $lookup: {
          from: 'healthchecks',
          let: { urlId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$urlId', '$$urlId'] } } },
            { $sort: { checkedAt: -1 } },
            { $limit: 1 }
          ],
          as: 'latestCheck'
        }
      },
      {
        $unwind: {
          path: '$latestCheck',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          url: 1,
          status: {
            $cond: {
              if: { $eq: [{ $ifNull: ['$latestCheck', null] }, null] },
              then: 'PENDING',
              else: {
                $cond: {
                  if: '$latestCheck.isUp',
                  then: 'UP',
                  else: 'DOWN'
                }
              }
            }
          },
          statusCode: { $ifNull: ['$latestCheck.statusCode', null] },
          responseTime: { $ifNull: ['$latestCheck.responseTime', null] },
          lastChecked: { $ifNull: ['$latestCheck.checkedAt', null] }
        }
      }
    ]);

    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard
};
