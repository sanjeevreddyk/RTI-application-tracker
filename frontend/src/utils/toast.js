const listeners = new Set();

function emitToast(payload) {
  listeners.forEach((listener) => {
    listener(payload);
  });
}

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showSuccessToast(message) {
  emitToast({ severity: 'success', message });
}

export function showErrorToast(message) {
  emitToast({ severity: 'error', message });
}

export function showInfoToast(message) {
  emitToast({ severity: 'info', message });
}
