const PIO_RESPONSE_DAYS = 30;
const FIRST_APPEAL_DISPOSAL_DAYS = 30;
const SECOND_APPEAL_DISPOSAL_DAYS = 30;
const DEADLINE_BUFFER_DAYS = 10;

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function computeDeadlines({ applicationDate, firstAppealFiledDate, secondAppealFiledDate }) {
  const appDate = toDate(applicationDate);
  const firstAppealFiled = toDate(firstAppealFiledDate);
  const secondAppealFiled = toDate(secondAppealFiledDate);

  const pioDeadline = appDate ? addDays(appDate, PIO_RESPONSE_DAYS + DEADLINE_BUFFER_DAYS) : null;
  const firstAppealEligibleOn = pioDeadline;
  const firstAppealDeadline = firstAppealFiled
    ? addDays(firstAppealFiled, FIRST_APPEAL_DISPOSAL_DAYS + DEADLINE_BUFFER_DAYS)
    : null;
  const secondAppealEligibleOn = secondAppealFiled
    ? addDays(secondAppealFiled, SECOND_APPEAL_DISPOSAL_DAYS + DEADLINE_BUFFER_DAYS)
    : null;

  return {
    pioDeadline,
    firstAppealEligibleOn,
    firstAppealDeadline,
    secondAppealEligibleOn
  };
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function getDeadlineStatus(deadline) {
  if (!deadline) {
    return 'na';
  }

  const now = new Date();
  const target = new Date(deadline);
  const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return 'overdue';
  }

  if (days <= 5) {
    return 'warning';
  }

  return 'on_track';
}

function getDaysToDeadline(deadline) {
  if (!deadline) {
    return null;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(deadline);
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.floor((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));
}

function getReminderRule(deadline) {
  const daysToDeadline = getDaysToDeadline(deadline);
  if (daysToDeadline === null) {
    return null;
  }

  if (daysToDeadline < 0) {
    return 'Overdue';
  }

  if (daysToDeadline === 7) {
    return 'T-7';
  }

  if (daysToDeadline === 3) {
    return 'T-3';
  }

  if (daysToDeadline === 1) {
    return 'T-1';
  }

  return null;
}

module.exports = {
  computeDeadlines,
  getDeadlineStatus,
  getReminderRule
};
