/**
 * 1、这个文件算是服务端文件了。
 * 2、通讯的传递！
 * 3、事件两端之间的关系，即订阅者、触发者！
 *
 *
 */
//引入程序包
var express = require('express'),
    path = require('path'),
    app = express(),
    server = require('http').createServer(app),
    ios = require('socket.io').listen(server);

//设置日志级别
//io.set('log level', 1); 已经过时了。

//WebSocket连接监听 connection事件，是socket.io预定的事件。库来来触发这个事件。
//看来，怎么约定事件，理清楚事件的订阅者以及触发者，这个还是很重要的！
ios.on('connection', function (socket) {
    //
    socket.emit('open'); //通知客户端已连接，通知客户端。

    // 打印握手信息
    //console.log(socket.handshake);

    // 构造客户端对象
    var client = {
        socket: socket,
        name: false,
        color: getColor()
    }

    // 对message事件的监听
    socket.on('message', function (msg) {
        var obj = {
            time: getTime(),
            color: client.color
        };

        // 判断是不是第一次连接，以第一条消息作为用户名
        if (!client.name) {
            client.name = msg;
            obj['text'] = client.name;
            obj['author'] = 'System';
            obj['type'] = 'welcome';
            console.log(client.name + ' login');
            //返回欢迎语
            socket.emit('system', obj);
            //广播新用户已登陆
            var num = socket.broadcast.emit('system', obj);//通过监听器参数，实现通讯！

        } else {

            //如果不是第一次的连接，正常的聊天消息
            obj['text'] = msg;
            obj['author'] = client.name;
            obj['type'] = 'message';
            console.log(client.name + ' say: ' + msg);

            // 返回消息（可以省略）
            socket.emit('message', obj);
            // 广播向其他用户发消息
            socket.broadcast.emit('message', obj);
        }
    });

    //监听出退事件
    socket.on('disconnect', function () {
        var obj = {
            time: getTime(),
            color: client.color,
            author: 'System',
            text: client.name,
            type: 'disconnect'
        };

        // 广播用户已退出
        socket.broadcast.emit('system', obj);
        console.log(client.name + 'Disconnect');
    });

});

//express基本配置 //先配置基本信息，js本就是解析脚本语言，不存在编译的情况，所以有时候直接写在代码里就可以了。
app.configure(function () {
    app.set('port', process.env.PORT || 3000);//
    app.set('views', __dirname + '/views');//设置虚拟目录路径
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    //设置静态文件资源根目录！！！并且明白静态文件的意思是什么!
    //Express 会在静态资源目录下查找文件，所以不需要把静态目录作为URL的一部分。
    app.use(express.static(path.join(__dirname, 'public')));
});
//自定义配置
app.configure('development', function () {
    app.use(express.errorHandler());
});

// 指定webscoket的客户端的html文件
app.get('/', function (req, res) {
    res.sendfile('views/chat.html');
    // console.log(res.path);
});

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});


var getTime = function () {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
};

var getColor = function () {
    // aquamarine 
    var colors = ['aliceblue','aqua', 'aquamarine', 'pink', 'red', 'green',
        'orange', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue'
    ];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
};