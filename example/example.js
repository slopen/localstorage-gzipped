var $ = window.$;
var GZLocalStorage = window.GZLocalStorage.default;

var gzLocalStorage = new GZLocalStorage ({
    workerPath: '/worker.js'
});

function async (Generator) {
    return function () {
        var generator = Generator.apply (this, arguments);

        function handle (result) {
            if (result.done) {
                return Promise.resolve (result.value);
            }

            return Promise.resolve (result.value)
                .then (function (res) {
                    return handle (generator.next (res));
                }, function (err) {
                    return handle (generator.throw (err));
                });
        }

        try {
            return handle (generator.next ());
        } catch (e) {
            return Promise.reject (e);
        }
    };
}

function storageSize () {
    return Object.keys(localStorage).reduce (function (prev, next) {
        return prev + localStorage.getItem (next).length;
    }, 0);
}

function getData (url) {
    return new Promise (function (resolve, reject) {
        $.getJSON(url)
            .then(resolve)
            .fail(reject);
    });
}

function displaySize ($el, text) {
    return requestAnimationFrame (() =>
        $el.find ('span').text (text)
    );
}



function fillStorage (method, data, $content) {
    return new Promise ((resolve, reject) => {
        let raw = 0;

        localStorage.clear ();
        gzLocalStorage.setMethod (method);

        $content.append ($ (
            `<div id="method-${method}">${method}: ` +
                '<span></span>/' +
                '<strong>0</strong> -> ' +
                '<em>0</em>' +
            '</div>'
        ));

        const $counter = $content.find ('#method-' + method);

        async (function *() {
            while (true) {
                raw += JSON.stringify (data).length;
                displaySize ($counter, raw);

                yield gzLocalStorage.setItem (
                    new Date ().getTime (),
                    JSON.stringify (data)
                );
            }
        }) ()
            .catch ((err) => {
                if (err.toString ().match (/QuotaExceededError/)) {
                    console.info (method, '-> raw size:', raw);

                    var size = storageSize (),
                        percents = (100 * raw / size).toFixed (2);

                    $counter.find ('strong').text (size);
                    $counter.find ('em').text (percents + '%');
                    $counter.prepend (
                        $ (`<div style="height:6px;margin-bottom:6px;width:${(percents/20)}%;background:green"/>`)
                    );

                    resolve ();
                } else {
                    reject (err);
                }
            });
    });
}

function testSizes () {
    const $content = $ ('#content').empty ();

    const url = $ ('#url')
        .find ('input')
        .val ();

    getData (url)
        .then ((data) =>
            async (function *(methods) {

                for (var i=0; typeof methods [i] !== 'undefined'; i++) {

                    yield ((method) =>
                        fillStorage (method, data, $content)
                    ) (methods [i]);
                }

            }) ([
                'UTF16',
                'Base64',
                'EncodedURIComponent'
            ])
        )
            .then (() => {
                console.info ('done');

                localStorage.clear ();
            })
            .catch ((err) => {
                console.error ('error:', err);
            });


    return false;
}

$ (() => $('#url').on ('submit', testSizes));

