import React from 'react';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import history from './utils/history';
import store from './store';
import LandingPage from './routes/LandingPage';
import QueryPage from './routes/QueryPage';
// Import React Flow styles for global usage
import '@xyflow/react/dist/style.css';

const App: React.FC = () => (
  <Provider store={store}>
    <Router history={history}>
      <div>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/query" component={QueryPage} />
      </div>
    </Router>
  </Provider>
);

export default App;
