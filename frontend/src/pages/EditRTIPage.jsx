import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import RTIForm from '../components/RTIForm';
import { fetchRtiById, fetchStages, updateRti, updateStage } from '../features/rti/rtiSlice';
import { formatRtiNumber } from '../utils/rtiNumber';

const empty = {
  applicantName: '',
  applicantAddress: '',
  department: '',
  pioName: '',
  pioAddress: '',
  subject: '',
  rtiNumber: '',
  applicationDate: '',
  modeOfFiling: 'Online',
  postalTrackingNumber: '',
  applicationFee: 10,
  remarks: '',
  status: 'RTI Filed'
};

export default function EditRTIPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selected = useSelector((state) => state.rti.selected);
  const stages = useSelector((state) => state.rti.stages);
  const [form, setForm] = useState(empty);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchRtiById(id));
    dispatch(fetchStages(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selected && selected._id === id) {
      setForm({
        ...selected,
        rtiNumber: formatRtiNumber(selected.rtiNumber, selected.applicationDate),
        applicationDate: selected.applicationDate?.slice(0, 10)
      });
    }
  }, [selected, id]);

  function onChange(event) {
    const { name, value } = event.target;
    if (name === 'status') {
      const matchedStage = stages.find((stage) => stage.stageName === value);
      const fallbackDate =
        value === 'RTI Filed'
          ? selected?.applicationDate?.slice(0, 10) || form.applicationDate
          : matchedStage?.stageDate?.slice(0, 10) || form.applicationDate;

      setForm((prev) => ({ ...prev, status: value, applicationDate: fallbackDate }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      if (form.status && form.applicationDate) {
        await dispatch(
          updateStage({
            rtiId: id,
            stageName: form.status,
            stageDate: form.applicationDate
          })
        ).unwrap();
      }

      const payload = {
        ...form,
        rtiNumber: formatRtiNumber(form.rtiNumber, form.applicationDate),
        applicationFee: Number(form.applicationFee),
        // Keep original filing date unless the edited status is RTI Filed.
        applicationDate:
          form.status === 'RTI Filed'
            ? form.applicationDate
            : selected?.applicationDate?.slice(0, 10) || form.applicationDate
      };

      await dispatch(updateRti({ id, payload })).unwrap();
      navigate(`/rtis/${id}`);
    } catch (error) {
      setSubmitError(typeof error === 'string' ? error : error?.message || 'Failed to update RTI');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Edit RTI Application</Typography>
      <RTIForm
        value={form}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Update RTI"
        submitError={submitError}
        submitting={submitting}
        secondaryActionLabel="Back"
        onSecondaryAction={() => navigate(`/rtis/${id}`)}
      />
    </Stack>
  );
}
