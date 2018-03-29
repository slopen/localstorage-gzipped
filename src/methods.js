// @flow

import type {
    Method,
    MethodName
} from './worker';

type MethodsMap = {
    [key: MethodName]: {
        compress: Method,
        decompress: Method
    }
};


const mapper: MethodsMap = {
    UTF16: {
        compress: 'compressToUTF16',
        decompress: 'decompressFromUTF16'
    },
    Base64: {
        compress: 'compressToBase64',
        decompress: 'decompressFromBase64'
    },
    EncodedURIComponent: {
        compress: 'compressToEncodedURIComponent',
        decompress: 'decompressFromEncodedURIComponent'
    },
    Uint8Array: {
        compress: 'compressToUint8Array',
        decompress: 'decompressFromUint8Array'
    }
};

export default mapper