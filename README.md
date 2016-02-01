# Minio File Browser
<blockquote>
This project is still a work in progress.
</blockquote>

``MinioBrowser`` provides minimal set of UI to manage buckets and objects on ``minio`` server. ``MinioBrowser`` is written in javascript and released under [Apache license v2](./LICENSE).

## Installation

```sh
$ git clone https://github.com/minio/MinioBrowser
$ npm install
$ bower install
```

### Install `go-bindata` and `go-bindata-assetfs`

If you do not have a working Golang environment, please follow [Install Golang](./INSTALLGO.md).

```sh
$ go get github.com/jteeuwen/go-bindata/...
$ go get github.com/elazarl/go-bindata-assetfs/...
```

## For regular development builds

```
$ npm run dev
```

### Now generate `assetfs.go` for development.

The supplied resource is already compressed. Doing it again would not add any value and may even increase the size of the data, use `nocompress` flag to avoid it.

```sh
$ go-bindata-assetfs -nocompress dev/...
```

## For production builds

```
$ npm run prod
```

### Now generate `assetfs.go` for production.

The supplied resource is already compressed. Doing it again would not add any value and may even increase the size of the data, use `nocompress` flag to avoid it.

```sh
$ go-bindata-assetfs -nocompress production/...
```

