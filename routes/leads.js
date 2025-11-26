const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/leadController');

// Public routes
router.post('/', createLead);

// Private routes (for admin/sales team)
router.get('/', getAllLeads);
router.get('/stats', getLeadStats);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
