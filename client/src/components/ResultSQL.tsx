import React from 'react';
import '../codemirror-custom/codemirrorcustom.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/edit/matchbrackets';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateSql } from '../actions/queryActions';

export const ResultSQL: React.FC = () => {
  const { sql } = useAppSelector((state) => state.query);
  const dispatch = useAppDispatch();

  return (
    <div className="col-sm-12 p-0" style={{ height: '30vh' }}>
      <div className="ml-n1 border" style={{ resize: 'vertical', overflow: 'auto' }}>
        <CodeMirror
          className="CodeMirror"
          value={sql}
          onChange={(editor, data, value) => {
            if (data.origin) {
              dispatch(updateSql({ sqlString: value }));
            }
          }}
          autoCursor={false}
          options={{
            mode: 'text/x-pgsql',
            lineNumbers: true,
            matchBrackets: true,
            readOnly: false,
            minLines: 10,
          }}
        />
      </div>
    </div>
  );
};

export default ResultSQL;
