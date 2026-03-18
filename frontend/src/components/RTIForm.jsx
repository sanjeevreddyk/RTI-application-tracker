import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid2,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';

const modeOptions = ['Online', 'Speed Post', 'Registered Post', 'Hand Submission'];
const DEPARTMENT_STORAGE_KEY = 'rti_department_options_v1';
const defaultDepartments = ['Revenue', 'Endowment'];
const statusOptions = [
  'RTI Filed',
  'PIO Response Received',
  'First Appeal Filed',
  'First Appeal Order Received',
  'Second Appeal Filed',
  'Second Appeal Hearing',
  'Second Appeal Order',
  'Case Closed'
];

export default function RTIForm({
  value,
  onChange,
  onSubmit,
  submitLabel = 'Save RTI',
  submitError = '',
  submitting = false,
  disableSubmit = false,
  secondaryActionLabel = '',
  onSecondaryAction,
  showInitialUpload = false,
  initialFiles = [],
  onInitialFilesChange
}) {
  const [departmentOptions, setDepartmentOptions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DEPARTMENT_STORAGE_KEY) || '[]');
      if (Array.isArray(stored) && stored.length) {
        return [...new Set([...defaultDepartments, ...stored])];
      }
    } catch (_error) {
      // ignore invalid local storage data and fall back to defaults
    }
    return defaultDepartments;
  });
  const [departmentMode, setDepartmentMode] = useState('select');
  const [customDepartment, setCustomDepartment] = useState('');

  useEffect(() => {
    localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(departmentOptions));
  }, [departmentOptions]);

  useEffect(() => {
    if (value.department && !departmentOptions.includes(value.department)) {
      setDepartmentOptions((prev) => [...new Set([...prev, value.department])]);
    }
  }, [departmentOptions, value.department]);

  function updateDepartment(valueToSet) {
    onChange?.({
      target: {
        name: 'department',
        value: valueToSet
      }
    });
  }

  function onDepartmentSelect(event) {
    const selected = event.target.value;

    if (selected === '__other__') {
      setDepartmentMode('custom');
      setCustomDepartment('');
      updateDepartment('');
      return;
    }

    setDepartmentMode('select');
    setCustomDepartment('');
    updateDepartment(selected);
  }

  function saveCustomDepartment() {
    const normalized = customDepartment.trim();
    if (!normalized) {
      return;
    }

    setDepartmentOptions((prev) => [...new Set([...prev, normalized])]);
    setDepartmentMode('select');
    setCustomDepartment('');
    updateDepartment(normalized);
  }

  return (
    <Paper sx={{ p: 3, background: 'linear-gradient(180deg, #ffffff 0%, #f8fcfb 100%)' }}>
      <Typography variant="h6" mb={2}>
        RTI Application Form
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate>
        {!!submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Applicant Name" name="applicantName" value={value.applicantName} onChange={onChange} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            {departmentMode === 'custom' ? (
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  label="Department (Custom)"
                  value={customDepartment}
                  onChange={(event) => setCustomDepartment(event.target.value)}
                  required
                />
                <Stack direction="row" spacing={1}>
                  <Button type="button" variant="outlined" onClick={saveCustomDepartment}>
                    Add Department
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => {
                      setDepartmentMode('select');
                      setCustomDepartment('');
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <TextField
                select
                fullWidth
                label="Department"
                name="department"
                value={departmentOptions.includes(value.department) ? value.department : ''}
                onChange={onDepartmentSelect}
                required
              >
                {departmentOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
                <MenuItem value="__other__">Other</MenuItem>
              </TextField>
            )}
          </Grid2>
          <Grid2 size={12}>
            <TextField fullWidth label="Applicant Address" name="applicantAddress" value={value.applicantAddress} onChange={onChange} multiline rows={2} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Public Information Officer" name="pioName" value={value.pioName} onChange={onChange} required />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              fullWidth
              label="Public Information Officer Address"
              name="pioAddress"
              value={value.pioAddress || ''}
              onChange={onChange}
              multiline
              rows={2}
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="RTI Subject" name="subject" value={value.subject} onChange={onChange} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="RTI Application Number"
              name="rtiNumber"
              value={value.rtiNumber}
              onChange={onChange}
              placeholder="RTI/2026/06"
              helperText="Format: RTI/YYYY/NN"
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="date" label="Application Date" name="applicationDate" value={value.applicationDate} onChange={onChange} InputLabelProps={{ shrink: true }} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Mode of Filing" name="modeOfFiling" value={value.modeOfFiling} onChange={onChange} required>
              {modeOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Postal Tracking Number" name="postalTrackingNumber" value={value.postalTrackingNumber} onChange={onChange} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="number" label="Application Fee" name="applicationFee" value={value.applicationFee} onChange={onChange} required inputProps={{ min: 0 }} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Status" name="status" value={value.status} onChange={onChange}>
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={12}>
            <TextField fullWidth label="Remarks" name="remarks" value={value.remarks} onChange={onChange} multiline rows={3} />
          </Grid2>
          {showInitialUpload && (
            <Grid2 size={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Submitted Application Copy *</Typography>
                <Button variant="outlined" component="label" sx={{ width: 'fit-content' }}>
                  Select File
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(event) => onInitialFilesChange?.(Array.from(event.target.files || []))}
                  />
                </Button>
                {!!initialFiles.length && (
                  <Typography variant="caption" color="text.secondary">
                    {initialFiles.map((file) => file.name).join(', ')}
                  </Typography>
                )}
                {!initialFiles.length && (
                  <Typography variant="caption" color="error.main">
                    At least one file is required.
                  </Typography>
                )}
              </Stack>
            </Grid2>
          )}
        </Grid2>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          {!!secondaryActionLabel && (
            <Button type="button" variant="outlined" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={submitting || disableSubmit}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
