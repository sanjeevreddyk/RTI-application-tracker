import { apiClient } from '../api/client';
import { showSuccessToast } from '../utils/toast';

export async function downloadCsv() {
  const response = await apiClient.get('/export/csv', { responseType: 'blob' });
  triggerDownload(response.data, 'rti-cases.csv');
  showSuccessToast('CSV export downloaded');
}

export async function downloadPdf() {
  const response = await apiClient.get('/export/pdf', { responseType: 'blob' });
  triggerDownload(response.data, 'rti-cases.pdf');
  showSuccessToast('PDF export downloaded');
}

export async function downloadDraft(type, rtiId) {
  const response = await apiClient.get(`/draft/${type}/${rtiId}?format=pdf`, { responseType: 'blob' });
  triggerDownload(response.data, `${type}-draft.pdf`);
  showSuccessToast('Draft downloaded');
}

function triggerDownload(blobData, name) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
