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

import React from 'react'
import { connect } from 'react-redux'
import humanize from 'humanize'
import Moment from 'moment'
import Modal from 'react-bootstrap/lib/Modal'
import ModalBody from 'react-bootstrap/lib/ModalBody'
import ModalHeader from 'react-bootstrap/lib/ModalHeader'
import ProgressBar from 'react-bootstrap/lib/ProgressBar'
import Alert from 'react-bootstrap/lib/Alert'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'

import logo from '../../img/logo.svg'

import * as actions from '../actions'
import * as mime from '../mime';
import { Scrollbars } from 'react-custom-scrollbars';
import PieChart from 'react-simple-pie-chart';

let BucketList = ({ visibleBuckets, currentBucket, selectBucket, searchBuckets }) => {
  const list = visibleBuckets.map((bucket, i) => {
    const active = bucket === currentBucket ? 'active' : ''
    return <li className={active} key={i} onClick={(e) => selectBucket(e, bucket)}><a href="">{bucket}</a></li>
  })
  return (
    <div>
      <div className="fesb-search">
          <input type="text" onChange={searchBuckets} placeholder="Search Buckets..."/>
          <i></i>
      </div>
      <div className="fesl-inner">
          <Scrollbars
              renderScrollbarVertical={props => <div className="scrollbar-vertical"/>}
          >
              <ul>
                {list}
              </ul>
          </Scrollbars>
      </div>
    </div>
  )
}
BucketList = connect(state => state)(BucketList)

let ObjectsList = ({objects, currentPath, selectPrefix, dataType }) => {
  const list = objects.map((object, i) => {
    let size = object.name.endsWith('/') ? '-' : humanize.filesize(object.size)
    let lastModified = object.name.endsWith('/') ? '-' : Moment(object.lastModified).format('lll')
    return (
      <div key={i} className="fesl-row">
          <div className="fesl-item" data-type={dataType(object.name, object.contentType)}><a href="" onClick={(e) => selectPrefix(e, `${currentPath}${object.name}`)}>{object.name}</a></div>
          <div className="fesl-item">{size}</div>
          <div className="fesl-item">{lastModified}</div>
      </div>
    )
  })
  return (
    <div>{list}</div>
  )
}
ObjectsList = connect(state => state)(ObjectsList)

let Path = ({currentBucket, currentPath, selectPrefix}) => {
  let dirPath = []
  let path = currentPath.split('/').map((dir, i) => {
    dirPath.push(dir)
    let dirPath_ = dirPath.join('/') + '/'
    return <span key={i}><a href="" onClick={(e) => selectPrefix(e, dirPath_)}>{dir}</a></span>
  })
  return (
    <h2 className="fe-h2">
      <span className="main"><a onClick={(e) => selectPrefix(e, '')} href="">{currentBucket}</a></span>
      {path}
    </h2>
  )
}
Path = connect(state => state)(Path)

let ConfirmModal = ({text, okText, cancelText, okHandler, cancelHandler}) => {
  return  <Modal show={true} className="confirm-modal">
            <ModalHeader>{text}</ModalHeader>
            <ModalBody>
              <button onClick={okHandler}>{okText}</button>
              <button onClick={cancelHandler}>{cancelText}</button>
            </ModalBody>
          </Modal>
}
ConfirmModal = connect(state => state)(ConfirmModal)

export default class Browse extends React.Component {
  componentDidMount() {
    const { web, dispatch, history } = this.props
    web.ListBuckets()
      .then(buckets => buckets.map(bucket => bucket.name))
      .then(buckets => {
        dispatch(actions.setBuckets(buckets))
        dispatch(actions.setVisibleBuckets(buckets))
        dispatch(actions.selectBucket(buckets[0]))
        return web.DiskInfo()
      })
      .then(diskInfo => {
        let diskInfo_ = Object.assign({}, {
          total: diskInfo.Total,
          free: diskInfo.Free,
          fstype: diskInfo.FSType,
        })
        diskInfo_.used = diskInfo_.total - diskInfo_.free
        dispatch(actions.setDiskInfo(diskInfo_))
      })
      .catch(err => {
        dispatch(actions.showAlert({type: 'danger', message: err.message}))
      })
  }
  selectBucket(e, bucket) {
    e.preventDefault()
    if (bucket == this.props.currentBucket) return
    this.props.dispatch(actions.selectBucket(bucket))
  }
  searchBuckets(e) {
    e.preventDefault()
    let { buckets } = this.props
    this.props.dispatch(actions.setVisibleBuckets(buckets.filter(bucket => bucket.indexOf(e.target.value) > -1)))
  }
  selectPrefix(e, prefix) {
    const { dispatch, currentPath, web, currentBucket } = this.props
    e.preventDefault()
    if (prefix.endsWith('/') || prefix === '') {
      dispatch(actions.selectPrefix(prefix))
    } else {
      web.GetObjectURL({targetHost: window.location.host, bucketName: currentBucket, objectName: prefix})
        .then(res => window.location = res)
        .catch(err => dispatch(actions.showAlert({
          type: 'danger',
          message: err.message + ', please reload.',
        })))
    }
  }
  makeBucket(e) {
    e.preventDefault()
    const bucketName = this.refs.makeBucketRef.value
    this.refs.makeBucketRef.value = ''
    const { web, dispatch } = this.props
    this.hideMakeBucketModal()
    web.MakeBucket({bucketName})
       .then(() => dispatch(actions.addBucket(bucketName)))
       .catch(err => dispatch(actions.showAlert({
         type: 'danger',
         message: err.message
       })))
  }
  hideMakeBucketModal() {
    const { dispatch } = this.props
    dispatch(actions.hideMakeBucketModal())
  }
  showMakeBucketModal(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(actions.showMakeBucketModal())
  }
  showAbout(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(actions.showAbout())
  }

  hideAbout(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(actions.hideAbout())
  }
  uploadFile(e) {
    e.preventDefault()
    const { dispatch, upload } = this.props
    if (upload.inProgress) {
      dispatch(actions.showAlert({
        type: 'danger',
        message: 'An upload already in progress'
      }))
      return
    }
    let file = e.target.files[0]
    e.target.value = null
    this.xhr = new XMLHttpRequest()
    dispatch(actions.uploadFile(file, this.xhr))
  }
  uploadAbort(e) {
    e.preventDefault()
    const { dispatch } = this.props
    this.xhr.abort()
    dispatch(actions.setUpload({inProgress: false, percent: 0}))
    this.hideAbortModal(e)
  }
  showAbortModal(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(actions.setShowAbortModal(true))
  }
  hideAbortModal(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(actions.setShowAbortModal(false))
  }
  hideAlert() {
    const { dispatch } = this.props
    dispatch(actions.hideAlert())
  }
  dataType(name, contentType) {
    if (name.endsWith('/')) return 'folder'
    if (contentType) {
      return mime.getDataType(contentType)
    }
    return 'other'
  }
  logout(e) {
    const { web, history } = this.props
    e.preventDefault()
    web.Logout()
    history.pushState(null, '/login')
  }
  fullscreen(e) {
    e.preventDefault()
    let el = document.documentElement

    if (el.requestFullscreen) {
        el.requestFullscreen();
    }
    if(el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    }
    if(el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    }
    if(el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
  }
  render() {
    const { total, free } = this.props.diskInfo
    const {showMakeBucketModal, showAbortModal, upload, alert } = this.props
    const {showAbout } = this.props
    let progressBar = ''
    let percent = (upload.loaded / upload.total) * 100
    if (upload.inProgress) {
        progressBar = <div className="feb-alert feba-progress animated fadeInUp alert-info">
                        <button type="button" className="close" onClick={this.showAbortModal.bind(this)}>
                          <span>&times;</span>
                        </button>
                        <ProgressBar now={percent} />
                        <div className="text-center"><small>{humanize.filesize(upload.loaded)} ({percent.toFixed(2)} %)</small></div>
                      </div>
    }
    let alertBox = ''
    if (alert.show) {
      alertBox =  <Alert className="feb-alert animated fadeInDown" bsStyle={alert.type} onDismiss={this.hideAlert.bind(this)}>
                    <div className='text-center'>{alert.message}</div>
                  </Alert>
    }
    let abortModal = ''
    if (showAbortModal) {
      abortModal =  <ConfirmModal
                      text="Abort the upload in progress?"
                      okText='Abort upload' cancelText='Continue upload'
                      okHandler={this.uploadAbort.bind(this)} cancelHandler={this.hideAbortModal.bind(this)}>
                    </ConfirmModal>
    }
    let signoutTooltip = <Tooltip>Sign out</Tooltip>
    let uploadTooltip = <Tooltip>Upload file</Tooltip>
    let makeBucketTooltip = <Tooltip>Create bucket</Tooltip>

    let used = total - free
    let usedPercent = (used/total)*100
    let freePercent = free*100/total

    return (
      <div className="file-explorer">
          {abortModal}
          <div className="fe-sidebar">
              <div className="fes-header clearfix">
                  <img src={logo} alt=""/>
                  <h2 className="fe-h2">Minio Browser</h2>
              </div>
              <div className="fes-list">
                <BucketList searchBuckets={this.searchBuckets.bind(this)} selectBucket={this.selectBucket.bind(this)} />
              </div>
              <div className="fes-host">
                  <i className="fa fa-globe"></i> {window.location.hostname}
              </div>
          </div>

          <div className="fe-body">
              {alertBox}
              <header className="fe-header">
                  <div className="media">
                      <div className="feh-pie pull-left">
                          <PieChart
                              slices={[
                            {
                              color: '#2ed2ff',
                              value: usedPercent,
                            },
                            {
                              color: '#eee',
                              value: freePercent,
                            },
                          ]}
                          />
                      </div>

                      <div className="media-body">
                          <Path selectPrefix={this.selectPrefix.bind(this)} />

                          <ul className="feh-disk list-unstyled list-inline">
                              <li><i className="fehd-icon used"></i> Used: {humanize.filesize(total - free)}</li>
                              <li><i className="fehd-icon free"></i> Free: {humanize.filesize(total - used)}</li>
                          </ul>

                          <ul className="feh-actions">
                                <li className="dropdown">
                                    <a href="" data-toggle="dropdown">
                                        <i className="fa fa-ellipsis-v"></i>
                                    </a>

                                    <ul className="dropdown-menu dm-right pull-right">
                                        <li><a href="" onClick={this.fullscreen.bind(this)}>Fullscreen <i className="fa fa-expand"></i></a></li>
                                        <li><a href="" onClick={this.showAbout.bind(this)}>About <i className="fa fa-info-circle"></i></a></li>
                                        <li><a href="" onClick={this.logout.bind(this)} >Sign Out <i className="fa fa-sign-out"></i></a></li>
                                    </ul>
                                </li>
                          </ul>
                      </div>
                  </div>
              </header>
              <div className="feb-container">
                  <header className="fesl-row" data-type="folder">
                      <div className="fesl-item" data-sort="name">Name <i className="fesli-sort fa fa-sort-alpha-asc"></i></div>
                      <div className="fesl-item" data-sort="size">Size <i className="fesli-sort fa fa-sort-amount-desc"></i></div>
                      <div className="fesl-item" data-sort="last-modified"> <i className="fesli-sort fa fa-sort-numeric-asc"></i>Last Modified</div>
                  </header>
              </div>

              <div className="feb-container">
                <ObjectsList dataType={this.dataType.bind(this)} selectPrefix={this.selectPrefix.bind(this)}/>
              </div>
              {progressBar}
              <div className="dropup feb-actions">
                  <a href="" data-toggle="dropdown" className="feba-toggle"><i className="fa fa-plus"></i></a>

                  <div className="dropdown-menu">
                    <OverlayTrigger placement="left" overlay={uploadTooltip}>
                      <a href="#" className="feba-btn feba-upload">
                          <input type="file" onChange={this.uploadFile.bind(this)} style={{display:'none'}} id="file-input"></input>
                          <label htmlFor="file-input">
                            <i style={{cursor:'pointer'}} className="fa fa-cloud-upload"></i>
                          </label>
                      </a>
                    </OverlayTrigger>
                    <OverlayTrigger placement="left" overlay={makeBucketTooltip}>
                      <a href="#" className="feba-btn feba-bucket" onClick={this.showMakeBucketModal.bind(this)}>
                          <i className="fa fa-hdd-o"></i>
                      </a>
                    </OverlayTrigger>
                  </div>
              </div>
              <Modal className="feb-modal" aria-labelledby="contained-modal-title-sm" show={showMakeBucketModal}
      onHide={this.hideMakeBucketModal.bind(this)}>

                <ModalBody>
                    <form onSubmit={this.makeBucket.bind(this)}>
                        <div className="create-bucket">
                            <input type="text" autofocus ref="makeBucketRef" placeholder="Bucket Name"/>
                            <i></i>
                        </div>
                    </form>
                </ModalBody>
             </Modal>

          <Modal className="about-modal" show={showAbout} onHide={this.hideAbout.bind(this)}>
              <ModalBody>

                  <img className="am-logo" src={logo} alt=""/>

                  <ul className="am-list list-unstyled">
                    <li>
                        <div className="aml-title">Version</div>
                        <small>2016-01-31T03:32:00Z</small>
                    </li>

                    <li>
                        <div className="aml-title">Memory</div>
                        <small>Used: 454kB | Allocated: 454kB | Used-Heap: 454kB | Allocated-Heap: 1.7MB</small>
                    </li>
                    <li>
                        <div className="aml-title">Platform</div>
                        <small>Host: Space | OS: linux | Arch: amd64</small>
                    </li>
                    <li>
                        <div className="aml-title">Runtime</div>
                        <small>Version: go1.5.3 | CPUs: 4</small>
                    </li>
                  </ul>

                  <a href="" className="am-close" onClick={this.hideAbout.bind(this)}><i className="fa fa-check"></i></a>

              </ModalBody>
          </Modal>
          </div>
      </div>
    )
  }
}
