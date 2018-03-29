// @flow

import LZString from 'lz-string';


export type ProcessFn = (str: string) => string;
export type MethodName = 'UTF16' | 'Base64' | 'EncodedURIComponent' | 'Uint8Array';

export type LZStringShape = {
    compressToUTF16: ProcessFn,
    decompressFromUTF16: ProcessFn,
    compressToBase64: ProcessFn,
    decompressFromBase64: ProcessFn,
    compressToEncodedURIComponent: ProcessFn,
    decompressFromEncodedURIComponent: ProcessFn,
    compressToUint8Array: ProcessFn,
    decompressFromUint8Array: ProcessFn
};

export type Method = $Keys <LZStringShape>;

export type WorkerData = {
    key: string,
    error: string,
    data?: string,
    method?: Method,
    info?: {
        in: string,
        out: string
    }
};

export type MessageEvent = {
  data: any;
  origin: string;
  lastEventId: string;
  source: WindowProxy;
};


const LZ: LZStringShape = LZString;

const response = (key: string, input: string, method: Method) => {
    const process: ProcessFn = LZ [method];

    if (typeof process === 'function') {

        try {
            const data = process (input);

            self.postMessage ({
                key,
                data,
                info: {
                    method,
                    in: input.length,
                    out: data.length
                }
            });

        } catch (e) {
            console.error ('ERROR', e);
        }

    } else {

        self.postMessage ({
            key: key,
            error: 'LZString unknown method: ' + method
        });

    }
}


self.onmessage = (e: MessageEvent) => {
    const eData: WorkerData = e.data;
    const key: ?string = eData.key;

    if (!key) {
        return;
    }

    const data: ?string = eData.data;
    const method: ?Method = eData.method;

    if (!data || !method) {
        return;
    }

    response (key, data, method);
}