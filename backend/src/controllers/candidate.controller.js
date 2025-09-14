const Candidate = require("../models/candidate");
const EventLog = require("../models/event");
const { getUploadSignature, uploadToCloudinary } = require("../utils/cloudinary");

// Get all completed candidates
const getCompletedCandidates = async (req, res) => {
  try {
    const { interviewId } = req.query;

    let query = { endedAt: { $exists: true } };

    if (interviewId) {
      query.interviewId = interviewId;
    }

    const candidates = await Candidate.find(query)
        .sort({ endedAt: -1 })
        .lean();

    // Enrich with event log data
    const enrichedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          console.log({id : candidate._id})
          const events = await EventLog.find({ candidateId: candidate._id });
          const total_lost_focus_time = events
              .filter(e => e.type === "NO_FACE" || e.type === "LOOK_AWAY")
              .reduce((sum, e) => sum + (e.durationMs || 0), 0);

          return {
            id: candidate._id,
            name: candidate.name,
            interviewDate: candidate.endedAt.toISOString().split('T')[0],
            integrityScore: candidate.integrityScore || 0,
            duration: calculateDuration(candidate.startedAt, candidate.endedAt),
            violations: events.length - 2,
            details: {
              videoUrl: candidate.interviewUrl,
              totalEvents: events.length,
              finalScore: candidate.integrityScore || 0,
              events: events.map(event => ({
                time: formatTime(event.timestamp),
                event: event.type,
                type: getEventType(event.type)
              })),
              lostFocusTime:total_lost_focus_time
            }
          };
        })
    );

    res.status(200).json({
      success: true,
      candidates: enrichedCandidates
    });
  } catch (err) {
    console.error("Get completed candidates error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all ongoing candidates
const getOngoingCandidates = async (req, res) => {
  try {
    const { interviewId } = req.query;

    let query = { endedAt: { $exists: false } };

    if (interviewId) {
      query.interviewId = interviewId;
    }

    const candidates = await Candidate.find(query)
        .sort({ startedAt: -1 })
        .lean();

    // Enrich with live event data
    const enrichedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          const events = await EventLog.find({
            candidateId: candidate._id
          }).sort({ timestamp: -1 }).limit(10);

          const currentDuration = calculateDuration(candidate.startedAt, new Date());
          const recentEvents = events.slice(0, 4).map(event => ({
            time: event.timestamp.toLocaleTimeString(),
            event: event.type,
            type: getEventType(event.type)
          }));

          // Calculate live integrity score based on recent events
          const liveScore = calculateLiveScore(events, candidate.startedAt);

          return {
            id: candidate._id,
            name: candidate.name,
            startedAt: candidate.startedAt.toLocaleTimeString(),
            integrityScore: `Live: ${liveScore}`,
            currentDuration: currentDuration,
            liveLogs: recentEvents
          };
        })
    );

    res.status(200).json({
      success: true,
      candidates: enrichedCandidates
    });
  } catch (err) {
    console.error("Get ongoing candidates error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper functions
const calculateDuration = (start, end) => {
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getEventType = (eventType) => {
  if (eventType.includes('DETECTED') || eventType.includes('NO_FACE') || eventType.includes('LOOK_AWAY')) {
    return 'warning';
  } else if (eventType.includes('STARTED') || eventType.includes('STOPPED')) {
    return 'info';
  } else {
    return 'success';
  }
};

const calculateLiveScore = (events, startedAt) => {
  const totalDuration = new Date() - startedAt;
  const violationEvents = events.filter(event =>
      event.type.includes('DETECTED') ||
      event.type.includes('NO_FACE') ||
      event.type.includes('LOOK_AWAY') ||
      event.type.includes('MULTIPLE_FACES')
  );

  // Simple scoring algorithm: reduce 5 points per violation
  const baseScore = 100;
  const deduction = violationEvents.length * 5;
  const liveScore = Math.max(0, baseScore - deduction);

  return liveScore;
};

// Create a new candidate
const createCandidate = async (req, res) => {
  try {
    const { name, email, interviewId } = req.body;

    if (!name || !email || !interviewId) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingCandidate = await Candidate.findOne({ email, interviewId });
    if (existingCandidate) {
      return res.status(400).json({ success: false, message: "Candidate already registered for this interview" });
    }

    const candidate = await Candidate.create({
      name,
      email,
      interviewId,
      startedAt: Date.now(),
    });

    res.status(201).json({ success: true, message: "Candidate created successfully", candidate });
  } catch (err) {
    console.error("Candidate creation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadSignature = async(req,res)=>{
  try {
    const response =  getUploadSignature("interviews",20000);
    return res.status(200).json({ success: true, message: "Signature generated successfully", signature: response });
  } catch (error) {
    console.error("Candidate uploadSignature error:", err);
    res.status(500).json({ success: false, message: "Server error" });

  }
}

const uploadInterviewVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const {candidateId,deductions,events=[]} = req.body;
    if(!candidateId || !deductions){
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    parsed_events = JSON.parse(events);

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    candidate.endedAt = Date.now();

    const uploadResponse = await uploadToCloudinary(req.file.path);

    if (!uploadResponse) {
      return res.status(500).json({ success: false, message: "Upload failed" });
    }

    candidate.interviewUrl = uploadResponse.secure_url;
    candidate.integrityScore = 100 - deductions;

    await candidate.save();

    if (Array.isArray(parsed_events) && parsed_events.length > 0) {
      const eventLogs = parsed_events.map((evt) => ({
        candidateId,
        type: evt.type,
        timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date(),
        durationMs: evt.durationMs || 0,
      }));

      await EventLog.insertMany(eventLogs);
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      url: uploadResponse.secure_url,
    });
  } catch (err) {
    console.error("Interview video upload error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createCandidate,
  uploadSignature,
  uploadInterviewVideo,
  getCompletedCandidates,
  getOngoingCandidates
};