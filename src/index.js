import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route} from "react-router-dom";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Jump from './Jump';

function Routers(){
    return (
        <Router>
        <Route exact path="/" component={App} />
        <Route path="/jump" component={Jump} />
        </Router>

    );
}
ReactDOM.render(<Routers />, document.getElementById('root'));

serviceWorker.register();