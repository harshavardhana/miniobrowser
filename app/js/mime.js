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

// List of official MIME Types: http://www.iana.org/assignments/media-types/media-types.xhtml
const supportedSubMimeTypes = {
  'xml': 'code',
  'pdf': 'pdf',
  'zip': 'zip',
  'ogg': 'audio',
  'gzip': 'zip',
  'json': 'code',
  'text': 'text',
  'image': 'image',
  'msword': 'doc',
  'ms-word': 'doc',
  'ms-excel': 'excel',
  'javascript': 'code',
  'spreadsheet': 'excel',
  'opendocument.text': 'doc',
  'presentation': 'presentation',
  'ms-powerpoint': 'presentation',
}

export const getDataType = (contentType) => {
  // Split the contentType two part identifiers.
  let mimeIdentifiers = contentType.split('/');
  let mimeType = mimeIdentifiers[0];
  let mimeSubType = mimeIdentifiers[1];

  // For mime type 'application' we need to look into its
  // sub type to figure the relevant data type.
  if (mimeType === 'application') {
    for (var sMimeType in supportedSubMimeTypes) {
      if (mimeSubType.indexOf(sMimeType) !== -1) {
        return supportedSubMimeTypes[sMimeType]
      }
    }
    return 'other'
  }
  // For all other mime type like audio, video, text treat
  // them as valid data types and use as is.
  return mimeType
}
