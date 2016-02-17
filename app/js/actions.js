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

import url from 'url'
import web from './web'
import * as utils from './utils'

export const SET_WEB = 'SET_WEB'
export const SET_CURRENT_BUCKET = 'SET_CURRENT_BUCKET'
export const SET_CURRENT_PATH = 'SET_CURRENT_PATH'
export const SET_BUCKETS = 'SET_BUCKETS'
export const ADD_BUCKET = 'ADD_BUCKET'
export const ADD_OBJECT = 'ADD_OBJECT'
export const SET_VISIBLE_BUCKETS = 'SET_VISIBLE_BUCKETS'
export const SET_OBJECTS = 'SET_OBJECTS'
export const SET_DISK_INFO = 'SET_DISK_INFO'
export const SET_SERVER_INFO = 'SET_SERVER_INFO'
export const SHOW_MAKEBUCKET_MODAL = 'SHOW_MAKEBUCKET_MODAL'
export const SET_UPLOAD = 'SET_UPLOAD'
export const SET_ALERT = 'SET_ALERT'
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'
export const SET_SHOW_ABORT_MODAL = 'SET_SHOW_ABORT_MODAL'
export const SHOW_ABOUT = 'SHOW_ABOUT'
export const SET_SORT_NAME_ORDER = 'SET_SORT_NAME_ORDER'
export const SET_SORT_SIZE_ORDER = 'SET_SORT_SIZE_ORDER'
export const SET_SORT_DATE_ORDER = 'SET_SORT_DATE_ORDER'
export const SET_LATEST_UI_VERSION = 'SET_LATEST_UI_VERSION'
export const SIDE_BAR_TOGGLE = 'SIDE_BAR_TOGGLE'

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
    let alertTimeout = null
    if (alert.type !== 'danger') {
      alertTimeout = setTimeout(() => {
        dispatch({
          type: SET_ALERT,
          alert: {show: false}
        })
      }, 5000)
    }
    dispatch({
      type: SET_ALERT,
      alert: Object.assign({}, alert, {
        show: true,
        alertTimeout
      })
    })
  }
}

export const sideBarToggle = () => {
  return {
    type: SIDE_BAR_TOGGLE
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

export const setServerInfo = serverInfo => {
  return {
    type: SET_SERVER_INFO,
    serverInfo
  }
}

export const selectBucket = (currentBucket, prefix) => {
  if (!prefix) prefix = ''
  return (dispatch, getState) => {
    let web = getState().web
    dispatch(setCurrentBucket(currentBucket))
    dispatch(selectPrefix(prefix))
    return
  }
}

export const selectPrefix = prefix => {
  return (dispatch, getState) => {
    const { currentBucket, web } = getState()
    web.ListObjects({bucketName: currentBucket, prefix})
      .then(res => {
        let objects = res.objects
        if (!objects) objects = []
        dispatch(setObjects(
          utils.sortObjectsByName(objects.map(object => {
              object.name = object.name.replace(`${prefix}`, ''); return object
            }))
        ))
        dispatch(setSortNameOrder(false))
        dispatch(setCurrentPath(prefix))
      })
      .catch(err => dispatch(showAlert({
        type: 'danger',
        message: err.message
      })))
  }
}

export const setUpload = (upload = {inProgress: false, percent: 0}) => {
  return {
    type: SET_UPLOAD,
    upload
  }
}

export const setShowAbortModal = showAbortModal => {
  return {
    type: SET_SHOW_ABORT_MODAL,
    showAbortModal
  }
}

export const setLoginError = () => {
  return {
    type: SET_LOGIN_ERROR,
    loginError: true
  }
}

export const uploadFile = (file, xhr) => {
  return (dispatch, getState) => {
    const { currentBucket, currentPath, web } = getState()
    const objectName = `${currentPath}${file.name}`
    web.PutObjectURL({targetHost: window.location.host, bucketName: currentBucket, objectName})
        .then(res => {
          let signedurl = res.url
          let parsedUrl = url.parse(signedurl)
          xhr.open('PUT', signedurl, true)
          xhr.withCredentials = false
          dispatch(setUpload({inProgress: true, loaded: 0, total: file.size, filename: file.name}))
          xhr.upload.addEventListener('error', event => {
            dispatch(showAlert({
              type: 'danger',
              message: 'error during upload'
            }))
            dispatch(setUpload({inProgress: false}))
          })
          xhr.upload.addEventListener('progress', event => {
            if (event.lengthComputable) {
              let loaded = event.loaded
              let total = event.total
              dispatch(setUpload({inProgress: true, loaded, total, filename: file.name}))
              if (loaded === total) {
                setShowAbortModal(false)
                dispatch(setUpload({inProgress: false}))
                dispatch(showAlert({
                  type: 'success',
                  message: 'file uploaded successfully'
                }))
                dispatch(selectPrefix(currentPath))
              }
            }
          })
          xhr.send(file)
        })
        .catch(err => {
          setShowAbortModal(false)
          dispatch(setUpload({inProgress: false, percent: 0}))
          dispatch(showAlert({
            type: 'danger',
            message: err.message
          }))
        })
  }
}

export const showAbout = () => {
  return {
    type: SHOW_ABOUT,
    showAbout: true
  }
}

export const hideAbout = () => {
  return {
    type: SHOW_ABOUT,
    showAbout: false
  }
}

export const setSortNameOrder = (sortNameOrder) => {
  return {
    type: SET_SORT_NAME_ORDER,
    sortNameOrder
  }
}

export const setSortSizeOrder = (sortSizeOrder) => {
  return {
    type: SET_SORT_SIZE_ORDER,
    sortSizeOrder
  }
}

export const setSortDateOrder = (sortDateOrder) => {
  return {
    type: SET_SORT_DATE_ORDER,
    sortDateOrder
  }
}

export const setLatestUIVersion = (latestUiVersion) => {
  return {
    type: SET_LATEST_UI_VERSION,
    latestUiVersion
  }
}
