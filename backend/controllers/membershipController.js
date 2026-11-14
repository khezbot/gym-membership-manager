const Membership = require('../models/Membership');
const Plan = require('../models/Plan');
const { validateMembershipRequest, addMonths } = require('../utils/validation');

// POST /api/memberships  (member) — request to join a plan
const requestMembership = async (req, res) => {
  const errors = validateMembershipRequest(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  try {
    const { planId, startDate } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) return res.status(404).json({ message: 'Plan not found or no longer available' });

    // One open membership per member at a time.
    const open = await Membership.findOne({ member: req.user.id, status: { $in: ['pending', 'active'] } });
    if (open) {
      return res.status(409).json({ message: `You already have a ${open.status} membership. Cancel it before joining another plan.` });
    }

    const membership = await Membership.create({ member: req.user.id, plan: plan._id, startDate });
    return res.status(201).json(await membership.populate('plan'));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/memberships/mine  (member)
const getMyMemberships = async (req, res) => {
  try {
    const items = await Membership.find({ member: req.user.id }).populate('plan').sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/memberships/:id/cancel  (member, own membership only)
const cancelMembership = async (req, res) => {
  try {
    const m = await Membership.findById(req.params.id);
    if (!m) return res.status(404).json({ message: 'Membership not found' });
    if (String(m.member) !== String(req.user.id)) return res.status(403).json({ message: 'You can only cancel your own membership' });
    if (!['pending', 'active'].includes(m.status)) {
      return res.status(400).json({ message: `A ${m.status} membership cannot be cancelled` });
    }
    m.status = 'cancelled';
    await m.save();
    return res.json(await m.populate('plan'));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/memberships?status=pending  (admin)
const getAllMemberships = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const items = await Membership.find(filter)
      .populate('plan')
      .populate('member', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/memberships/:id/review  (admin) — body: { decision: 'approve'|'reject', adminNote }
const reviewMembership = async (req, res) => {
  const { decision, adminNote } = req.body || {};
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ message: "Decision must be 'approve' or 'reject'" });
  }
  if (decision === 'reject' && (!adminNote || !String(adminNote).trim())) {
    return res.status(400).json({ message: 'Please give a reason when rejecting a request' });
  }
  try {
    const m = await Membership.findById(req.params.id).populate('plan');
    if (!m) return res.status(404).json({ message: 'Membership not found' });
    if (m.status !== 'pending') return res.status(400).json({ message: `Only pending requests can be reviewed (this one is ${m.status})` });

    if (decision === 'approve') {
      m.status = 'active';
      m.endDate = addMonths(m.startDate, m.plan.durationMonths);
    } else {
      m.status = 'rejected';
    }
    if (adminNote) m.adminNote = adminNote;
    await m.save();
    return res.json(m);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { requestMembership, getMyMemberships, cancelMembership, getAllMemberships, reviewMembership };
