/*
 * Isomorphic Javascript library for Minio Browser JSON-RPC API, (C) 2016 Minio, Inc.
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

import '../bower_components/font-awesome/css/font-awesome.css'
import '../bower_components/animate.css/animate.min.css'
import './less/main.less'

import React from 'react'
import ReactDOM from 'react-dom'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Route, Router } from 'react-router'
import { Provider, connect } from 'react-redux'

import * as actions from './js/actions.js'
import reducer from './js/reducers.js'

import _Login from './js/components/Login.js'
import _Browse from './js/components/Browse.js'

import Web from './js/web'
window.Web = Web

let store =  applyMiddleware(thunkMiddleware)(createStore)(reducer)
let Browse = connect(state => state)(_Browse)
let Login = connect(state => state)(_Login)
let web = new Web(`${window.location.protocol}//${window.location.host}/rpc`)

if (window.location.host === 'localhost:8080') {
  web = new Web('http://localhost:9001/rpc')
}

window.web = web
store.dispatch(actions.setWeb(web))

function authNeeded(nextState, replace) {
  if (!web.LoggedIn()) {
    replace(
      nextState,
      '/'
    )
    return
  }
}

function authNotNeeded(nextState, replace) {
  if (web.LoggedIn()) {
    replace(
      nextState,
      '/browse'
    )
    return
  }
}

ReactDOM.render((
  <Provider store={store} web={web}>
    <Router history={createBrowserHistory()}>
      <Route path='/' component={Login} onEnter={authNotNeeded} />
      <Route path='/browse' component={Browse} onEnter={authNeeded} />
      <Route path='/browse/:bucketName' component={Browse} onEnter={authNeeded} />
    </Router>
  </Provider>
), document.getElementById('root'))
