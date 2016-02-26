/*
 * Minio Browser (C) 2016 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '../node_modules/font-awesome/css/font-awesome.css'
import '../node_modules/animate.css/animate.min.css'
import './less/main.less'

import React from 'react'
import ReactDOM from 'react-dom'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Route, Router, browserHistory, IndexRoute } from 'react-router'
import { Provider, connect } from 'react-redux'
import Moment from 'moment'

import * as actions from './js/actions.js'
import reducer from './js/reducers.js'

import _Login from './js/components/Login.js'
import _Browse from './js/components/Browse.js'

import Web from './js/web'
window.Web = Web

const store = applyMiddleware(thunkMiddleware)(createStore)(reducer)
const Browse = connect(state => state)(_Browse)
const Login = connect(state => state)(_Login)

let web = new Web(`${window.location.protocol}//${window.location.host}/minio/rpc`, store.dispatch)

if (window.location.host === 'localhost:8080') {
  web = new Web('http://localhost:9000/minio/rpc', store.dispatch)
}

window.web = web

store.dispatch(actions.setWeb(web))

function authNeeded(nextState, replace) {
  if (!web.LoggedIn()) {
    store.dispatch(actions.setLoginRedirectPath(location.pathname))
    replace('/minio/login')
    return
  }
}

function authNotNeeded(nextState, replace) {
  if (web.LoggedIn()) {
    replace('/minio')
  }
}

const App = (props) => {
  return  <div>
            {props.children}
          </div>
}

ReactDOM.render((
  <Provider store={store} web={web}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <Route path='minio' component={App}>
          <IndexRoute component={Browse} onEnter={authNeeded} />
          <Route path='login' component={Login} onEnter={authNotNeeded} />
          <Route path=':bucket' component={Browse} onEnter={authNeeded} />
          <Route path=':bucket/*' component={Browse} onEnter={authNeeded} />
        </Route>
      </Route>
    </Router>
  </Provider>
), document.getElementById('root'))
