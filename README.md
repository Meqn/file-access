# file-access

[![version](https://img.shields.io/npm/v/file-access?style=flat-square)](https://www.npmjs.com/package/file-access)
[![Codecov](https://img.shields.io/codecov/c/github/meqn/file-access?token=1498G3HFKJ&style=flat-square&logo=codecov)](https://codecov.io/gh/Meqn/file-access)
[![release](https://img.shields.io/github/actions/workflow/status/meqn/file-access/release.yml?style=flat-square)](https://github.com/Meqn/pipflow/releases)
[![node.js](https://img.shields.io/node/v/file-access?style=flat-square&logo=nodedotjs)](https://nodejs.org/en/about/releases/)
[![languages](https://img.shields.io/github/languages/top/meqn/file-access?style=flat-square)](https://github.com/Meqn/file-access)



Easily fetch local or remote file, and return buffer data.

> Not suitable for accessing large files

轻松获取本地或远程文件, 并返回buffer数据。(不适用于大文件)


## Usage

```js
const {
  accessFile,
  accessLocalFileSync
} = require('file-access');


accessFile('/path/to/local.txt', (err, data) => {
  // ...
})

accessFile('https://example.com/file.zip').then((data) => {
  // ...
  console.log('file size : ', data.byteLength)
  conosle.log('content-type :', data.contentType)
})

const buffer = accessLocalFileSync('/path/to/local.txt')
```
