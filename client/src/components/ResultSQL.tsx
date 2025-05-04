import React, { useEffect } from 'react';
import '../codemirror-custom/codemirrorcustom.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/edit/matchbrackets';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateSql } from '../actions/queryActions';

interface ResultSQLProps {
  isFloating: boolean;
  onFloatToggle: (floating: boolean) => void;
}

export const ResultSQL: React.FC<ResultSQLProps> = ({ isFloating, onFloatToggle }) => {
  const { sql } = useAppSelector((state) => state.query);
  const dispatch = useAppDispatch();

  // Toggle padding on query-area when floating state changes
  useEffect(() => {
    const queryArea = document.getElementById('query-area');
    if (queryArea) {
      queryArea.style.paddingBottom = isFloating ? '312px' : '0';
    }

    return () => {
      const queryArea = document.getElementById('query-area');
      if (queryArea) {
        queryArea.style.paddingBottom = '0';
      }
    };
  }, [isFloating]);

  const containerStyle = isFloating
    ? {
        position: 'fixed' as const,
        bottom: '20px',
        width: '83%',
        height: '300px',
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column' as const,
      }
    : {
        height: '30vh',
      };

  return (
    <div className={`col-sm-12 p-0 ${isFloating ? '' : ''}`} style={containerStyle}>
      {isFloating && (
        <div
          style={{
            padding: '8px',
            paddingRight: '20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>SQL Editor</span>
          <button
            onClick={() => onFloatToggle(false)}
            className="btn btn-sm btn-outline-secondary"
            style={{ padding: '2px 8px' }}
            type="button"
          >
            Dock
          </button>
        </div>
      )}
      <div className={`${isFloating ? 'flex-grow-1' : ''} ml-n1 border`} style={{ overflow: 'auto' }}>
        <CodeMirror
          className="CodeMirror"
          value={sql}
          onChange={(editor, data, value) => {
            if (data.origin) {
              dispatch(updateSql(value));
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
      {!isFloating && (
        <button
          onClick={() => onFloatToggle(true)}
          className="btn btn-sm btn-outline-secondary"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '2px 8px',
          }}
          type="button"
        >
          Float
        </button>
      )}
    </div>
  );
};

export default ResultSQL;
