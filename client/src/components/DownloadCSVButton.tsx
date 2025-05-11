import React from 'react';
import { CSVLink } from 'react-csv';
import _ from 'lodash';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppSelector } from '../hooks';
import { ResultType } from '../types/queryTypes';

interface CSVHeader {
  label: string;
  key: string;
}

const DownloadCSVButton: React.FC = () => {
  const result = useAppSelector((state) => state.query.result);

  const getHeaders = (result: ResultType | null): CSVHeader[] => {
    if (_.isNull(result)) {
      return [];
    }

    const headers: CSVHeader[] = [];

    result.fields.forEach((field) => {
      const header: CSVHeader = {
        label: field.name,
        key: field.name,
      };

      headers.push(header);
    });

    return headers;
  };

  const getData = (result: ResultType | null): any[] => {
    if (_.isNull(result)) {
      return [];
    }
    return result.rows;
  };

  const disabled = _.isNull(result);

  return (
    <CSVLink className="mr-2" data={getData(result)} headers={getHeaders(result)} filename="result.csv">
      <Button disabled={disabled}>
        <FontAwesomeIcon icon="download" />
        <div className="d-inline"> CSV</div>
      </Button>
    </CSVLink>
  );
};

export default DownloadCSVButton;
