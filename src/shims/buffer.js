import bufferModule from "../../node_modules/buffer/index.js";

export const Buffer = bufferModule.Buffer;
export const SlowBuffer = bufferModule.SlowBuffer;
export const transcode = bufferModule.transcode;
export const isUtf8 = bufferModule.isUtf8;
export const isAscii = bufferModule.isAscii;
export const kMaxLength = bufferModule.kMaxLength;
export const kStringMaxLength = bufferModule.kStringMaxLength;
export const btoa = bufferModule.btoa;
export const atob = bufferModule.atob;
export const constants = bufferModule.constants;
export const INSPECT_MAX_BYTES = bufferModule.INSPECT_MAX_BYTES;
export const Blob = bufferModule.Blob;
export const resolveObjectURL = bufferModule.resolveObjectURL;
export const File = bufferModule.File;

export default Buffer;
