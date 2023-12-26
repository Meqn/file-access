import https from 'node:https'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const remoteRegex = /^(https?:\/\/).+/i

type CallbackFunc = (err: Error | null, data?: Buffer) => void
export interface FileBuffer extends Buffer {
  contentType?: string
}

function filterPathQuery(url: string): string {
  const dirs = url.split(path.sep)
  const last = dirs.pop() as string
  return dirs.concat(last.split('?')[0]).join(path.sep)
}

/**
 * A function that requests a file from a given URL.
 *
 * @param {string} url - The URL of the file to be accessed.
 * @param {CallbackFunc} callback - (Optional) A callback function to be called after accessing the file.
 * @return {Promise<Buffer | RemoteBuffer>} A promise that resolves with the result of accessing the file.
 */
export const accessFile = async (url: string, callback?: CallbackFunc) => {
  try {
    if (remoteRegex.test(url)) {
      return await accessRemoteFile(url, callback)
    } else {
      return await accessLocalFile(url, callback)
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Reads a local file asynchronously and returns its contents as a Promise.
 *
 * @param {string} path - The path of the file to be read.
 * @param {CallbackFunc} [callback] - Optional callback function to handle errors or the file contents.
 * @return {Promise} A Promise that resolves with the contents of the file.
 */
export const accessLocalFile = async (
  path: string,
  callback?: CallbackFunc
) => {
  return new Promise<FileBuffer>((resolve, reject) => {
    path = filterPathQuery(path)

    fs.readFile(path, (err, data) => {
      if (err) {
        callback?.(err)
        reject(err)
      } else {
        callback?.(null, data)
        resolve(data)
      }
    })
  })
}

/**
 * Reads the contents of a local file synchronously and returns the data.
 *
 * @param {string} path - The path of the file to be read.
 * @param {CallbackFunc} [callback] - Optional callback function to be called with the data or an error.
 * @return {Buffer | undefined} The data read from the file, or undefined if an error occurred.
 */
export const accessLocalFileSync = (path: string, callback?: CallbackFunc) => {
  try {
    path = filterPathQuery(path)
    const data = fs.readFileSync(path)
    callback?.(null, data)
    return data
  } catch (err) {
    callback?.(err as unknown as Error)
  }
}

/**
 * Access a remote file and retrieve its contents.
 *
 * @param {string} url - The URL of the remote file.
 * @param {CallbackFunc} callback - Optional callback function to handle the result or error.
 * @return {Promise<RemoteBuffer>} A promise that resolves to the contents of the remote file as a buffer.
 */
export const accessRemoteFile = async (
  url: string,
  callback?: CallbackFunc
) => {
  return new Promise<FileBuffer>((resolve, reject) => {
    const request = url.startsWith('https') ? https : http
    request
      .get(url, res => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to fetch remote file. Status code: ${res.statusCode}`
            )
          )
          return
        }

        const chunks: Buffer[] = []
        res.on('data', d => chunks.push(d))
        res.on('end', () => {
          const buffer: FileBuffer = Buffer.concat(chunks)
          buffer.contentType = res.headers?.['content-type']
          callback?.(null, buffer)
          resolve(buffer)
        })
      })
      .on('error', err => {
        callback?.(err)
        reject(err)
      })
  })
}
