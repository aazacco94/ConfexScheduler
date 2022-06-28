import React from 'react';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';

export default function Paginate({ pageCount, onPageChange }) {
  return (
    <ReactPaginate
      pageCount={pageCount}
      onPageChange={onPageChange}
      previousLabel="&laquo;"
      nextLabel="&raquo;"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      activeClassName="active"
      containerClassName="pagination justify-content-center"
    />
  );
}

Paginate.propTypes = {
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
