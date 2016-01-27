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

import React, { PropTypes } from 'react'
import logo from '../../img/logo.svg'

export default class Login extends React.Component {
  handleSubmit(event) {
    event.preventDefault()
    const { web } = this.props
    web.Login({username: this.refs.accessKey.value, password: this.refs.secretKey.value})
      .then((res) => {
        this.props.history.pushState(null, '/browse')
      })
  }
  render() {
    return (
      <div>
      <div className="login">
      <div className="l-content">
        <div className="lc-wrap">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <div className="lc-item">
                <input ref="accessKey" className="lci-text" type="text" spellCheck="false"/>
                <label className="lci-label">Access Key</label>

                <div className="lci-helpers">
                    <i></i><i></i>
                </div>
            </div>
            <div className="lc-item">
                <input ref="secretKey" className="lci-text" type="password" spellCheck="false"/>
                <label className="lci-label">Secret Key</label>

                <div className="lci-helpers">
                    <i></i><i></i>
                </div>
            </div>
            <button className="btn btn-default" type="submit">
              <i className="fa fa-sign-in"></i> Login
            </button>
          </form>
        </div>
      </div>

      <a className="l-logo" href="">
          <img src={logo} alt=""/>
      </a>

      <div className="server-info">{window.location.host}</div>
      </div>
      </div>
    )
  }
}
