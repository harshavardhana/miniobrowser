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
import * as utils from '../utils'
import * as mime from '../mime';
import { Scrollbars } from 'react-custom-scrollbars';

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
BucketList = connect (state => state) (BucketList)

let ObjectsList = ({objects, currentPath, selectPrefix, dataType, removeObject }) => {
    const list = objects.map((object, i) => {
        let size = object.name.endsWith('/') ? '-' : humanize.filesize(object.size)
        let lastModified = object.name.endsWith('/') ? '-' : Moment (object.lastModified).format('lll')
        return (
            <div key={i} className="fesl-row">
                <div className="fesl-item" data-type={dataType(object.name, object.contentType)}><a href=""
                                                                                                    onClick={(e) => selectPrefix(e, `${currentPath}${object.name}`)}>{object.name}</a>
                </div>
                <div className="fesl-item">{size}</div>
                <div className="fesl-item">{lastModified}</div>
                <div className="fesl-item">
                {object.name.endsWith('/') ? '' : <i className="fa fa-trash" style={{cursor: 'pointer'}} onClick={e => removeObject(e, object)}></i>}
                </div>
            </div>
        )
    })
    return (
        <div>{list}</div>
    )
}
ObjectsList = connect (state => state) (ObjectsList)

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
Path = connect (state => state) (Path)

let ConfirmModal = ({baseClass, text, okText, okIcon, cancelText, cancelIcon, okHandler, cancelHandler}) => {
    return <Modal animation={false} show={true} className={baseClass}>
        <ModalBody>
            <div className="cm-text">{text}</div>

            <div className="cm-footer">
                <button className="cmf-btn" onClick={okHandler}><i className={okIcon}></i>{okText}</button>
                <button className="cmf-btn" onClick={cancelHandler}><i className={cancelIcon}></i>{cancelText}</button>
            </div>
        </ModalBody>
    </Modal>
}
ConfirmModal = connect (state => state) (ConfirmModal)

export default class Browse extends React.Component {
    componentDidMount () {
        const { web, dispatch, history } = this.props
        web.ListBuckets()
            .then(buckets => buckets.map(bucket => bucket.name))
            .then(buckets => {
                dispatch (actions.setBuckets(buckets))
                dispatch (actions.setVisibleBuckets(buckets))
                dispatch (actions.selectBucket(buckets[0]))
                return web.DiskInfo()
            })
            .then(diskInfo => {
                let diskInfo_ = Object.assign({}, {
                    total: diskInfo.Total,
                    free: diskInfo.Free,
                    fstype: diskInfo.FSType,
                })
                diskInfo_.used = diskInfo_.total - diskInfo_.free
                dispatch (actions.setDiskInfo(diskInfo_))
                return web.ServerInfo()
            })
            .then(serverInfo => {
                let serverInfo_ = Object.assign({}, {
                    version: serverInfo.MinioVersion,
                    memory: serverInfo.MinioMemory,
                    platform: serverInfo.MinioPlatform,
                    runtime: serverInfo.MinioRuntime,
                })
                dispatch (actions.setServerInfo(serverInfo_))
            })
            .catch(err => {
                dispatch (actions.showAlert({type: 'danger', message: err.message}))
            })
    }

    selectBucket (e, bucket) {
        e.preventDefault()
        if (bucket == this.props.currentBucket) return
        this.props.dispatch(actions.selectBucket(bucket))
    }

    searchBuckets (e) {
        e.preventDefault()
        let { buckets } = this.props
        this.props.dispatch(actions.setVisibleBuckets(buckets.filter(bucket => bucket.indexOf(e.target.value) > -1)))
    }

    selectPrefix (e, prefix) {
        const { dispatch, currentPath, web, currentBucket } = this.props
        e.preventDefault()
        if (prefix.endsWith('/') || prefix === '') {
            if (prefix === currentPath) return
            dispatch(actions.selectPrefix(prefix))
        } else {
            web.GetObjectURL({targetHost: window.location.host, bucketName: currentBucket, objectName: prefix})
                .then(res => window.location = res)
                .catch(err => dispatch (actions.showAlert({
                    type: 'danger',
                    message: err.message + ', please reload.',
                })))
        }
    }

    makeBucket (e) {
        e.preventDefault()
        const bucketName = this.refs.makeBucketRef.value
        this.refs.makeBucketRef.value = ''
        const { web, dispatch } = this.props
        this.hideMakeBucketModal()
        web.MakeBucket({bucketName})
            .then(() => dispatch (actions.addBucket(bucketName)))
            .catch(err => dispatch (actions.showAlert({
                type: 'danger',
                message: err.message
            })))
    }

    hideMakeBucketModal () {
        const { dispatch } = this.props
        dispatch (actions.hideMakeBucketModal())
    }

    showMakeBucketModal (e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch (actions.showMakeBucketModal())
    }

    showAbout (e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch (actions.showAbout())
    }

    hideAbout (e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch (actions.hideAbout())
    }

    uploadFile (e) {
        e.preventDefault()
        const { dispatch, upload } = this.props
        if (upload.inProgress) {
            dispatch (actions.showAlert({
                type: 'danger',
                message: 'An upload already in progress'
            }))
            return
        }
        let file = e.target.files[0]
        e.target.value = null
        this.xhr = new XMLHttpRequest ()
        dispatch (actions.uploadFile(file, this.xhr))
        dispatch (actions.uploadFile(file, this.xhr))
    }

    removeObject(e, object) {
      const { web, dispatch, currentBucket, currentPath } = this.props
      web.RemoveObject({
        bucketName: currentBucket,
        objectName: currentPath + object.name
      })
      .then(() => dispatch(actions.selectPrefix(currentPath)))
      .catch(e => dispatch(actions.showAlert({
        type: 'danger',
        message: e.message
      })))
    }

    uploadAbort (e) {
        e.preventDefault()
        const { dispatch } = this.props
        this.xhr.abort()
        dispatch (actions.setUpload({inProgress: false, percent: 0}))
        this.hideAbortModal(e)
    }

    showAbortModal (e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch (actions.setShowAbortModal(true))
    }

    hideAbortModal (e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch (actions.setShowAbortModal(false))
    }

    hideAlert () {
        const { dispatch } = this.props
        dispatch (actions.hideAlert())
    }

    dataType (name, contentType) {
        if (name.endsWith('/')) return 'folder'
        if (contentType) {
            return mime.getDataType(contentType)
        }
        return 'other'
    }

    sortObjectsByName (e) {
        const { dispatch, objects, sortNameOrder } = this.props
        dispatch (actions.setObjects(utils.sortObjectsByName(objects, !sortNameOrder)))
        dispatch (actions.setSortNameOrder(!sortNameOrder))
    }

    sortObjectsBySize () {
        const { dispatch, objects, sortSizeOrder } = this.props
        dispatch (actions.setObjects(utils.sortObjectsBySize(objects, !sortSizeOrder)))
        dispatch (actions.setSortSizeOrder(!sortSizeOrder))
    }

    sortObjectsByDate () {
        const { dispatch, objects, sortDateOrder } = this.props
        dispatch (actions.setObjects(utils.sortObjectsByDate(objects, !sortDateOrder)))
        dispatch (actions.setSortDateOrder(!sortDateOrder))
    }

    logout (e) {
        const { web, history } = this.props
        e.preventDefault()
        web.Logout()
        history.pushState(null, '/login')
    }

    fullscreen (e) {
        e.preventDefault()
        let el = document.documentElement
        if (el.requestFullscreen) {
            el.requestFullscreen();
        }
        if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        }
        if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
        if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }

    render () {
        const { total, free } = this.props.diskInfo
        const { showMakeBucketModal, showAbortModal, upload, alert } = this.props
        const { showAbout } = this.props
        const { version, memory, platform, runtime } = this.props.serverInfo
        let progressBar = ''
        let percent = (upload.loaded / upload.total) * 100
        if (upload.inProgress) {
            progressBar = <div className="feb-alert feba-progress animated fadeInUp alert-info">
                <button type="button" className="close" onClick={this.showAbortModal.bind(this)}>
                    <span>&times;</span>
                </button>
                <ProgressBar now={percent}/>
                <div className="text-center">
                    <small>{humanize.filesize(upload.loaded)} ({percent.toFixed(2)} %)</small>
                </div>
            </div>
        }
        let alertBox = ''
        if (alert.show) {
            alertBox = <Alert className="feb-alert animated fadeInDown" bsStyle={alert.type}
                              onDismiss={this.hideAlert.bind(this)}>
                <div className='text-center'>{alert.message}</div>
            </Alert>
        }
        let abortModal = ''
        if (showAbortModal) {
            abortModal = <ConfirmModal
                baseClass="abort-upload"
                text="Abort the upload in progress?"
                okText='Abort'
                okIcon='fa fa-stop'
                cancelText='Continue'
                cancelIcon='fa fa-play'
                okHandler={this.uploadAbort.bind(this)}
                cancelHandler={this.hideAbortModal.bind(this)}>
            </ConfirmModal>
        }
        let signoutTooltip = <Tooltip>Sign out</Tooltip>
        let uploadTooltip = <Tooltip>Upload file</Tooltip>
        let makeBucketTooltip = <Tooltip>Create bucket</Tooltip>

        let used = total - free
        let usedPercent = (used / total) * 100+'%'
        let freePercent = free * 100 / total

        return (
            <div className="file-explorer">
                {abortModal}
                <div className="fe-sidebar">
                    <div className="fes-header clearfix">
                        <img src={logo} alt=""/>
                        <h2 className="fe-h2">Minio Browser</h2>
                    </div>
                    <div className="fes-list">
                        <BucketList searchBuckets={this.searchBuckets.bind(this)}
                                    selectBucket={this.selectBucket.bind(this)}/>
                    </div>
                    <div className="fes-host">
                        <i className="fa fa-globe"></i> {window.location.hostname}
                    </div>
                </div>

                <div className="fe-body">
                    {alertBox}
                    <header className="fe-header">
                        <Path selectPrefix={this.selectPrefix.bind(this)}/>

                        <div className="feh-usage">
                            <div className="fehu-chart">

                                <div style={{width: usedPercent}}></div>
                            </div>

                            <ul className="list-unstyled list-inline">
                                <li>Used: {humanize.filesize(total - free)}</li>
                                <li className="pull-right">Free: {humanize.filesize(total - used)}</li>
                            </ul>
                        </div>

                        <ul className="feh-actions">
                            <li className="dropdown">
                                <a href="" data-toggle="dropdown">
                                    <i className="fa fa-reorder"></i>
                                </a>

                                <ul className="dropdown-menu dm-right pull-right">
                                    <li><a href="" onClick={this.fullscreen.bind(this)}>Fullscreen <i
                                        className="fa fa-expand"></i></a></li>
                                    <li><a href="" onClick={this.showAbout.bind(this)}>About <i
                                        className="fa fa-info-circle"></i></a></li>
                                    <li><a href="" onClick={this.logout.bind(this)}>Sign Out <i
                                        className="fa fa-sign-out"></i></a></li>
                                </ul>
                            </li>
                        </ul>
                    </header>
                    <div className="feb-container">
                        <header className="fesl-row" data-type="folder">
                            <div className="fesl-item" onClick={this.sortObjectsByName.bind(this)} data-sort="name">Name
                                <i className="fesli-sort fa fa-sort-alpha-asc"></i></div>
                            <div className="fesl-item" onClick={this.sortObjectsBySize.bind(this)} data-sort="size">Size
                                <i className="fesli-sort fa fa-sort-amount-desc"></i></div>
                            <div className="fesl-item" onClick={this.sortObjectsByDate.bind(this)}
                                 data-sort="last-modified"><i className="fesli-sort fa fa-sort-numeric-asc"></i>Last
                                Modified
                            </div>
                        </header>
                    </div>

                    <div className="feb-container">
                        <ObjectsList removeObject={this.removeObject.bind(this)} dataType={this.dataType.bind(this)} selectPrefix={this.selectPrefix.bind(this)}/>
                    </div>
                    {progressBar}
                    <div className="dropup feb-actions">
                        <a href="" data-toggle="dropdown" className="feba-toggle"><i className="fa fa-plus"></i></a>

                        <div className="dropdown-menu">
                            <OverlayTrigger placement="left" overlay={uploadTooltip}>
                                <a href="#" className="feba-btn feba-upload">
                                    <input type="file" onChange={this.uploadFile.bind(this)} style={{display:'none'}}
                                           id="file-input"></input>
                                    <label htmlFor="file-input">
                                        <i style={{cursor:'pointer'}} className="fa fa-cloud-upload"></i>
                                    </label>
                                </a>
                            </OverlayTrigger>
                            <OverlayTrigger placement="left" overlay={makeBucketTooltip}>
                                <a href="#" className="feba-btn feba-bucket"
                                   onClick={this.showMakeBucketModal.bind(this)}>
                                    <i className="fa fa-hdd-o"></i>
                                </a>
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div>
                        <Modal className="feb-modal" aria-labelledby="contained-modal-title-sm"
                               show={showMakeBucketModal}
                               onHide={this.hideMakeBucketModal.bind(this)}>

                            <button className="close" onClick={this.hideMakeBucketModal.bind(this)}><span>&times;</span></button>

                            <ModalBody>
                                <form onSubmit={this.makeBucket.bind(this)}>
                                    <div className="create-bucket">
                                        <input type="text" autofocus ref="makeBucketRef" placeholder="Bucket Name"/>
                                        <i></i>
                                    </div>
                                </form>
                            </ModalBody>
                        </Modal>
                    </div>

                    <Modal  className="about-modal" show={showAbout} onHide={this.hideAbout.bind(this)}>
                        <div className="am-inner">

                            <div className="ami-item">
                                <img className="amii-logo" src={logo} alt=""/>
                            </div>

                            <div className="ami-item">
                                <ul className="amii-list list-unstyled">
                                    <li>
                                        <div>Version</div>
                                        <small>{version}</small>
                                    </li>

                                    <li>
                                        <div>Memory</div>
                                        <small>{memory}</small>
                                    </li>
                                    <li>
                                        <div>Platform</div>
                                        <small>{platform}</small>
                                    </li>
                                    <li>
                                        <div>Runtime</div>
                                        <small>{runtime}</small>
                                    </li>
                                </ul>

                                <a href="" className="amii-close" onClick={this.hideAbout.bind(this)}><i
                                    className="fa fa-check"></i></a>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        )
    }
}
