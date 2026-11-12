// Unit tests for the Gym Membership Manager controllers.
// Database calls are stubbed with Sinon, so no MongoDB connection is needed.
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Membership = require('../models/Membership');
const { createPlan, updatePlan, deletePlan, getPlans } = require('../controllers/planController');
const { authorize } = require('../middleware/authMiddleware');
const { validatePlan } = require('../utils/validation');

const { expect } = chai;
const id = () => new mongoose.Types.ObjectId();
const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

afterEach(() => sinon.restore());

describe('Validation rules', () => {
  it('accepts a valid plan', () => {
    expect(validatePlan({ name: 'Monthly', durationMonths: 1, price: 59 })).to.deep.equal([]);
  });
  it('rejects a plan with missing name, bad duration and negative price', () => {
    const errors = validatePlan({ name: '', durationMonths: 30, price: -5 });
    expect(errors).to.have.length(3);
  });
});

describe('Role guard (authorize)', () => {
  it('returns 403 when a member calls an admin route', () => {
    const req = { user: { role: 'member' } };
    const res = mockRes();
    const next = sinon.spy();
    authorize('admin')(req, res, next);
    expect(res.status.calledWith(403)).to.be.true;
    expect(next.called).to.be.false;
  });
  it('calls next() for an admin', () => {
    const next = sinon.spy();
    authorize('admin')({ user: { role: 'admin' } }, mockRes(), next);
    expect(next.calledOnce).to.be.true;
  });
});

describe('Plan controller', () => {
  it('creates a plan (201)', async () => {
    const req = { body: { name: 'Monthly Standard', durationMonths: 1, price: 59 } };
    const created = { _id: id(), ...req.body, isActive: true };
    sinon.stub(Plan, 'findOne').resolves(null);
    const createStub = sinon.stub(Plan, 'create').resolves(created);
    const res = mockRes();
    await createPlan(req, res);
    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('returns 400 and does not touch the DB for invalid input', async () => {
    const createStub = sinon.stub(Plan, 'create');
    const res = mockRes();
    await createPlan({ body: { name: '', durationMonths: 0, price: 'abc' } }, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(createStub.called).to.be.false;
  });

  it('returns 409 for a duplicate plan name', async () => {
    sinon.stub(Plan, 'findOne').resolves({ _id: id() });
    const res = mockRes();
    await createPlan({ body: { name: 'Monthly Standard', durationMonths: 1, price: 59 } }, res);
    expect(res.status.calledWith(409)).to.be.true;
  });

  it('returns 409 when renaming a plan to an existing name', async () => {
    const save = sinon.stub();
    sinon.stub(Plan, 'findById').resolves({ _id: id(), name: 'Old name', save });
    sinon.stub(Plan, 'findOne').resolves({ _id: id(), name: 'Monthly Standard' });
    const res = mockRes();
    await updatePlan({ params: { id: 'p1' }, body: { name: 'Monthly Standard' } }, res);
    expect(res.status.calledWith(409)).to.be.true;
    expect(save.called).to.be.false;
  });

  it('shows members only active plans', async () => {
    const sort = sinon.stub().resolves([]);
    const findStub = sinon.stub(Plan, 'find').returns({ sort });
    await getPlans({ user: { role: 'member' } }, mockRes());
    expect(findStub.calledWith({ isActive: true })).to.be.true;
  });

  it('blocks deleting a plan that has open memberships (409)', async () => {
    sinon.stub(Plan, 'findById').resolves({ _id: id(), deleteOne: sinon.stub() });
    sinon.stub(Membership, 'countDocuments').resolves(2);
    const res = mockRes();
    await deletePlan({ params: { id: 'p1' } }, res);
    expect(res.status.calledWith(409)).to.be.true;
  });

  it('returns 500 if the database fails', async () => {
    sinon.stub(Plan, 'findOne').throws(new Error('DB Error'));
    const res = mockRes();
    await createPlan({ body: { name: 'X', durationMonths: 1, price: 1 } }, res);
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});