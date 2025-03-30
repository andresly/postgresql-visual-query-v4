import React, { Fragment, useEffect, useState } from 'react';
import {
  Button,
  ButtonDropdown,
  Collapse,
  DropdownMenu,
  DropdownToggle,
  ListGroup,
  ListGroupItem,
  Navbar,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { translations } from '../utils/translations';
import NavBarMenu from './NavBarMenu';
import NavBarQueryTabs from './NavBarQueryTabs';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';
import { useAppSelector } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { QueryType } from '../types/queryTypes';

interface NavBarProps {
  language: LanguageType;
  queryType: string;
}

interface QueryWithSubqueries extends QueryType {
  subqueries?: QueryWithSubqueries[];
}

const NavBar: React.FC<NavBarProps> = ({ language, queryType }) => {
  const [showNavBarMenu, setShowNavBarMenu] = useState(true);
  const [dropdownOpen, setOpen] = useState(false);
  const [treeElementOpen, setTreeElementOpen] = useState<{ [key: string]: boolean }>({});
  const { activeTableId } = useAppSelector((state) => state.tableView);

  const queries = useAppSelector((state) => {
    return [...state.queries, state.query]
      .slice()
      .sort((query1: QueryType, query2: QueryType) => query1.id - query2.id);
  });

  const toggleDropdown = () => setOpen(!dropdownOpen);

  const handleVisibility = () => {
    setShowNavBarMenu(!showNavBarMenu);
  };

  const mapper = (queriesObj: QueryWithSubqueries[], parentId?: string, lvl = 0) =>
    queriesObj.map((query) => {
      const toggleTreeElement = (e: React.MouseEvent<HTMLButtonElement>) => {
        const id = e.currentTarget.getAttribute('id');
        if (id) {
          setTreeElementOpen((state) => ({ ...state, [id]: !state[id] }));
        }
      };

      const id = `${query.id}-${parentId || 'top'}`.replace(/[^a-zA-Z0-9-_]/g, '');

      return (
        <Fragment key={_.uniqueId('fragment_')}>
          <ListGroupItem
            key={id}
            style={{ zIndex: 0 }}
            className={`${parentId ? `rounded-0 ${lvl ? 'border-bottom-0' : ''}` : ''}`}
          >
            <div style={{ paddingLeft: `${25 * lvl}px` }}>
              {query.subqueries && (
                <Button color="link" className="pt-0 ml-n3" id={id} key={id} onClick={toggleTreeElement}>
                  {treeElementOpen[id] ? (
                    <FontAwesomeIcon icon="sort-down" className="fa-rotate-270" />
                  ) : (
                    <FontAwesomeIcon icon="sort-down" />
                  )}
                </Button>
              )}
              {getCorrectQueryName(language, query.queryName, query.id)}
            </div>
          </ListGroupItem>
          {query.subqueries && (
            <Collapse isOpen={!!treeElementOpen[id]}>{mapper(query.subqueries, id, (lvl || 0) + 1)}</Collapse>
          )}
        </Fragment>
      );
    });

  return (
    <div className="mb-2">
      <Navbar className="m-0 pt-1 pl-2 pb-0" color="light" light expand="sm">
        <ButtonDropdown size="sm" isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle className="btn-sm btn-light btn-outline-secondary" caret>
            <FontAwesomeIcon icon="project-diagram" size="1x" className="pr-2" style={{ width: '1.6rem' }} />
            {translations[language.code].queryBuilder.queriesH}
          </DropdownToggle>
          <DropdownMenu className="p-0">
            <ListGroup>{mapper(queries)}</ListGroup>
          </DropdownMenu>
        </ButtonDropdown>
        <span
          className="pl-2 mb-2"
          style={{
            color: '#989ea4',
            fontSize: '1.7rem',
          }}
        >
          |
        </span>
        <div className="col-10 px-1 pl-2 flex d-flex align-items-center flex-wrap">
          <NavBarQueryTabs />
        </div>
        <div
          className="col-auto pt-3 mr-3 d-flex justify-content-start ml-auto w-auto position-absolute"
          style={{ right: '0', top: '0' }}
        >
          <Button
            onClick={handleVisibility}
            size="sm"
            className="btn-light btn-outline-secondary border-0"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <FontAwesomeIcon
              icon="angle-down"
              size="2x"
              color="#6c757d"
              className={showNavBarMenu ? 'fa-rotate-180' : ''}
            />
          </Button>
        </div>
      </Navbar>
      {showNavBarMenu && !activeTableId && <NavBarMenu language={language} />}
    </div>
  );
};

export default NavBar;
