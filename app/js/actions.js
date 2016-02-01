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

import http from 'http'
import https from 'https'
import url from 'url'
import web from './web'
import Through2 from 'through2'

export const SET_WEB = 'SET_WEB'
export const SET_CURRENT_BUCKET = 'SET_CURRENT_BUCKET'
export const SET_CURRENT_PATH = 'SET_CURRENT_PATH'
export const SET_BUCKETS = 'SET_BUCKETS'
export const ADD_BUCKET = 'ADD_BUCKET'
export const ADD_OBJECT = 'ADD_OBJECT'
export const SET_VISIBLE_BUCKETS = 'SET_VISIBLE_BUCKETS'
export const SET_OBJECTS = 'SET_OBJECTS'
export const SET_DISK_INFO = 'SET_DISK_INFO'
export const SHOW_MAKEBUCKET_MODAL = 'SHOW_MAKEBUCKET_MODAL'
export const SET_UPLOAD = 'SET_UPLOAD'
export const SET_ALERT = 'SET_ALERT'
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'

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

export const addObject = object => {
  return {
    type: ADD_OBJECT,
    object
  }
}

export const showMakeBucketModal = () => {
  return {
    type: SHOW_MAKEBUCKET_MODAL,
    showMakeBucketModal: true
  }
}

export const hideAlert = () => {
  return {
    type: SET_ALERT,
    alert: {
      show: false,
      message: '',
      type: ''
    }
  }
}

export const showAlert = alert => {
  return (dispatch, getState) => {
    let alertTimeout = setTimeout(() => {
      dispatch({
        type: SET_ALERT,
        alert: {show: false}
      })
    }, 5000)
    dispatch({
      type: SET_ALERT,
      alert: Object.assign({}, alert, {
        show: true,
        alertTimeout
      })
    })
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
      .catch(err => {
        dispatch(showAlert({
          type: 'danger',
          message: err.message
        }))
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

export const setUpload = (upload = {inProgress: false, percent: 0}) => {
  return {
    type: SET_UPLOAD,
    upload
  }
}

export const setLoginError = () => {
  return {
    type: SET_LOGIN_ERROR,
    loginError: true
  }
}

export const uploadFile = (file) => {
  return (dispatch, getState) => {
    const { currentBucket, currentPath, web } = getState()
    const objectName = `${currentPath}${file.name}`
    web.PutObjectURL({targetHost: window.location.host, bucketName: currentBucket, objectName})
        .then(signedurl => {
          let parsedUrl = url.parse(signedurl)
          let xhr = new XMLHttpRequest()
          xhr.withCredentials = false
          xhr.open('PUT', signedurl, true)
          dispatch(setUpload({inProgress: true, percent: 0}))
          xhr.upload.addEventListener('error', event => {
            dispatch(showAlert({
              type: 'danger',
              message: 'error during upload'
            }))
            dispatch(setUpload({inProgress: false, percent: 0}))
          })
          xhr.upload.addEventListener('progress', event => {
            if (event.lengthComputable) {
              let percent = event.loaded / event.total * 100
              dispatch(setUpload({inProgress: true, percent}))
              if (percent === 100) {
                dispatch(setUpload({inProgress: false, percent: 0}))
                dispatch(addObject({name: file.name, size: file.size, lastModified: new Date()}))
                dispatch(showAlert({
                  type: 'success',
                  message: 'file uploaded successfully'
                }))
              }
            }
          })
          xhr.send(file)
        })
        .catch(err => {
          dispatch(setUpload({inProgress: false, percent: 0}))
          dispatch(showAlert({
            type: 'danger',
            message: err.message
          }))
        })
  }
}
