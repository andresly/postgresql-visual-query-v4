import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import thunk from 'redux-thunk';
import { UpdateSwitch } from '../../components/UpdateSwitch';

describe('Component: UpdateSwitch', () => {
    let props;
    let mockStore;
    let component;
  
    beforeEach(() => {
    props = {
        column: {
            value_enabled: true,
        },
        updateColumn: jest.fn(),
    }
  
      mockStore = configureStore([thunk]);
    });

    test('UpdateSwitch renders with default props', () => {
        component = shallow(<UpdateSwitch {...props} />);
    
        expect(component).toMatchSnapshot();
    });

    test('UpdateSwitch handleSave calls updateColumn once', () => {
        component = shallow(<UpdateSwitch {...props} />).simulate('change');

        expect(props.updateColumn.mock.calls.length).toBe(1);
    });
});