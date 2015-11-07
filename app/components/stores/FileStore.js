import Fs from 'fs';
import Path from 'path';
import Promise from 'bluebird';

import { FileDispatcher } from '../dispatcher/FileDispatcher';
import { FileConstants } from '../constants/FileConstants';
import { EventEmitter } from 'events';

var CHANGE_EVENT = 'change';
var join = Promise.join;
Promise.promisifyAll(Fs);

export var updateDir = function(dirPath, cb) {
  var res = Fs.readdirAsync(dirPath)
              .filter(function(file) {
                return file.substring(0, 1) !== '.';
              })
              .map(function(file) {
                var filePath = Path.join(dirPath, file);
                return Fs.statAsync(filePath)
                         .then(function(stats) {
                           return {
                             fileName: file,
                             fileSize: stats.size,
                             fileType: stats.isFile() ? 'File' : 'Directory',
                             fileModified: stats.mtime.toLocaleString(),
                             filePath: filePath
                           };
                         });

              })
              .then(function(res) {
                if (cb)
                  cb(res);
              });
}


var _fileStore = {
  list: []
};


var newDir = function(newDir){
  _fileStore.list = newDir;
}

export var FileStore = Object.assign({}, EventEmitter.prototype, {
  addChangeListener: function(cb) {
    this.on(CHANGE_EVENT, cb);
  },
  removeChangeListener: function(cb) {
    this.removeListener(CHANGE_EVENT, cb);
  },
  getList: function() {
    return _fileStore.list;
  }
});

FileStore.setMaxListeners(0);

FileDispatcher.register(function(payload) {
  var action = payload.action;
  switch (action.actionType) {
    case FileConstants.NEW_DIR:
      newDir(action.data);
      FileStore.emit(CHANGE_EVENT);
      break;
    default:
      return true;
  }
});
