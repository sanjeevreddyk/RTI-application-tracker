import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import RTIForm from '../components/RTIForm';
import { fetchRtiById, updateRti } from '../features/rti/rtiSlice';

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
  const [form, setForm] = useState(empty);

  useEffect(() => {
    dispatch(fetchRtiById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selected && selected._id === id) {
      setForm({
        ...selected,
        applicationDate: selected.applicationDate?.slice(0, 10)
      });
    }
  }, [selected, id]);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    await dispatch(updateRti({ id, payload: { ...form, applicationFee: Number(form.applicationFee) } }));
    navigate(`/rtis/${id}`);
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Edit RTI Application</Typography>
      <RTIForm
        value={form}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Update RTI"
        secondaryActionLabel="Back"
        onSecondaryAction={() => navigate(`/rtis/${id}`)}
      />
    </Stack>
  );
}
