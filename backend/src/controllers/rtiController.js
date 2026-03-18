const fs = require('fs');
const path = require('path');
const { RTIApplication } = require('../models/RTIApplication');
const { Stage } = require('../models/Stage');
const Document = require('../models/Document');
const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');
const { computeDeadlines, getDeadlineStatus, getReminderRule } = require('../utils/deadline');
const { destroyByPublicId } = require('../config/cloudinary');
const { normalizeRtiNumber } = require('../utils/rtiNumber');

const FIRST_APPEAL_STATUSES = new Set(['First Appeal Filed', 'First Appeal Order Received']);
const SECOND_APPEAL_STATUSES = new Set([
  'Second Appeal Filed',
  'Second Appeal Hearing',
  'Second Appeal Order'
]);

function getCurrentStageDeadline(status, deadlines, isClosed) {
  if (isClosed) {
    return {
      currentStageDeadline: null,
      currentStageDeadlineStatus: 'na'
    };
  }

  if (FIRST_APPEAL_STATUSES.has(status)) {
    return {
      currentStageDeadline: deadlines.firstAppealDeadline,
      currentStageDeadlineStatus: getDeadlineStatus(deadlines.firstAppealDeadline)
    };
  }

  if (SECOND_APPEAL_STATUSES.has(status)) {
    return {
      currentStageDeadline: deadlines.secondAppealEligibleOn,
      currentStageDeadlineStatus: getDeadlineStatus(deadlines.secondAppealEligibleOn)
    };
  }

  return {
    currentStageDeadline: deadlines.pioDeadline,
    currentStageDeadlineStatus: getDeadlineStatus(deadlines.pioDeadline)
  };
}

function addDays(value, days) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() + days);
  return date;
}

const buildFilters = (query) => {
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.department) {
    filters.department = query.department;
  }

  if (query.year) {
    const year = Number(query.year);
    if (!Number.isNaN(year)) {
      filters.applicationDate = {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
      };
    }
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filters.$or = [{ rtiNumber: regex }, { subject: regex }, { department: regex }];
  }

  return filters;
};

const enrichRti = async (rtiDoc) => {
  const [caseClosedStage, firstAppealFiledStage, secondAppealFiledStage, latestStage] = await Promise.all([
    Stage.findOne({
      rtiId: rtiDoc._id,
      stageName: 'Case Closed'
    }).sort({ stageDate: -1 }),
    Stage.findOne({
      rtiId: rtiDoc._id,
      stageName: 'First Appeal Filed'
    }).sort({ stageDate: -1 }),
    Stage.findOne({
      rtiId: rtiDoc._id,
      stageName: 'Second Appeal Filed'
    }).sort({ stageDate: -1 }),
    Stage.findOne({
      rtiId: rtiDoc._id
    }).sort({ stageDate: -1, updatedAt: -1 })
  ]);

  const deadlines = computeDeadlines({
    applicationDate: rtiDoc.applicationDate,
    firstAppealFiledDate: firstAppealFiledStage?.stageDate,
    secondAppealFiledDate: secondAppealFiledStage?.stageDate
  });
  const isClosed = rtiDoc.status === 'Case Closed' || rtiDoc.status === 'Closed' || Boolean(caseClosedStage);
  const effectiveStatus = isClosed ? 'Case Closed' : latestStage?.stageName || rtiDoc.status;
  const pioDeadlineStatus = isClosed ? 'na' : getDeadlineStatus(deadlines.pioDeadline);
  const firstAppealDeadlineStatus = isClosed ? 'na' : getDeadlineStatus(deadlines.firstAppealDeadline);
  const secondAppealDeadlineStatus = isClosed
    ? 'na'
    : getDeadlineStatus(deadlines.secondAppealEligibleOn);
  let {
    currentStageDeadline,
    currentStageDeadlineStatus
  } = getCurrentStageDeadline(effectiveStatus, deadlines, isClosed);
  if (!isClosed && !currentStageDeadline) {
    // Backward-compatible fallback for older data where applicationDate may be missing.
    const fallbackAnchor = latestStage?.stageDate || rtiDoc.applicationDate;
    currentStageDeadline = addDays(fallbackAnchor, 40);
    currentStageDeadlineStatus = getDeadlineStatus(currentStageDeadline);
  }
  const pioReminderRule = isClosed ? null : getReminderRule(deadlines.pioDeadline);
  const secondAppealReminderRule = isClosed ? null : getReminderRule(deadlines.secondAppealEligibleOn);

  return {
    ...rtiDoc.toObject(),
    rtiNumber: normalizeRtiNumber(rtiDoc.rtiNumber, rtiDoc.applicationDate),
    status: effectiveStatus,
    deadlines: {
      pioDeadline: deadlines.pioDeadline,
      pioDeadlineStatus,
      pioReminderRule,
      firstAppealEligibleOn: deadlines.firstAppealEligibleOn,
      firstAppealDeadline: deadlines.firstAppealDeadline,
      firstAppealDeadlineStatus,
      secondAppealEligibleOn: deadlines.secondAppealEligibleOn,
      secondAppealDeadlineStatus,
      currentStageDeadline,
      currentStageDeadlineStatus,
      secondAppealReminderRule
    }
  };
};

const createRti = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    rtiNumber: normalizeRtiNumber(req.body.rtiNumber, req.body.applicationDate)
  };
  const rti = await RTIApplication.create(payload);

  await Stage.create({
    rtiId: rti._id,
    stageName: 'RTI Filed',
    stageDate: rti.applicationDate,
    description: 'RTI application filed'
  });

  res.status(201).json(rti);
});

const getRtis = asyncHandler(async (req, res) => {
  const requestedStatus = String(req.query.status || '').trim();
  const filters = buildFilters(req.query);
  if (requestedStatus) {
    delete filters.status;
  }
  const list = await RTIApplication.find(filters).sort({ applicationDate: -1 });

  let enriched = await Promise.all(list.map((rti) => enrichRti(rti)));

  if (requestedStatus) {
    enriched = enriched.filter((item) => item.status === requestedStatus);
  }

  const overdueParam = String(req.query.overdue || '').toLowerCase();
  const overdueEnabled = overdueParam === 'true' || overdueParam === '1' || overdueParam === 'yes';

  if (overdueEnabled) {
    enriched = enriched.filter(
      (item) => item.status === 'RTI Filed' && item.deadlines?.pioDeadlineStatus === 'overdue'
    );
  }

  res.json(enriched);
});

const getRtiById = asyncHandler(async (req, res) => {
  const rti = await RTIApplication.findById(req.params.id);

  if (!rti) {
    res.status(404);
    throw new Error('RTI application not found');
  }

  const enriched = await enrichRti(rti);
  res.json(enriched);
});

const updateRti = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.rtiNumber) {
    payload.rtiNumber = normalizeRtiNumber(
      payload.rtiNumber,
      payload.applicationDate
    );
  }

  const rti = await RTIApplication.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!rti) {
    res.status(404);
    throw new Error('RTI application not found');
  }

  res.json(rti);
});

const deleteRti = asyncHandler(async (req, res) => {
  const rti = await RTIApplication.findById(req.params.id);

  if (!rti) {
    res.status(404);
    throw new Error('RTI application not found');
  }

  const docs = await Document.find({ rtiId: rti._id });

  docs.forEach((doc) => {
    if (doc.cloudinaryPublicId) {
      destroyByPublicId(doc.cloudinaryPublicId, doc.cloudinaryResourceType || 'image').catch(() => {});
      return;
    }

    const fullPath = path.join(process.cwd(), String(doc.filePath || '').replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  await Promise.all([
    Stage.deleteMany({ rtiId: rti._id }),
    Document.deleteMany({ rtiId: rti._id }),
    Note.deleteMany({ rtiId: rti._id }),
    RTIApplication.deleteOne({ _id: rti._id })
  ]);

  res.json({ message: 'RTI application deleted' });
});

module.exports = {
  createRti,
  getRtis,
  getRtiById,
  updateRti,
  deleteRti
};
