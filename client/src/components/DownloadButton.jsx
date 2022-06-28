import React from 'react';
import Button from 'react-bootstrap/Button';
import XLSX from 'xlsx';
import api from '../utils/api';

export default function DownloadButton() {
  const handleClick = () => {
    api
      .downloadMongoData()
      .then(res => {
        const json = res;
        const worksheet = XLSX.utils.json_to_sheet(json);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.writeFile(workbook, 'out.xlsx');
      })
      .catch(err => console.log(err));
  };

  return (
    <>
      <div className="mongo-download">
        <Button onClick={handleClick} variant="primary" size="sm">
          Download Schedule
        </Button>
      </div>
    </>
  );
}
