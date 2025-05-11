import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppSelector } from '../hooks';

// IE-specific Navigator interface extensions
interface MSNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}

const DownloadSQLButton: React.FC = () => {
  const sql = useAppSelector((state) => state.query.sql);

  const downloadContent = (name: string, content: string) => {
    if ((navigator as MSNavigator).msSaveBlob) {
      const blobObject = new Blob([content], { type: 'text/plain' });

      (window.navigator as MSNavigator).msSaveOrOpenBlob?.(blobObject, name);
    } else {
      const aTag = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });

      aTag.href = URL.createObjectURL(file);
      aTag.download = name;

      document.body.appendChild(aTag);
      aTag.click();
    }
  };

  return (
    <Button className="mr-2" onClick={() => downloadContent('select_query.sql', sql)}>
      <FontAwesomeIcon icon="download" />
      <div className="d-inline"> SQL</div>
    </Button>
  );
};

export default DownloadSQLButton;
