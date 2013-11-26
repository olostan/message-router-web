var connect = require('connect');
var app = connect();

var resPool = {};
var resId = 0;
var router;

app.use(function (req, res, next) {
    if (req.url.substr(0, 5) == '/api/') {
        var message = req.url.substr(5);
        resId++;
        resPool[resId] = res;
        router.send('web.receive', {webId: resId, call: message, body: req.body});
    } else
        next();
});

function startWeb(r) {
    router = r;
    //var server =
    app.listen(3000);

}

function sendResponce(msg) {
    var res = resPool[msg.webId];
    if (res && !res.finished) {
        if (msg.code) {
            res.statusCode = msg.code;
        }
        if (typeof(msg.response)=='object')
        {
            var r = JSON.stringify(msg.response);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Length', r.length);
            res.end(r);
        }
        else
            res.end(msg.response);
    }
    else
        console.warn('Can\'t find Response object for requested id. Message:', msg);
    delete resPool[msg.id];
}
function receiveCall(msg,next) {
    next(msg,msg.call);
}
function handleNoHandler(msg,next) {
    if (msg.data.webId) {
        router.send('web.reply',{webId:msg.data.webId,code:404,response: {error:'No route',route:msg.route}});
    } else next(msg);
}

module.exports = {
    '$start': startWeb,
    'error.noHandler': handleNoHandler,
    'web.receive': receiveCall,
    'web.reply': sendResponce
};