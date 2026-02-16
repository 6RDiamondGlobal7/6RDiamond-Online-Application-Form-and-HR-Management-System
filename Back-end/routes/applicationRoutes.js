const express = require('express');
const router = express.Router();
const multer = require('multer');
const applicationController = require('../controllers/applicationController');

// --- Multer Configuration (Memory Storage) ---
const upload = multer({ storage: multer.memoryStorage() });

// Define allowed file fields
const uploadFields = upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
    { name: 'prcId', maxCount: 1 }
]);

// --- Define Routes ---

// GET /api/test-db
router.get('/test-db', applicationController.testDb);

// GET /api/jobs
router.get('/jobs', applicationController.getJobs);

// GET /api/applicants (NEW ROUTE ADDED HERE)
router.get('/applicants', applicationController.getApplicants);

// POST /api/apply (Uses Multer middleware + Controller logic)
router.post('/apply', uploadFields, applicationController.submitApplication);

console.log("LOGIN FUNCTION IS:", applicationController.loginEmployee);

// POST /api/login
router.post('/login', upload.none(), applicationController.loginEmployee);

module.exports = router;