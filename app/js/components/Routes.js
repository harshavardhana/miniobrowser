import React from 'react'
import { Route } from 'react-router'

import { Login } from './Login'

export default () => {
  return (
    <Route path="/" component={Login}>
    </Route>
  )
}
