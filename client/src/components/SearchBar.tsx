import React, { useState } from 'react';
import { Input } from 'reactstrap';
import { search } from '../actions/databaseActions';
import { translations } from '../utils/translations';
import { useAppSelector, useAppDispatch } from '../hooks';
import { LanguageType } from '../types/settingsType';

const SearchBar: React.FC = () => {
  const [expr, setExpr] = useState('');
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language) as LanguageType;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpr(value);
    dispatch(search(value));
  };

  return (
    <div>
      <Input
        bsSize="sm"
        type="text"
        id="searchBar"
        name="expr"
        placeholder={translations[language.code].sideBar.searchPh}
        value={expr}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
