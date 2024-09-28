import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import thunk from 'redux-thunk';
import { ValueInput } from '../../components/ValueInput';

describe('Component: ValueInput', () => {
    let props;
    let mockStore;
    let component;
  
    beforeEach(() => {
    props = {
        column: {
            id: 0,
            column_values: [{
                id: 0,
                value: 'test'
            }],
        },
        index: 0,
        returningOnly: false,
        updateColumn: jest.fn(),
    }
  
      mockStore = configureStore([thunk]);
    });

    test('ValueInput renders with default props', () => {
        component = shallow(<ValueInput {...props} />);
    
        expect(component).toMatchSnapshot();
    });

    test('ValueInput handleSave calls updateColumn once', () => {
        component = shallow(<ValueInput {...props} />).simulate('blur');

        expect(props.updateColumn.mock.calls.length).toBe(1);
    });
});