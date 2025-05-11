import { Button, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import React, { useState } from 'react';
import { useAppSelector } from '../hooks';
import { translations } from '../utils/translations';

const InformationPopover: React.FC = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const language = useAppSelector((state) => state.settings.language);

  const toggle = () => setPopoverOpen(!popoverOpen);

  return (
    <div>
      <Button
        type="button"
        id="infoPopover"
        className="btn-sm btn-light btn-outline-secondary"
        size="sm"
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '1rem',
          fontWeight: '600',
          fontSize: '1rem',
          marginRight: '3rem',
        }}
      >
        ?
      </Button>
      <Popover
        className="mw-100"
        style={{ whiteSpace: 'pre-line' }}
        placement="bottom"
        trigger="legacy"
        hideArrow={false}
        isOpen={popoverOpen}
        target="infoPopover"
        toggle={toggle}
      >
        <PopoverHeader>{translations[language.code].loginForm.aboutH}</PopoverHeader>
        <PopoverBody>{translations[language.code].loginForm.about}</PopoverBody>
      </Popover>
    </div>
  );
};

export default InformationPopover;
