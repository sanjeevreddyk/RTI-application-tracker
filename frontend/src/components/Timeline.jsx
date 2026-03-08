import { Box, Chip, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { formatDate } from '../utils/date';

const STAGES = [
  'RTI Filed',
  'PIO Response Received',
  'First Appeal Filed',
  'First Appeal Order Received',
  'Second Appeal Filed',
  'Second Appeal Hearing',
  'Second Appeal Order',
  'Case Closed'
];

export default function Timeline({ stages }) {
  const done = new Set(stages.map((item) => item.stageName));

  return (
    <Stack spacing={1.5}>
      {STAGES.map((stage) => {
        const stageRecord = stages.find((item) => item.stageName === stage);
        const completed = done.has(stage);

        return (
          <Box
            key={stage}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              border: '1px solid',
              borderColor: completed ? 'success.light' : 'grey.300',
              borderRadius: 1
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {completed ? <CheckCircleOutlineIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
              <Typography variant="body2" fontWeight={600}>
                {stage}
              </Typography>
            </Stack>
            <Chip label={stageRecord ? formatDate(stageRecord.stageDate) : 'Pending'} size="small" />
          </Box>
        );
      })}
    </Stack>
  );
}