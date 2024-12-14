import cors_proxy from 'cors-anywhere';

    const host = '0.0.0.0';
    const port = 8080;

    cors_proxy.createServer({
        originWhitelist: [],
        requireHeader: ['origin', 'x-requested-with'],
        removeHeaders: ['cookie', 'cookie2']
    }).listen(port, host, function() {
        console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
