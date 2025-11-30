const { YtDlp } = require('ytdlp-nodejs');

console.log('YtDlp own properties:', Object.getOwnPropertyNames(YtDlp));
console.log('YtDlp prototype properties:', Object.getOwnPropertyNames(YtDlp.prototype));

// Try instantiating
try {
    const instance = new YtDlp();
    console.log('Instance properties:', Object.getOwnPropertyNames(instance));
    console.log('Instance prototype properties:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
} catch (e) {
    console.log('Instantiation failed:', e.message);
}
