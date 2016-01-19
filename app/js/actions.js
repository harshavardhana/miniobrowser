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

import web from './web'

export const SET_WEB = 'SET_WEB'
export const SET_CURRENT_BUCKET = 'SET_CURRENT_BUCKET'
export const SET_CURRENT_PATH = 'SET_CURRENT_PATH'
export const SET_BUCKETS = 'SET_BUCKETS'
export const ADD_BUCKET = 'ADD_BUCKET'
export const SET_VISIBLE_BUCKETS = 'SET_VISIBLE_BUCKETS'
export const SET_OBJECTS = 'SET_OBJECTS'
export const SET_DISK_INFO = 'SET_DISK_INFO'
export const SHOW_MAKEBUCKET_MODAL = 'SHOW_MAKEBUCKET_MODAL'

export const setWeb = web => {
  return {
    type: SET_WEB,
    web
  }
}

export const setBuckets = buckets => {
  return {
    type: SET_BUCKETS,
    buckets
  }
}

export const addBucket = bucket => {
  return {
    type: ADD_BUCKET,
    bucket
  }
}

export const showMakeBucketModal = () => {
  return {
    type: SHOW_MAKEBUCKET_MODAL,
    showMakeBucketModal: true
  }
}

export const hideMakeBucketModal = () => {
  return {
    type: SHOW_MAKEBUCKET_MODAL,
    showMakeBucketModal: false
  }
}

export const setVisibleBuckets = visibleBuckets => {
  return {
    type: SET_VISIBLE_BUCKETS,
    visibleBuckets
  }
}

export const setObjects = (objects) => {
  return {
    type: SET_OBJECTS,
    objects
  }
}

export const setCurrentBucket = currentBucket => {
  return {
    type: SET_CURRENT_BUCKET,
    currentBucket
  }
}

export const setCurrentPath = currentPath => {
  return {
    type: SET_CURRENT_PATH,
    currentPath
  }
}

export const setDiskInfo = diskInfo => {
  return {
    type: SET_DISK_INFO,
    diskInfo
  }
}

export const selectBucket = (currentBucket) => {
  return (dispatch, getState) => {
    let web = getState().web
    dispatch(setCurrentBucket(currentBucket))
    dispatch(setCurrentPath(''))
    web.ListObjects({bucketName: currentBucket})
      .then(objects => {
        if (!objects) objects = []
        dispatch(setObjects(
          objects.reduce((acc, object) => {
            if (object.name.endsWith('/')) acc.unshift(object)
            else acc.push(object)
            return acc
          }, [])
        ))
      })
  }
}

export const selectPrefix = prefix => {
  return (dispatch, getState) => {
    const { currentBucket, currentPath, web } = getState()
    if (prefix === currentPath) return
    web.ListObjects({bucketName: currentBucket, prefix})
      .then(objects => {
        if (!objects) objects = []
        dispatch(setObjects(
          objects.map(object => {object.name = object.name.replace(`${prefix}`, ''); return object})
                 .reduce((acc, object) => {
                   if (object.name.endsWith('/')) acc.unshift(object)
                   else acc.push(object)
                   return acc
                 }, [])
        ))
        dispatch(setCurrentPath(prefix))
      })
  }
}
