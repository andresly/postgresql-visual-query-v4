import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import thunk from 'redux-thunk';
import { FilterSwitch } from '../../components/FilterSwitch';

describe('Component: FilterSwitch', () => {
    let props;
    let mockStore;
    let component;
  
    beforeEach(() => {
    props = {
        column: {
            returning: false,
            returningOnly: false,
        },
        only: false,
        updateColumn: jest.fn(),
    }
  
      mockStore = configureStore([thunk]);
    });

    test('FilterSwitch renders with default props', () => {
        component = shallow(<FilterSwitch {...props} />);
    
        expect(component).toMatchSnapshot();
    });

    test('FilterSwitch handleSave calls updateColumn once', () => {
        component = shallow(<FilterSwitch {...props} />).simulate('change');

        expect(props.updateColumn.mock.calls.length).toBe(1);
    });

    test('FilterSwitch handleSave calls updateColumn once if only is true', () => {

        props = {
            column: {
                returning: false,
                returningOnly: false,
            },
            only: true,
            updateColumn: jest.fn(),
        }

        component = shallow(<FilterSwitch {...props} />).simulate('change');

        expect(props.updateColumn.mock.calls.length).toBe(1);
    });
});