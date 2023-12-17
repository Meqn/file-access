/// <reference types="node" />
type CallbackFunc = (err: Error | null, data?: Buffer) => void;
export interface FileBuffer extends Buffer {
    contentType?: string;
}
export declare const accessFile: (url: string, callback?: CallbackFunc) => Promise<FileBuffer>;
export declare const accessLocalFile: (path: string, callback?: CallbackFunc) => Promise<FileBuffer>;
export declare const accessLocalFileSync: (path: string, callback?: CallbackFunc) => Buffer | undefined;
export declare const accessRemoteFile: (url: string, callback?: CallbackFunc) => Promise<FileBuffer>;
export {};
