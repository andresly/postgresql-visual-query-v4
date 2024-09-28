import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import thunk from 'redux-thunk';
import { SetInput } from '../../components/SetInput';

describe('Component: SetInput', () => {
    let props;
    let mockStore;
    let component;
  
    beforeEach(() => {
    props = {
        column: {
            id: 0,
            column_value: 'test'
        },
        enabled: true,
        updateColumn: jest.fn(),
    }
  
      mockStore = configureStore([thunk]);
    });

    test('SetInput renders with default props', () => {
        component = shallow(<SetInput {...props} />);
    
        expect(component).toMatchSnapshot();
    });

    test('SetInput handleSave calls updateColumn once', () => {
        component = shallow(<SetInput {...props} />).simulate('blur');

        expect(props.updateColumn.mock.calls.length).toBe(1);
    });
});