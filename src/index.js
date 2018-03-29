// @flow

import mapper from './methods';

import type {
    Method,
    MethodName,
    WorkerData,
    MessageEvent
} from './worker';

type Options = {
    storage?: Storage,
    workerPath?: string,
    method?: MethodName
};

type Rows = {
    [key: string]: Row
};

type Row = {
    resolve: (data: ?string) => void,
    reject: (error: ?string) => void
};

interface iStorageApi {
    setItem (key: string, str: string): Promise <?string>;
    getItem (key: string): Promise <?string>;
    removeItem (key: string): Promise <void>;
}

interface iGZLocalStorage {
    options: Options;
    storage: Storage;
    rows: Rows;
    worker: Worker;

    onError (err: Event): void;
    onMessage (e: MessageEvent): void;

    setMethod (method: MethodName): void;

    message (key: string, data: string, method: Method): Promise <?string>;

    compress (key: string, data?: string, method?: MethodName): Promise <?string>;
    decompress (key: string, data?: string, method?: MethodName): Promise <?string>;
}

export default class GZLocalStorage
    implements iGZLocalStorage, iStorageApi {

    options: Options;
    storage: Storage;
    rows: Rows;
    worker: Worker;

    constructor (options: Options = {method: 'UTF16'}) {

        this.options = options;
        this.storage = this.options.storage || localStorage;

        this.rows = {};
        this.worker = new Worker (
            this.options.workerPath || 'worker.js'
        );

        this.worker.onmessage = this.onMessage.bind (this);
        this.worker.onerror = this.onError.bind (this);
    }

    onError (err: Event) {
        console.error ('on error:', err);
    }

    onMessage (e: MessageEvent) {
        const eData: WorkerData = e.data;
        const key: ?string = eData.key;

        if (!key) {
            return;
        }

        const data: ?string = eData.data;
        const error: ?string = eData.error;
        const row: Row = this.rows [key];

        if (row) {
            if (error && row.reject) {
                row.reject (error);
            } else if (row.resolve) {
                row.resolve (data);
            }

            delete this.rows [key];
        }

    }

    message (key: string, data: string, method: Method): Promise <?string> {
        return new Promise ((resolve, reject) => {
            this.rows [key] = {resolve, reject};

            this.worker.postMessage ({
                key: key,
                data: data,
                method: method
            });
        });
    }

    compress (key: string, data?: string = '', _method?: MethodName) {
        const methodName: MethodName = _method || this.options.method || 'UTF16';
        const method: Method = mapper [methodName].compress;

        return this.message (key, data, method);
    }

    decompress (key: string, data?: string = '', _method?: MethodName) {
        const methodName: MethodName = _method || this.options.method || 'UTF16';
        const method: Method = mapper [methodName].decompress;

        return this.message (key, data, method);
    }

    setMethod (method: MethodName) {
        this.options.method = method;
    }


    setItem (key: string, str: string): Promise <?string> {
        return this.compress (key, str)
            .then ((result: ?string) => {
                if (typeof result === 'string') {
                    this.storage.setItem (key, result);
                }

                return result;
            });
    }

    getItem (key: string): Promise <?string> {
        return this.decompress (key, this.storage.getItem (key) || '');
    }

    removeItem (key: string): Promise <void> {
        return new Promise ((resolve) => {
            this.storage.removeItem (key);
            resolve ();
        });
    }
}