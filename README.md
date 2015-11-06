# Minio Explorer

``me`` (Minio Explorer) provides minimal set of UI to manage buckets and objects on ``minio`` server. ``me`` is written in javascript and released under [Apache license v2](./LICENSE).

<blockquote>
Minio Explorer has borrowed some ideas from - https://github.com/timotius02/electron-file-explorer.
</blockquote>

## Installation

```sh
$ git clone https://github.com/minio/minio-bucket-explorer
$ npm install
```

```sh
$ npm start

> @ start /Users/harsha/Repositories/minio-bucket-explorer
> gulp serve

[23:09:13] Using gulpfile ~/Repositories/minio-bucket-explorer/gulpfile.js
[23:09:13] Starting 'sass'...
[23:09:13] Finished 'sass' after 14 ms
[23:09:13] Starting 'font'...
[23:09:13] Starting 'main'...
[23:09:13] Starting 'html'...
[23:09:13] Finished 'html' after 38 ms
[23:09:22] Finished 'font' after 9.31 s
[23:09:26] Finished 'main' after 13 s
[23:09:26] Starting 'build'...
[23:09:26] Finished 'build' after 21 μs
[23:09:26] Starting 'serve'...
[23:09:26] Webserver started at http://localhost:8000
[23:09:26] Finished 'serve' after 15 ms
```

Now point your browser to ``http://localhost:8000``
