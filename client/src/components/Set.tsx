import React, { useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Card, CardBody, Container, CustomInput, Form, FormGroup, Row, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { useAppSelector, useAppDispatch } from '../hooks';
import { removeSet, updateSet } from '../actions/queryActions';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';
import { SetType, QueryType } from '../types/queryTypes';
import { translations } from '../utils/translations';

interface SetProps {
  id: string;
  set: SetType;
  index: number;
  queryName: string;
  queryId: number;
}

export const Set: React.FC<SetProps> = ({ id, set, index, queryName, queryId }) => {
  const dispatch = useAppDispatch();
  const { language, queries } = useAppSelector((state) => ({
    language: state.settings.language,
    queries: state.queries
      .filter((query: QueryType) => query.id !== 0)
      .sort((query1: QueryType, query2: QueryType) => query1.id - query2.id),
  }));

  useEffect(() => {
    if (set.subqueryId) {
      const subquery = queries.find((query: QueryType) => query.id === set.subqueryId);
      const newSubquerySql = subquery ? subquery.sql : '';

      if (newSubquerySql !== set.subquerySql) {
        const newSet = _.cloneDeep(set);

        dispatch(
          updateSet({
            ...newSet,
            subquerySql: newSubquerySql,
          }),
        );
      }
    }
  }, [set.subqueryId, dispatch, queries, set.subquerySql]);

  const selectedQuery = queries.find((query: QueryType) => query.id === set.subqueryId);
  const selectedQueryId = selectedQuery ? selectedQuery.id : 0;

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const newSet = {
      ..._.cloneDeep(set),
      type: e.target.value,
    };

    dispatch(updateSet(newSet));
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const subqueryId = +e.target.value;
    const subquerySql = subqueryId ? queries.find((query: QueryType) => query.id === subqueryId)?.sql || '' : '';

    const newSet = {
      ..._.cloneDeep(set),
      subqueryId,
      subquerySql,
    };

    dispatch(updateSet(newSet));
  };

  const handleRemove = () => {
    dispatch(removeSet(set));
  };

  return (
    <div className="my-2">
      <Draggable draggableId={id} index={index}>
        {(provided) => (
          <Card {...provided.draggableProps} {...provided.dragHandleProps} innerRef={provided.innerRef}>
            <CardBody className="py-2 px-0">
              <Form>
                <Container fluid>
                  <Row>
                    <div className="col-auto d-flex">
                      <FontAwesomeIcon className="align-self-center" icon="sort" />
                    </div>
                    <div className="col-10 px-0">
                      <div className="d-flex align-items-center">
                        <div className="col-auto pb-1">
                          <span
                            style={{
                              color: set.color,
                              fontWeight: 'bold',
                              fontSize: 'large',
                            }}
                          >
                            {'{}'}
                          </span>
                        </div>
                        <div className="col-auto">
                          {index === 0
                            ? getCorrectQueryName(language, queryName, queryId)
                            : translations[language.code].queryBuilder.setResult}
                        </div>
                        <div className="col-auto">
                          <FormGroup className="m-0">
                            <CustomInput
                              bsSize="sm"
                              type="select"
                              id={`${id}-set-type`}
                              onChange={handleTypeChange}
                              value={set.type}
                              key={`set-type-${id}-query-${queryId}`}
                            >
                              <option value="union">UNION</option>
                              <option value="unionall">UNION ALL</option>
                              <option value="intersect">INTERSECT</option>
                              <option value="intersectall">INTERSECT ALL</option>
                              <option value="except">EXCEPT</option>
                              <option value="exceptall">EXCEPT ALL</option>
                            </CustomInput>
                            <UncontrolledTooltip
                              placement="top"
                              delay={{ show: 500, hide: 0 }}
                              target={`${id}-set-type`}
                            >
                              {translations[language.code].tooltips.setType}
                            </UncontrolledTooltip>
                          </FormGroup>
                        </div>
                        <div className="col-5">
                          <FormGroup className="m-0">
                            <CustomInput
                              bsSize="sm"
                              type="select"
                              name="select_query"
                              id={`set-query-${id}`}
                              key={`set-${id}-query-${queryId}`}
                              value={selectedQueryId}
                              onChange={handleQueryChange}
                            >
                              <option value="">{translations[language.code].queryBuilder.setQuery}</option>
                              {queries.map((query: QueryType) => (
                                <option key={`set-${id}-query-${query.id}`} value={query.id}>
                                  {getCorrectQueryName(language, query.queryName, query.id)}
                                </option>
                              ))}
                            </CustomInput>
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                    <div className="col-1 d-flex ml-auto pr-2 justify-content-end">
                      <FormGroup className="align-self-center m-0">
                        <Button size="sm" color="danger" onClick={handleRemove} id={`${id}-remove-set`}>
                          <FontAwesomeIcon icon="times" />
                        </Button>
                      </FormGroup>
                    </div>
                  </Row>
                </Container>
              </Form>
            </CardBody>
          </Card>
        )}
      </Draggable>
    </div>
  );
};

export default Set;
