import {
  accessFile,
  accessLocalFile,
  accessLocalFileSync,
  accessRemoteFile
} from '../index'
import fs from 'node:fs'
import https from 'node:https'

jest.mock('node:fs')
jest.mock('node:https')

describe('accessFile', () => {
  // with jest.mock
  it('should access local files', async () => {
    const mockData = Buffer.from('Hello')
    const mockCallback = jest.fn()
    jest
      .mocked(fs.readFile)
      .mockImplementationOnce((_path, callback) => callback(null, mockData))

    const result = await accessFile('local/path', mockCallback)
    expect(result).toBe(mockData)
    expect(mockCallback).toHaveBeenCalledWith(null, mockData)
  })
  
  // with jest.spyOn
  it('should read local file contents', async () => {
    const mockBuffer = Buffer.from('Hello')
    jest.spyOn(fs, 'readFile').mockImplementationOnce((_path, callback) => {
      callback(null, mockBuffer)
    })

    const data = await accessFile('/path/to/local/file.txt')
    expect(data).toEqual(mockBuffer)
  })

  test('handles remote files', async () => {
    const mockData = Buffer.from('Hello')
    // @ts-ignore
    jest.spyOn(https, 'get').mockImplementationOnce((_url: string, callback: Function) => {
      const res = {
        statusCode: 200,
        headers: { 'content-type': 'text/plain' },
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            handler(mockData)
          } else if (event === 'end') {
            handler()
          }
        })
      }
      callback(res)
      return { on: jest.fn() }
    })

    const result = await accessFile('https://example.com/file.txt')

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.contentType).toBe('text/plain')
    expect(result.toString()).toBe('Hello')
  })
})

describe('accessLocalFile', () => {
  it('should read file contents', async () => {
    const mockCallback = jest.fn()
    const mockData = Buffer.from('Hello')
    jest
      .mocked(fs.readFile)
      .mockImplementation((_path, callback) => callback(null, mockData))

    const result = await accessLocalFile('local/path', mockCallback)

    expect(mockCallback).toHaveBeenCalledWith(null, mockData)
    expect(result).toBe(mockData)
  })

  it('should handle errors', async () => {
    const mockCallback = jest.fn()
    const mockError = new Error('error')
    jest
      .mocked(fs.readFile)
      .mockImplementation((_path, callback) =>
        callback(mockError, Buffer.from(''))
      )

    await expect(accessLocalFile('local/path', mockCallback)).rejects.toThrow(
      mockError
    )
    expect(mockCallback).toHaveBeenCalledWith(mockError)
  })
})

describe('accessLocalFileSync', () => {
  it('should read file contents', () => {
    const mockCallback = jest.fn()
    const mockData = Buffer.from('Hello')
    jest.mocked(fs.readFileSync).mockReturnValueOnce(mockData)

    const result = accessLocalFileSync('local/path', mockCallback)

    expect(result).toBe(mockData)
    expect(mockCallback).toHaveBeenCalledWith(null, mockData)
  })

  it('should handle errors', () => {
    const mockCallback = jest.fn()
    const mockError = new Error('error')
    jest.mocked(fs.readFileSync).mockImplementationOnce(() => {
      throw mockError
    })

    const result = accessLocalFileSync('local/path', mockCallback)

    expect(result).toBeUndefined()
    expect(mockCallback).toHaveBeenCalledWith(mockError)
  })
})

describe('accessRemoteFile', () => {
  it('should fetch remote file successfully', async () => {
    const mockData = Buffer.from('Hello')
    const mockResponse = {
      statusCode: 200,
      headers: { 'content-type': 'text/plain' },
      on: jest.fn((event, handler) => {
        if (event === 'data') {
          handler(mockData)
        } else if (event === 'end') {
          handler()
        }
      })
    }
    // Mock the http/https module
    ;(https.get as jest.Mock).mockImplementationOnce((_url, callback) => {
      callback(mockResponse)
      return mockResponse
    })

    const result = await accessRemoteFile('https://example.com')

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.contentType).toBe('text/plain')
    expect(result.toString()).toBe('Hello')
  })

  it('should handle errors', async () => {
    const mockCallback = jest.fn()
    const mockError = new Error('error')
    jest
      .mocked(https.get)
      .mockImplementationOnce(
        () => ({ on: (_event, callback) => callback(mockError) } as any)
      )

    await expect(
      accessRemoteFile('https://example.com', mockCallback)
    ).rejects.toThrow(mockError)
    expect(mockCallback).toHaveBeenCalledWith(mockError)
  })
})
