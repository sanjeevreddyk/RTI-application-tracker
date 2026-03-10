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

module.exports = {
  computeDeadlines,
  getDeadlineStatus
};
