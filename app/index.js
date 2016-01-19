import './less/main.less'

import './js/functions.js'

import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Router, browserHistory } from 'react-router'

// import Routes from './js/components/Routes.js'
import { Login } from './js/components/Login'

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/login" handler={Login}>
    </Route>
  </Router>
), document.getElementById('app'))
