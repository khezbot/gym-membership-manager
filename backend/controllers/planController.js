const Plan = require('../models/Plan');
const Membership = require('../models/Membership');
const { validatePlan } = require('../utils/validation');

// GET /api/plans  — members see active plans only; admins see all.
const getPlans = async (req, res) => {
  try {
    const filter = req.user && req.user.role === 'admin' ? {} : { isActive: true };
    const plans = await Plan.find(filter).sort({ price: 1 });
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/plans  (admin)
const createPlan = async (req, res) => {
  const errors = validatePlan(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  try {
    const { name, description, durationMonths, price, isActive } = req.body;
    const exists = await Plan.findOne({ name: String(name).trim() });
    if (exists) return res.status(409).json({ message: 'A plan with this name already exists' });
    const plan = await Plan.create({
      name,
      description,
      durationMonths: Number(durationMonths),
      price: Number(price),
      isActive: isActive !== undefined ? isActive : true,
    });
    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/plans/:id  (admin)
const updatePlan = async (req, res) => {
  const errors = validatePlan(req.body, true);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    // Renaming to another plan's name would hit the unique index and return a 500.
    if (req.body.name && String(req.body.name).trim() !== plan.name) {
      const clash = await Plan.findOne({ name: String(req.body.name).trim() });
      if (clash) return res.status(409).json({ message: 'A plan with this name already exists' });
    }
    ['name', 'description', 'durationMonths', 'price', 'isActive'].forEach((k) => {
      if (req.body[k] !== undefined) plan[k] = req.body[k];
    });
    const updated = await plan.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/plans/:id  (admin)
// Business rule: a plan that has pending/active memberships cannot be deleted;
// the admin should deactivate it instead so existing members are not affected.
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    const inUse = await Membership.countDocuments({ plan: plan._id, status: { $in: ['pending', 'active'] } });
    if (inUse > 0) {
      return res.status(409).json({ message: 'This plan has pending or active memberships. Deactivate it instead of deleting.' });
    }
    await plan.deleteOne();
    return res.json({ message: 'Plan deleted', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };