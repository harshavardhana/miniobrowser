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

import { browserHistory } from 'react-router'
import JSONrpc from './jsonrpc'
import * as  actions from './actions'
import Moment from 'moment'

export default class Web {
  constructor(endpoint,  dispatch) {
    const namespace = 'Web'
    this.dispatch = dispatch
    this.JSONrpc = new JSONrpc({
      endpoint, namespace
    })
  }
  makeCall(method, options) {
    return this.JSONrpc.call(method, {
      params: options
    }, localStorage.token)
    .catch(err => {
      if (err.status === 401) {
        delete(localStorage.token)
        browserHistory.push('/minio/login')
        throw new Error('Please re-login.')
      }
      if (err.status) throw new Error(`Server returned error [${err.status}]`)
      throw new Error('Minio server is unreachable')
    })
    .then(res => {
      let json = JSON.parse(res.text)
      let result = json.result
      let error = json.error
      if (error) {
        throw new Error(error.message)
      }
      if (!Moment(result.uiVersion).isValid()) {
        throw new Error("Invalid UI version in the JSON-RPC response")
      }
      if (result.uiVersion !== currentUiVersion) {
        this.dispatch(actions.setLatestUIVersion(result.uiVersion))
      }
      return result
    })
  }
  LoggedIn() {
    return !!localStorage.token
  }
  Login(args) {
    return this.makeCall('Login', args)
                .then(res => {
                  localStorage.token = `${res.token}`
                  return res
                })
  }
  Logout() {
    delete(localStorage.token)
  }
  ServerInfo() {
    return this.makeCall('ServerInfo')
  }
  DiskInfo() {
    return this.makeCall('DiskInfo')
  }
  ListBuckets() {
    return this.makeCall('ListBuckets')
  }
  MakeBucket(args) {
    return this.makeCall('MakeBucket', args)
  }
  ListObjects(args) {
    return this.makeCall('ListObjects', args)
  }
  GetObjectURL(args) {
    return this.makeCall('GetObjectURL', args)
  }
  PutObjectURL(args) {
    return this.makeCall('PutObjectURL', args)
  }
  RemoveObject(args) {
    return this.makeCall('RemoveObject', args)
  }
  GetUIVersion() {
    // The call should work even in logged out state.
    return this.JSONrpc.call('GetUIVersion', {
      params: {}
    })
  }
}
