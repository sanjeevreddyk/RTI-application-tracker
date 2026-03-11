const BUFFER_DAYS = 10;

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function computeDeadlines({ applicationDate, latestStageDate, firstAppealOrderDate }) {
  const appDate = toDate(applicationDate);
  const latestDate = toDate(latestStageDate);
  const firstAppealOrder = toDate(firstAppealOrderDate);
  const baseDate = latestDate || appDate;

  const pioDeadline = baseDate ? addDays(baseDate, 30 + BUFFER_DAYS) : null;
  const firstAppealEligibleOn = pioDeadline;
  const secondAppealBaseDate = firstAppealOrder || baseDate;
  const secondAppealEligibleOn = secondAppealBaseDate
    ? addDays(secondAppealBaseDate, 90 + BUFFER_DAYS)
    : null;

  return {
    baseDate,
    pioDeadline,
    firstAppealEligibleOn,
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
