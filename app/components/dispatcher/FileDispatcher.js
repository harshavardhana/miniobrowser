import { Dispatcher } from 'flux';

export var FileDispatcher = new Dispatcher();
FileDispatcher.handleAction = function(action) {
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
};
