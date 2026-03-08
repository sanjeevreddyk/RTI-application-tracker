import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import RTIForm from '../components/RTIForm';
import { createRti, uploadDocuments } from '../features/rti/rtiSlice';

function getTodayDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const initial = {
  applicantName: '',
  applicantAddress: '',
  department: '',
  pioName: '',
  subject: '',
  rtiNumber: '',
  applicationDate: getTodayDate(),
  modeOfFiling: 'Online',
  postalTrackingNumber: '',
  applicationFee: 10,
  remarks: '',
  status: 'RTI Filed'
};

export default function AddRTIPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [initialFiles, setInitialFiles] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const requiredFields = [
    'applicantName',
    'applicantAddress',
    'department',
    'pioName',
    'subject',
    'rtiNumber',
    'applicationDate',
    'modeOfFiling',
    'applicationFee'
  ];
  const isFormValid =
    requiredFields.every((field) => String(form[field] ?? '').trim()) &&
    !Number.isNaN(Number(form.applicationFee)) &&
    Number(form.applicationFee) >= 0 &&
    initialFiles.length > 0;

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    const required = [
      ['applicantName', 'Applicant Name'],
      ['applicantAddress', 'Applicant Address'],
      ['department', 'Department'],
      ['pioName', 'Public Information Officer'],
      ['subject', 'RTI Subject'],
      ['rtiNumber', 'RTI Application Number'],
      ['applicationDate', 'Application Date'],
      ['modeOfFiling', 'Mode of Filing'],
      ['applicationFee', 'Application Fee']
    ];
    const missing = required.find(([field]) => !String(form[field] ?? '').trim());
    if (missing) {
      setSubmitError(`Missing required field: ${missing[1]}`);
      return;
    }

    if (Number.isNaN(Number(form.applicationFee)) || Number(form.applicationFee) < 0) {
      setSubmitError('Application Fee must be a valid non-negative number.');
      return;
    }

    if (!initialFiles.length) {
      setSubmitError('Please upload submitted application copy before creating RTI.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      const created = await dispatch(
        createRti({ ...form, applicationFee: Number(form.applicationFee) })
      ).unwrap();

      if (initialFiles.length) {
        await dispatch(
          uploadDocuments({
            rtiId: created._id,
            stageName: 'RTI Filed',
            files: initialFiles
          })
        ).unwrap();
      }

      navigate('/rtis');
    } catch (error) {
      setSubmitError(typeof error === 'string' ? error : error?.message || 'Failed to create RTI application');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Add RTI Application</Typography>
      <Typography variant="body2" color="text.secondary">
        Capture filing details with supporting proof so each case is legally traceable.
      </Typography>
      <RTIForm
        value={form}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Create RTI"
        submitError={submitError}
        submitting={submitting}
        disableSubmit={!isFormValid}
        showInitialUpload
        initialFiles={initialFiles}
        onInitialFilesChange={setInitialFiles}
      />
    </Stack>
  );
}
