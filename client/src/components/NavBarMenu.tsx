import React, { useState } from 'react';
import { Row, Input, Label, Col } from 'reactstrap';
import _ from 'lodash';
import { InputWithDeleteButton } from './InputWithDeleteButton';
import { AddNewButton } from './AddNewButton';
import { translations } from '../utils/translations';
import { LanguageType } from '../types/settingsType';
import { QueryType } from '../types/queryTypes';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addQuery } from '../actions/queriesActions';
import { setActiveQuery, changeQueryType } from '../actions/queryActions';
import SaveQueryButton from './SaveQueryButton';
import LoadQueryButton from './LoadQueryButton';
import ClearQueryButton from './ClearQueryButton';

interface NavBarMenuProps {
  language: LanguageType;
}

export const NavBarMenu: React.FC<NavBarMenuProps> = ({ language }) => {
  const [queryName, setQueryName] = useState<string>('');

  const dispatch = useAppDispatch();
  const activeQuery = useAppSelector((state) => state.query) as QueryType;
  const queryType = useAppSelector((state) => state.query.queryType) as string;

  const handleAddQuery = () => {
    dispatch(addQuery(activeQuery.id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryName(e.target.value);

    let query = _.cloneDeep(activeQuery);

    query = {
      ...query,
      [e.currentTarget.name]: e.target.value || '',
    };

    dispatch(setActiveQuery(query));
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    let query = _.cloneDeep(activeQuery);

    setQueryName('');

    query = {
      ...query,
      [(e.currentTarget as HTMLButtonElement).name]: '',
    };

    dispatch(setActiveQuery(query));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeQueryType(e.target.value));
  };

  return (
    <div className="pl-2 align-self-start m-0 pt-1 pb-2 bg-light">
      {activeQuery.id !== 0 && (
        <Row form>
          <div className="col-auto">
            <InputWithDeleteButton
              className="pb-2"
              id="newQueryAlias"
              name="queryName"
              placeholder={`${translations[language.code].queryBuilder.queryNamePh}`}
              tooltipTarget="newQueryAlias"
              tooltipText={` ${translations[language.code].tooltips.queryName}`}
              value={queryName}
              handleChange={handleChange}
              handleRemove={handleRemove}
            />
          </div>
        </Row>
      )}
      <div className="col-12 pl-0 text-info pt-6">
        <AddNewButton size="sm" id="newQuery" onClick={handleAddQuery} />
        {` ${translations[language.code].queryBuilder.queryH}`}
      </div>
      <div className="col-auto pl-0 pt-3 d-flex align-items-center">
        <Row form className="align-items-center">
          <Label for="changeQueryType">Statement type:</Label>
          <Col md={3}>
            <Input bsSize="sm" type="select" id="changeQueryType" onChange={handleTypeChange} value={queryType}>
              <option value="SELECT">SELECT</option>
              <option value="DELETE">DELETE</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
            </Input>
          </Col>
          <Col md={8} className="d-flex pt-3">
            <SaveQueryButton />
            <LoadQueryButton />
            <ClearQueryButton />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NavBarMenu;
