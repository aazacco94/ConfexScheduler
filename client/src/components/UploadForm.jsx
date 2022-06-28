import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';
import api from '../utils/api';
import { excelToJson } from '../utils/helpers';

// Allowed file types for upload
const mimeTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel', // XLS
].join();

export default function UploadForm({ disabled, onUpload }) {
  const [validated, setValidated] = useState(false);

  const uploadFile = event => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      const file = form.formFile.files[0];
      excelToJson(file)
        .then(json => api.initialUpload(json))
        .then(() => onUpload())
        .catch(err => {
          console.log(err);
        });
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={uploadFile}>
      <Form.Group controlId="formFile">
        <Form.Label>Please upload a .xls or .xlsx file</Form.Label>
        <Form.Control
          required
          className="mt-2"
          type="file"
          size="sm"
          accept={mimeTypes}
          onChange={() => setValidated(true)}
        />
        <Form.Control.Feedback type="invalid">
          Please choose a file.
        </Form.Control.Feedback>
      </Form.Group>
      {disabled
        ? <p className="mt-3">Upload complete.</p>
        : (
          <Button type="submit" size="sm" className="mt-3">
            Upload
          </Button>
        )}
    </Form>
  );
}

UploadForm.propTypes = {
  disabled: PropTypes.bool,
  onUpload: PropTypes.func,
};

UploadForm.defaultProps = {
  disabled: false,
  onUpload: () => {},
};
