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

import JSONrpc from './jsonrpc'

export default class Web {
  constructor(endpoint, token) {
    var namespace = 'Web'
    this.JSONrpc = new JSONrpc({
      endpoint, namespace, token
    })
  }
  makeCall(method, options) {
    return this.JSONrpc.call(method, {
      params: [options]
    })
  }
  Login(args) {
    return this.makeCall("Login", args)
  }
  ListBuckets() {
    return this.makeCall("ListBuckets")
  }
  ListObjects(args) {
    return this.makeCall("ListObjects", args)
  }
  GetObjectUrl(args) {
    return this.makeCall("GetObjectUrl", args)
  }
}
