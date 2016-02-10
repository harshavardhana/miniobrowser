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

import JSONrpc from './jsonrpc'
import * as  actions from './actions'
import Moment from 'moment'

export default class Web {
  constructor(endpoint, history, dispatch) {
    const namespace = 'Web'
    this.history = history
    this.dispatch = dispatch
    this.JSONrpc = new JSONrpc({
      endpoint, namespace
    })
  }
  makeCall(method, options) {
    return this.JSONrpc.call(method, {
      params: [options]
    }, localStorage.token)
    .then(res => {
      if (!Moment(res.uiVersion).isValid()) {
        throw new Error("Invalid UI version in the JSON-RPC response")
      }
      if (res.uiVersion !== currentUiVersion) {
        this.dispatch(actions.setLatestUIVersion(res.uiVersion))
      }
      return res
    })
    .catch(err => {
      if (err.status === 401) {
        delete(localStorage.token)
        this.history.pushState(null, '/login')
        throw new Error('Please re-login.')
      }
      if (err.res && err.res.text) {
        let errjson
        try {
          errjson = JSON.parse(err.res.text)
        } catch (ex) {
          throw new Error(err.res.text)
        }
        throw new Error(errjson.error)
      }
      if (err.status) throw new Error(`Server returned error [${err.status}]`)
      throw new Error('Minio server is unreachable')
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
}
