import { accessFile } from '../index'

describe('file', () => {
  it('should read existing file', async () => {
    const data = await accessFile('./package.json?raw=true')
    expect(data).toBeTruthy()
    expect(data.toString()).toContain('"name": "file-access"')
  })
})
