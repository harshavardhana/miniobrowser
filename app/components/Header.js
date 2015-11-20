import React from 'react';
import Path from 'path';

import { FileActions } from './actions/FileActions';
import { updateDir } from './stores/FileStore';

// A stack of paths from previous navigations
var _backStack = [];
export function pushPath(path) {
  _backStack.push(path);
}

export class Back extends React.Component {
  _back() {
    if (_backStack.length > 1) {
      _backStack.pop();
      var target = _backStack.pop();
      updateDir(target, function(filesData){
	document.getElementById('dirName').innerHTML = Path.basename(target);
	_backStack.push(target);
	FileActions.newDir(filesData);
      });
    }
  }
  render() {
    return <i className='zmdi zmdi-arrow-back' onClick={this._back}></i>;
  }
}
