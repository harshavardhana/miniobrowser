import React from 'react';
import ReactDom from 'react-dom';

import { FilesLayout } from './components/Files';
import { Back } from './components/Header';

//ReactDom.render(<Back />, document.getElementById('back'));
ReactDom.render(<FilesLayout />, document.getElementById('files-container'));
