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

export const supportedTypes = {
  'text/html': 'code',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/gzip': 'zip',
  'application/json': 'code',
  'application/javascript': 'code',
  'x-conference/x-cooltalk': 'audio'
}

export const getDataType = (contentType) => {
  let dataType = supportedTypes[contentType]
  if (dataType) {
    return dataType
  }
  dataType = contentType.split('/')[0]
  // For all other unsupported types if the mime preceding
  // value is 'application' treat it as generic.
  if (dataType === 'application') {
    return 'other'
  }
  // For all other mimes like audio, video, text data type
  // is already valid and supported.
  return dataType
}
