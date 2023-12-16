# file-access

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
  conosle.log('content-type :', data.contentType)
})

const buffer = accessLocalFileSync('/path/to/local.txt')
```
