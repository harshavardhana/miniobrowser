var moment = require('moment')
var async = require('async')
var exec = require('child_process').exec
var fs = require('fs')

process.env.NODE_ENV = 'production'

var assetsFileName = ''
var commitId = ''
var date = undefined
var buildType = process.env.MINIO_UI_BUILD

if (buildType !== 'OFFICIAL') buildType = 'UNOFFICIAL'

async.waterfall([
    function(cb) {
      var cmd = 'webpack -p --config webpack.production.config.js'
      console.log('Running', cmd)
      exec(cmd, cb)
    },
    function(stdout, stderr, cb) {
      var cmd = 'git log --format="%H" -n1'
      console.log('Running', cmd)
      exec(cmd, cb)
    },
    function(stdout, stderr, cb) {
      if (!stdout) throw new Error('commitId is empty')
      commitId = stdout.replace('\n', '')
      if (commitId.length !== 40) throw new Error('commitId invalid : ' + commitId)
      date = moment.utc()
      if (buildType === 'OFFICIAL')
        assetsFileName = 'ui-assets-' + date.format('YYYY-MM-DDTHH-mm-ss') + 'Z' + '.go'
      else
        assetsFileName = 'ui-assets.go'
      var cmd = 'go-bindata-assetfs -nocompress=true production/...'
      console.log('Running', cmd)
      exec(cmd, cb)
    },
    function(stdout, stderr, cb) {
      fs.renameSync('bindata_assetfs.go', assetsFileName)
      fs.appendFileSync(assetsFileName, '\n')
      fs.appendFileSync(assetsFileName, 'var uiReleaseTag = "' + buildType + '.' +
                        date.format("YYYY-MM-DDTHH:mm:ss") + 'Z' + '"\n')
      fs.appendFileSync(assetsFileName, 'var uiCommitID = "' + commitId + '"\n')
      fs.appendFileSync(assetsFileName, 'var uiVersion = "' +
                        date.format("YYYY-MM-DDTHH:mm:ss") + 'Z"')
      fs.appendFileSync(assetsFileName, '\n')
      console.log('UI assets file :', assetsFileName)
      cb()
    }
  ], function(err) {
    if (err) return console.log(err)
  })
