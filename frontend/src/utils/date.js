export function deadlineChip(deadlineStatus) {
  if (deadlineStatus === 'overdue') {
    return { color: 'error', label: 'Overdue' };
  }

  if (deadlineStatus === 'warning') {
    return { color: 'warning', label: 'Approaching' };
  }

  if (deadlineStatus === 'on_track') {
    return { color: 'success', label: 'On Track' };
  }

  return { color: 'default', label: 'N/A' };
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}