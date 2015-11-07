import React from 'react';
import Path from 'path';

import { FileActions } from './actions/FileActions';
import { FileStore, updateDir } from './stores/FileStore';
import { pushPath } from './Header';

class File extends React.Component {
  _openFile() {
    //
  }
  
  _setSelected() {
    var index = this.props.index;
    this.props.highlight(index);
  }

  render() {
    var size = '';
    if (Math.floor(this.props.fileSize / 1000000) !== 0) // Megabytes
      size = Math.floor(this.props.fileSize / 1000000) + ' M';
    else if (Math.floor(this.props.fileSize / 1000) !== 0)
      size = Math.floor(this.props.fileSize / 1000) + ' K'; // Kilobytes
    else
      size = this.props.fileSize + ' B'; // Bytes
    return (
      <div className='files' onDoubleClick={this._openFile} onClick={this._setSelected}>
      <div className='filename'>  {this.props.fileName}</div>
      <div className='filesize'>{size}</div>
      <div className='filetype'>{this.props.fileType}</div>
      <div className='filemodified'>{this.props.fileModified}</div>
      </div>
    )
  }
}

class Directory extends React.Component {
  _setSelected() {
    var index = this.props.index;
    this.props.highlight(index);
  }
  _openDir() {
    this.props.openDir(this.props.filePath);
  }
  render() {
    var size = '';
    if ( Math.floor(this.props.fileSize / 1000000) !== 0) // Megabytes
      size = Math.floor(this.props.fileSize / 1000000) + ' M';
    else if (Math.floor(this.props.fileSize / 1000) !== 0)
      size = Math.floor(this.props.fileSize / 1000) + ' K'; // Kilobytes
    else
      size = this.props.fileSize + ' B'; // Bytes
    return (
      <div className='files' onDoubleClick={this._openDir} onClick={this._setSelected}>
      <div className='filesize'>{size}</div>
      <div className='filetype'>{this.props.fileType}</div>
      <div className='filemodified'>{this.props.fileModified}</div>
      </div>
    )
  }
}

var isWindows = process.platform === 'win32'
var getHome =  isWindows ? process.env.USERPROFILE: process.env.HOME;

class FilesLayout extends React.Component {
  getInitialState() {
    return {
      filesData: [],
      selected: -1
    };
  }
  componentDidMount() {
    pushPath(getHome);
    updateDir(getHome, function(filesData){
      document.getElementById('dirName').innerHTML = Path.basename(getHome);
      this.setState({filesData: filesData});
      FileActions.newDir(filesData);
    }.bind(this));

    FileStore.addChangeListener(this._onChange);
  }
  componentWillUnmount() {
    FileStore.removeChangeListener(this._onChange);
  }
  _highlight(index) {
    if (this.state.selected !== -1) {
      React.findDOMNode(this.refs['file' + this.state.selected]).className ='files';
    }
    if (this.state.selected === index) {
      this.setState({selected: -1});
    } else {
      React.findDOMNode(this.refs['file' + index]).className = 'files selected';
      this.setState({selected: index});
    }
  }
  _updateLayout(dirPath) {
    updateDir(dirPath, function(filesData){
      document.getElementById('dirName').innerHTML = Path.basename(dirPath);
      pushPath(dirPath);
      FileActions.newDir(filesData);
    }.bind(this));
  }
  _onChange() {
    this.setState({filesData: FileStore.getList()});
  }
  render() {
    var index = 0;
    var fileList = this.state.filesData.map(function(fileInfo) {
      if (fileInfo.fileType === 'File')
	return <File {...fileInfo} ref={'file' + index} index={index++} highlight={this._highlight}/>;
      else {
	return <Directory {...fileInfo} ref={'file' + index} index={index++} highlight={this._highlight} openDir={this._updateLayout} />
      }
    }.bind(this));

    return (
      <div id='files-container'>
      {fileList}
      </div>		
    )
  }
}

export default FilesLayout;



