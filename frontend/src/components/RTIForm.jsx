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
  showInitialUpload = false,
  initialFiles = [],
  onInitialFilesChange
}) {
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
            <TextField fullWidth label="Department" name="department" value={value.department} onChange={onChange} required />
          </Grid2>
          <Grid2 size={12}>
            <TextField fullWidth label="Applicant Address" name="applicantAddress" value={value.applicantAddress} onChange={onChange} multiline rows={2} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Public Information Officer" name="pioName" value={value.pioName} onChange={onChange} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="RTI Subject" name="subject" value={value.subject} onChange={onChange} required />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="RTI Application Number" name="rtiNumber" value={value.rtiNumber} onChange={onChange} required />
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

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button type="submit" variant="contained" disabled={submitting || disableSubmit}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
