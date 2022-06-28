import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';

export default function DateRagePicker() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  const onChange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    if (!endDate) {
      return;
    }
    const date = { startDate, endDate };
    api.storeConferenceTimes(date)
      .then(res => res)
      .catch(err => { throw new Error(err.message); });
  }, [startDate, endDate]);

  return (
    <DatePicker
      selected={startDate}
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
      allowSameDay
    />
  );
}
