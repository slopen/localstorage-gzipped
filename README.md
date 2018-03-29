## localstorage-gzipped

```
type MethodName = 'UTF16' | 'Base64' | 'EncodedURIComponent' | 'Uint8Array';

type Options = {
    storage?: Storage,
    workerPath?: string,
    method?: MethodName
};

interface iStorageApi {
    setItem (key: string, str: string): Promise <?string>;
    getItem (key: string): Promise <?string>;
    removeItem (key: string): Promise <void>;
}

```

### example

compare compression methods against max localStorage size

```
$ yarn run dev
```