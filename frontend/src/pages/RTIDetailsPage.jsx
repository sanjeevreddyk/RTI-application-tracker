import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Grid2,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Timeline from '../components/Timeline';
import {
  addNote,
  addStage,
  fetchDocuments,
  fetchNotes,
  fetchRtiById,
  fetchStages,
  removeDocument,
  uploadDocuments
} from '../features/rti/rtiSlice';
import { downloadDraft } from '../api/downloads';
import { fileBaseUrl } from '../api/client';
import { deadlineChip, formatDate } from '../utils/date';

const stageNames = [
  'RTI Filed',
  'PIO Response Received',
  'First Appeal Filed',
  'First Appeal Order Received',
  'Second Appeal Filed',
  'Second Appeal Hearing',
  'Second Appeal Order',
  'Case Closed'
];

function getTodayDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function RTIDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, stages, documents, notes } = useSelector((state) => state.rti);

  const [stageForm, setStageForm] = useState({
    stageName: 'PIO Response Received',
    stageDate: getTodayDate(),
    description: ''
  });
  const [stageFiles, setStageFiles] = useState([]);
  const [noteForm, setNoteForm] = useState({ noteText: '', author: 'System User' });
  const [docStage, setDocStage] = useState('General');
  const [files, setFiles] = useState([]);
  const [stageSubmitError, setStageSubmitError] = useState('');

  useEffect(() => {
    dispatch(fetchRtiById(id));
    dispatch(fetchStages(id));
    dispatch(fetchDocuments(id));
    dispatch(fetchNotes(id));
  }, [dispatch, id]);

  const pioChip = useMemo(() => deadlineChip(selected?.deadlines?.pioDeadlineStatus), [selected]);
  const stageOptions = useMemo(() => ['General', ...stageNames], []);
  const documentsByStage = useMemo(() => {
    const grouped = {};
    documents.forEach((doc) => {
      const key = doc.stageName || 'General';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(doc);
    });

    return grouped;
  }, [documents]);
  const orderedDocumentStages = useMemo(() => {
    const extras = Object.keys(documentsByStage).filter((stage) => !stageOptions.includes(stage));
    return [...stageOptions, ...extras].filter((stage) => documentsByStage[stage]?.length);
  }, [documentsByStage, stageOptions]);
  const isStageFormValid = Boolean(stageForm.stageName?.trim() && stageForm.stageDate && stageFiles.length > 0);

  async function submitStage(event) {
    event.preventDefault();
    setStageSubmitError('');

    if (!stageForm.stageName?.trim()) {
      setStageSubmitError('Stage is required.');
      return;
    }

    if (!stageForm.stageDate) {
      setStageSubmitError('Stage Date is required.');
      return;
    }

    if (!stageFiles.length) {
      setStageSubmitError('Please upload at least one document for this stage.');
      return;
    }

    try {
      const createdStage = await dispatch(addStage({ rtiId: id, ...stageForm })).unwrap();

      if (stageFiles.length) {
        await dispatch(
          uploadDocuments({
            rtiId: id,
            stageId: createdStage._id,
            stageName: stageForm.stageName,
            files: stageFiles
          })
        ).unwrap();
        dispatch(fetchDocuments(id));
      }

      setStageForm({
        stageName: 'PIO Response Received',
        stageDate: getTodayDate(),
        description: ''
      });
      setStageFiles([]);
      dispatch(fetchRtiById(id));
      dispatch(fetchStages(id));
    } catch (error) {
      setStageSubmitError(typeof error === 'string' ? error : error?.message || 'Failed to save stage');
    }
  }

  async function submitNote(event) {
    event.preventDefault();
    if (!noteForm.noteText.trim()) {
      return;
    }

    await dispatch(addNote({ rtiId: id, ...noteForm }));
    setNoteForm((prev) => ({ ...prev, noteText: '' }));
  }

  async function submitDocuments(event) {
    event.preventDefault();
    if (!files.length) {
      return;
    }

    await dispatch(uploadDocuments({ rtiId: id, stageName: docStage, files }));
    setFiles([]);
    setDocStage('General');
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>RTI Case Details</Typography>

      {selected && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">{selected.rtiNumber} - {selected.subject}</Typography>
          <Typography variant="body2" color="text.secondary">Department: {selected.department}</Typography>
          <Typography variant="body2" color="text.secondary">Applicant: {selected.applicantName}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={1}>
            <Chip label={`Status: ${selected.status}`} />
            <Chip label={`PIO Deadline: ${formatDate(selected.deadlines?.pioDeadline)}`} color={pioChip.color} />
          </Stack>
        </Paper>
      )}

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Case Timeline</Typography>
            <Timeline stages={stages} />
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Add Timeline Stage</Typography>
            <Box component="form" onSubmit={submitStage}>
              <Stack spacing={1.5}>
                {!!stageSubmitError && <Alert severity="error">{stageSubmitError}</Alert>}
                <TextField select label="Stage" value={stageForm.stageName} onChange={(e) => setStageForm((p) => ({ ...p, stageName: e.target.value }))}>
                  {stageNames.map((name) => (
                    <MenuItem key={name} value={name}>{name}</MenuItem>
                  ))}
                </TextField>
                <TextField type="date" label="Stage Date" InputLabelProps={{ shrink: true }} value={stageForm.stageDate} onChange={(e) => setStageForm((p) => ({ ...p, stageDate: e.target.value }))} required />
                <TextField multiline rows={3} label="Description" value={stageForm.description} onChange={(e) => setStageForm((p) => ({ ...p, description: e.target.value }))} />
                <Button variant="outlined" component="label">
                  Upload Stage Documents
                  <input
                    hidden
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setStageFiles(Array.from(e.target.files || []))}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Upload Stage Documents *
                </Typography>
                {!!stageFiles.length && (
                  <Alert severity="info">{stageFiles.length} file(s) selected for this timeline stage.</Alert>
                )}
                {!stageFiles.length && (
                  <Typography variant="caption" color="error.main">
                    At least one file is required for stage submission.
                  </Typography>
                )}
                <Button type="submit" variant="contained" disabled={!isStageFormValid}>
                  Save Stage
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Document Repository</Typography>
            <Box component="form" onSubmit={submitDocuments}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} mb={2}>
                <TextField
                  select
                  label="Stage"
                  value={docStage}
                  onChange={(e) => setDocStage(e.target.value)}
                  fullWidth
                >
                  {stageOptions.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" component="label">
                  Select Files
                  <input
                    hidden
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                </Button>
                <Button type="submit" variant="contained">Upload</Button>
              </Stack>
              {!!files.length && <Alert severity="info">{files.length} file(s) selected.</Alert>}
            </Box>

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {Object.keys(documentsByStage).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No documents uploaded yet.
                </Typography>
              )}

              {orderedDocumentStages.map((stage) => (
                  <Accordion key={stage} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        {stage} ({documentsByStage[stage].length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>File</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Stage</TableCell>
                            <TableCell>Uploaded</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documentsByStage[stage].map((doc) => (
                            <TableRow key={doc._id}>
                              <TableCell>{doc.fileName}</TableCell>
                              <TableCell>{doc.fileType}</TableCell>
                              <TableCell>{doc.stageName || 'General'}</TableCell>
                              <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                              <TableCell>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <Link href={`${fileBaseUrl}${doc.filePath}`} target="_blank" rel="noreferrer">
                                    Preview
                                  </Link>
                                  <Link href={`${fileBaseUrl}${doc.filePath}`} download>
                                    Download
                                  </Link>
                                  <Button color="error" size="small" onClick={() => dispatch(removeDocument(doc._id))}>
                                    Delete
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Stack>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Case Diary Notes</Typography>
            <Box component="form" onSubmit={submitNote}>
              <Stack spacing={1.5}>
                <TextField label="Author" value={noteForm.author} onChange={(e) => setNoteForm((p) => ({ ...p, author: e.target.value }))} />
                <TextField multiline rows={3} label="Note" value={noteForm.noteText} onChange={(e) => setNoteForm((p) => ({ ...p, noteText: e.target.value }))} />
                <Button type="submit" variant="contained">Add Note</Button>
              </Stack>
            </Box>

            <Stack spacing={1} mt={2}>
              {notes.map((note) => (
                <Paper key={note._id} variant="outlined" sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.secondary">{note.author} | {formatDate(note.createdAt)}</Typography>
                  <Typography variant="body2">{note.noteText}</Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Draft Generator</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={() => downloadDraft('application', id)}>RTI Draft PDF</Button>
              <Button variant="outlined" onClick={() => downloadDraft('first_appeal', id)}>First Appeal PDF</Button>
              <Button variant="outlined" onClick={() => downloadDraft('second_appeal', id)}>Second Appeal PDF</Button>
            </Stack>
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
