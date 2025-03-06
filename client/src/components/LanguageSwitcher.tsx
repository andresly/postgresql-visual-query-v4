import React, { useState } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { useAppDispatch, useAppSelector } from '../hooks';
import { languages } from '../utils/translations';
import { changeLanguage } from '../actions/settingsActions';
import { SettingsType } from '../types/settingsType';

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const language = useAppSelector((state) => state.settings.language);
  const dispatch = useAppDispatch();

  const toggle = () => setIsOpen(!isOpen);

  const handleOnClick = (selectedLanguage: SettingsType['language']) => {
    dispatch(changeLanguage(selectedLanguage));
  };

  return (
    <Dropdown direction="right" size="sm" isOpen={isOpen} toggle={toggle}>
      <DropdownToggle className="btn btn-light btn-outline-secondary" caret>
        {language.name}
      </DropdownToggle>
      <DropdownMenu>
        {languages.map((language) => (
          <DropdownItem key={language.code} onClick={() => handleOnClick(language)}>
            {language.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
