// routes/candidate.js
const express = require('express');
const router = express.Router();
const {
    createCandidate,
    uploadSignature,
    uploadInterviewVideo,
    getCompletedCandidates,
    getOngoingCandidates
} = require('../controllers/candidate.controller');
const {upload} = require("../middlewares/multer");

router.post('/create', createCandidate);
router.get('/uploadSignature', uploadSignature);
router.post('/upload-video', upload.single('video'), uploadInterviewVideo);
router.get('/completed', getCompletedCandidates);
router.get('/ongoing', getOngoingCandidates);

module.exports = router;