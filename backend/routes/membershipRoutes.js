const express = require('express');
const { requestMembership, getMyMemberships, cancelMembership } = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Member
router.post('/', protect, authorize('member'), requestMembership);
router.get('/mine', protect, authorize('member'), getMyMemberships);
router.patch('/:id/cancel', protect, authorize('member'), cancelMembership);

module.exports = router;