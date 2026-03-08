function computeDeadlines(applicationDate, firstAppealOrderDate) {
  const appDate = applicationDate ? new Date(applicationDate) : null;
  const pioDeadline = appDate ? addDays(appDate, 30) : null;
  const firstAppealEligibleOn = pioDeadline;
  const secondAppealEligibleOn = firstAppealOrderDate ? addDays(new Date(firstAppealOrderDate), 90) : null;

  return {
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