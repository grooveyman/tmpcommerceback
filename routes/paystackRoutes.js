const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  initializePayment,
  verifyPayment,
  verifyWebHook
} = require('../controllers/payController');
const verify = require('../middleware/verifyPayStackSignature');

const router = express.Router();

router.route('/pay').post(authenticate, initializePayment);
router.route('/verify/:id').post(authenticate, verifyPayment);
router.route('/verifywebhook/').post(verify, verifyWebHook);

module.exports = router;