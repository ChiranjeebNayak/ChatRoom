import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Chatroom from "./components/chatroom";
import Home from "./components/home";
import Login from "./components/login";
import React from "react";
import Signup from "./components/signup";

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
        <Route exact path="/chatroom">
          <Chatroom/>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;