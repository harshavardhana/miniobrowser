# Isomorphic Javascript library for Minio Controller API

## Usage

```js
var Ctrl = require('minio-controller-js');

var Controller = new Ctrl("http://<CONTROLLER-IPADDRESS:9001/rpc");

Controller.APIMETHOD(ARGUMENT)
    .then(function(data) {
        console.log("success : ", data);
    })
    .catch(function(error) {
        console.log("fail : ", error.toString());
    });
```

## List of Controller APIs implemented

* GenerateAuth("admin")
* FetchAuth("admin")
* ResetAuth("admin")
* AddServer({host:192.168.1.2})
* ListServers()
* GetServerMemStats({host:"192.168.1.2"})
* GetServerDiskStats({host:"192.168.1.2"})
* GetServerSysInfo({host:"192.168.1.2"})
* GetServerVersion({host:"192.168.1.2"})
* StorageStats('192.168.1.2')
* RebalanceStats('192.168.1.2')
* DiscoverServers({hosts:["192.168.1.2", "192.168.1.3", "192.168.1.4"]})
* GetControllerNetInfo()

## More Examples

```js
var Ctrl = require('minio-controller-js');

var Controller = new Ctrl("http://192.168.1.2:9001/rpc");

// Generate S3 key/secret
Controller.GenerateAuth("admin")
    .then(function(data) {
        console.log("success : ", data);
    })
    .catch(function(error) {
        console.log("fail : ", error.toString());
    });


// Add 3 servers
Controller.AddServer({host:"192.168.1.2"})
    .then(function(data) {
        return Controller.AddServer({host:"192.168.1.3"})
    })
    .then(function(data) {
        return Controller.AddServer({host:"192.168.1.4"})
    })
    .then(function(data) {
        // List added servers
        return Controller.ListServers()
    })
    .then(function(data) {
        console.log("success : ", data);
    })
    .catch(function(error) {
        console.log("fail : ", error.toString());
    });

// Get Server memory stats
Controller.GetServerMemStats({host:"192.168.1.4"})
    .then(function(data) {
        console.log("success : ", data);
    })
    .catch(function(error) {
        console.log("fail : ", error.toString());
    });
