import Lead from '../models/Lead.js';
import mongoose from 'mongoose';

// Valid enum values mirrored from Lead.js schema
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const VALID_SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

// ---------------------------------------------------------------------------
// GET /api/leads
// ---------------------------------------------------------------------------
/**
 * getLeads — Fetch a paginated, filtered, and sorted list of leads belonging to the authenticated user.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {Object} req.query - Query params.
 * @param {string} [req.query.status] - Filter by status. 'All' or omitted means no filter.
 * @param {string} [req.query.search] - Case-insensitive text search on name, company, email.
 * @param {string} [req.query.source] - Filter by lead source (e.g. Website, LinkedIn).
 * @param {string} [req.query.dateFrom] - Start date filter (ISO / parseable date string).
 * @param {string} [req.query.dateTo] - End date filter (ISO / parseable date string).
 * @param {number|string} [req.query.page=1] - Page number.
 * @param {number|string} [req.query.limit=20] - Number of results per page.
 * @param {string} [req.query.sortBy='createdAt'] - Lead schema field to sort by.
 * @param {string} [req.query.sortOrder='desc'] - Sort direction, 'asc' or 'desc'.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Resolves with status 200 and paginated leads array.
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      status,
      search,
      source,
      dateFrom,
      dateTo,
      page      = 1,
      limit     = 20,
      sortBy    = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    // Initialize query filter with owner isolation
    const filter = { owner: req.user._id };

    // Dynamic Filter: status (ignore 'All' or empty values)
    if (status && status !== 'All' && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    // Dynamic Filter: source (ignore 'All' or empty values)
    if (source && source !== 'All' && VALID_SOURCES.includes(source)) {
      filter.source = source;
    }

    // Dynamic Filter: case-insensitive search across name, company, email
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { company: regex },
        { email: regex },
      ];
    }

    // Dynamic Filter: dateFrom / dateTo ranges on createdAt
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Build sorting query
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortDirection };

    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeads] filter:', JSON.stringify(filter), '| sort:', JSON.stringify(sortObj));
    }

    // Run query and count documents in parallel for efficiency
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      count: leads.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1,
      },
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/leads
// ---------------------------------------------------------------------------
/**
 * createLead — Create a new lead for the authenticated user.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {Object} req.body - Lead properties.
 * @param {string} req.body.name - Full name.
 * @param {string} req.body.company - Company name.
 * @param {string} req.body.email - Email address.
 * @param {string} [req.body.phone] - Phone number.
 * @param {string} [req.body.status='New'] - Pipeline status.
 * @param {string} [req.body.source='Website'] - Source.
 * @param {string} [req.body.notes] - Narrative notes.
 * @param {number} [req.body.value=0] - Estimated value of the deal.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with status 201 and new lead document.
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes, value } = req.body;

    if (process.env.NODE_ENV === 'development') {
      console.log('[createLead] user:', req.user._id, '| email:', email);
    }

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status,
      source,
      notes,
      value: value !== undefined ? Number(value) : 0,
      owner: req.user._id, // Enforce ownership on creation
    });

    return res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/leads/:id
// ---------------------------------------------------------------------------
/**
 * getLeadById — Fetch a single lead by ID.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with status 200 and lead document.
 */
export const getLeadById = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeadById] id:', req.params.id, '| user:', req.user._id);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user._id, // Owner isolation
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/leads/:id
// ---------------------------------------------------------------------------
/**
 * updateLead — Update any allowed fields on a lead.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with status 200 and updated lead document.
 */
export const updateLead = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[updateLead] id:', req.params.id, '| body:', JSON.stringify(req.body));
    }

    // Prevent caller from hijacking ownership
    const { owner, ...updateFields } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/leads/:id/status
// ---------------------------------------------------------------------------
/**
 * updateLeadStatus — Quickly update only the status of a lead.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with status 200 and updated lead document.
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[updateLeadStatus] id:', req.params.id, '| status:', status);
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/leads/:id
// ---------------------------------------------------------------------------
/**
 * deleteLead — Permanently delete a lead.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with status 200.
 */
export const deleteLead = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[deleteLead] id:', req.params.id, '| user:', req.user._id);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    await lead.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/leads/stats
// ---------------------------------------------------------------------------
/**
 * getLeadStats — Aggregate pipeline statistics in a SINGLE db query using $facet.
 * Calculates totalLeads, statusBreakdown, conversionRate, sourceBreakdown,
 * thisMonthLeads, lastMonthLeads, and growthRate with division-by-zero handling.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with aggregated analytics statistics.
 */
export const getLeadStats = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeadStats] user:', req.user._id);
    }

    const ownerId = new mongoose.Types.ObjectId(req.user._id);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const stats = await Lead.aggregate([
      // Owner Isolation Match Stage
      { $match: { owner: ownerId } },
      // Parallel Aggregations via $facet
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          statusGroup: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          sourceGroup: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          thisMonthCount: [
            { $match: { createdAt: { $gte: startOfThisMonth } } },
            { $count: 'count' }
          ],
          lastMonthCount: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lte: endOfLastMonth
                }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const result = stats[0];
    const totalLeads = result.totalCount[0]?.count || 0;

    // Build status breakdown map with all schema statuses initialized to 0
    const statusBreakdown = VALID_STATUSES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    result.statusGroup.forEach((g) => {
      if (g._id in statusBreakdown) statusBreakdown[g._id] = g.count;
    });

    // Calculate conversion rate (Won / Total) * 100 with division by zero safety
    const wonLeads = statusBreakdown['Won'] || 0;
    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(1))
      : 0.0;

    // Build source breakdown map with all schema sources initialized to 0
    const sourceBreakdown = VALID_SOURCES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    result.sourceGroup.forEach((g) => {
      if (g._id in sourceBreakdown) sourceBreakdown[g._id] = g.count;
    });

    const thisMonthLeads = result.thisMonthCount[0]?.count || 0;
    const lastMonthLeads = result.lastMonthCount[0]?.count || 0;

    // Calculate growth rate ((thisMonth - lastMonth) / lastMonth) * 100
    let growthRate = 0.0;
    if (lastMonthLeads > 0) {
      growthRate = parseFloat((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1));
    } else if (thisMonthLeads > 0) {
      growthRate = 100.0; // Assume 100% growth if starting from zero
    }

    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        statusBreakdown,
        conversionRate,
        sourceBreakdown,
        thisMonthLeads,
        lastMonthLeads,
        growthRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/leads/monthly-stats
// ---------------------------------------------------------------------------
/**
 * getMonthlyStats — Aggregate leads by month for the last 6 calendar months.
 * Fills in gaps for months with 0 leads and formats outputs chronologically.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with chronological 6-month array of status/conversion info.
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getMonthlyStats] user:', req.user._id);
    }

    const ownerId = new mongoose.Types.ObjectId(req.user._id);

    // Calculate date exactly 6 months ago (start of month 5 months before now)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Lead.aggregate([
      // Owner and Date range match stage
      {
        $match: {
          owner: ownerId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      // Group by year and month
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          won:   { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
          lost:  { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
        },
      },
    ]);

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];

    // Chronologically assemble the last 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1; // 1-indexed for comparison with $month
      const monthLabel = `${MONTH_NAMES[d.getMonth()]} ${year}`;

      // Search for corresponding matched group from database
      const match = monthlyData.find((item) => item._id.year === year && item._id.month === monthNum);

      const total = match ? match.total : 0;
      const won = match ? match.won : 0;
      const lost = match ? match.lost : 0;
      const conversionRate = total > 0
        ? parseFloat(((won / total) * 100).toFixed(1))
        : 0.0;

      data.push({
        month: monthLabel,
        total,
        won,
        lost,
        conversionRate,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/leads/search
// ---------------------------------------------------------------------------
/**
 * getLeadsSearch — Autocomplete lead search endpoint.
 * Returns only _id, name, company, email, status, and limits results for speed.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {Object} req.query - Query params.
 * @param {string} req.query.q - Search query string.
 * @param {number|string} [req.query.limit=5] - Maximum number of search results to yield.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>} Resolves with list of matching autocomplete leads.
 */
export const getLeadsSearch = async (req, res, next) => {
  try {
    const { q = '', limit = 5 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 5));
    const ownerId = req.user._id;

    // Owner isolation filter
    const filter = { owner: ownerId };

    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: regex },
        { company: regex },
        { email: regex },
      ];
    }

    const leads = await Lead.find(filter)
      .select('_id name company email status')
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};
