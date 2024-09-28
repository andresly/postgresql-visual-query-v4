import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import thunk from 'redux-thunk';
import { FilterInput } from '../../components/FilterInput';

describe('Component: FilterInput', () => {
    let props;
    let mockStore;
    let component;
  
    beforeEach(() => {
    props = {
        filterId: 0,
        columnId: 0,
        filter: 'filter',
        updateColumnFilter: jest.fn(),
    }
  
      mockStore = configureStore([thunk]);
    });

    test('FilterInput renders with default props', () => {
        component = shallow(<FilterInput {...props} />);
    
        expect(component).toMatchSnapshot();
    });

    test('FilterInput handleSave calls updateColumnFilter once', () => {
        component = shallow(<FilterInput {...props} />).simulate('blur');

        expect(props.updateColumnFilter.mock.calls.length).toBe(1);
    });
});