var moment = require('moment')
var async = require('async')
var exec = require('child_process').exec
var fs = require('fs')

process.env.NODE_ENV = 'production'

var assetfsFileName = ''
var commitId = ''
var date = undefined
var buildType = process.env.MINIO_UI_BUILD

if (buildType !== 'OFFICIAL') buildType = 'UNOFFICIAL'

async.waterfall([
    function(cb) {
      var cmd = 'webpack -p --config webpack.production.config.js'
      console.log('Running ', cmd)
      exec(cmd, cb)
    },
    function(stdout, stderr, cb) {
      var cmd = 'git log --format="%H" -n1'
      console.log('Running ', cmd)
      exec(cmd, cb)
    },
    function(stdout, stderr, cb) {
      if (!stdout) throw new Error('commitId is empty')
      commitId = stdout.replace('\n', '')
      if (commitId.length !== 40) throw new Error('commitId invalid : ' + commitId)
      date = moment.utc()
      if (buildType === 'OFFICIAL')
        assetfsFileName = 'assetfs-ui-' + date.format("YYYY-MM-DDTHH-mm-ss") + '.go'
      else
        assetfsFileName = 'assetfs-ui.go'
      var cmd = 'go-bindata-assetfs -o=' + assetfsFileName + ' -nocompress=true production/...'
      console.log('Running ', cmd)
      exec(cmd, cb)
    },
    function(stdout, stderr, cb) {
      fs.appendFileSync(assetfsFileName, '\nvar uiReleaseTag = "' + buildType + '.' +
                        date.format("YYYY-MM-DDTHH:mm:ss") + 'Z' + '"\n')
      fs.appendFileSync(assetfsFileName, '\nvar uiCommitId = "' + commitId + '"\n')
      fs.appendFileSync(assetfsFileName, '\nvar uiVersion = "' +
                        date.format("YYYY-MM-DDTHH:mm:ss") + 'Z' + '"\n')
      console.log('UI assets file : ', assetfsFileName)
      cb()
    }
  ], function(err) {
    if (err) return console.log(err)
  })
