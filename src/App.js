import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/home";
import Chartroom from "./components/chartroom";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
        <Login/>
        </Route>
        <Route exact path="/signup">
          <Signup/>
        </Route>
        <Route exact path="/home">
          <Home/>
        </Route>
        <Route exact path="/chartroom">
          <Chartroom/>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;