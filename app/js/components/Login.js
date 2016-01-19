import React from 'react'
import logo from '../../img/logo.svg'

export default class Login extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
      <div className="login">
      <div className="l-content">
        <div className="lc-wrap">
            <div className="lc-item">
                <input className="lci-text" type="text" spellCheck="false"/>
                <label className="lci-label">Access Key</label>

                <div className="lci-helpers">
                    <i></i><i></i>
                </div>
            </div>
            <div className="lc-item">
                <input className="lci-text" type="text" spellCheck="false"/>
                <label className="lci-label">Secret Key</label>

                <div className="lci-helpers">
                    <i></i><i></i>
                </div>
            </div>
        </div>
    </div>

    <a className="l-logo" href="">
        <img src={logo} alt=""/>
    </a>

    <div className="server-info">play.minio.io:9000</div>
    </div>
    </div>
    )
  }
}
