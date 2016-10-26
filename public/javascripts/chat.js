//$ jQuery对象 客户访问时进行初始化！
// 传入函数对象，DOM，加载完成后立即执行！
$(function () {
    var content = $('#content');
    var status = $('#status');
    var input = $('#input');
    var myName = false;

    //建立websocket连接
    //io  是一个全局变量！
    socket = io.connect('http://localhost:3000');

    //收到server的连接确认，
    //客户端绑定事件，服务端触发，看来事件就是前后端之间约定的名字，调用回调！
    //从这里看出，预定事件的实现机制了！
    socket.on('open', function () {
        status.text('Choose a name:');
    });

    //监听system事件，判断welcome或者disconnect，打印系统消息信息
    socket.on('system', function (json) {
        var p = '';
        if (json.type === 'welcome') {
            if (myName == json.text) status.text(myName + ': ').css('color', json.color);
            p = '<p style="background:' + json.color + '">system  @ ' + json.time + ' : Welcome ' + json.text + '</p>';
        } else if (json.type == 'disconnect') {
            p = '<p style="background:' + json.color + '">system  @ ' + json.time + ' : Bye ' + json.text + '</p>';
        }
        content.prepend(p);
    });

    //监听message事件，打印消息信息
    socket.on('message', function (json) {
        // p 字符串拼接
        var p = '<p><span style="color:' + json.color + '";>' + json.author + '</span> @ ' + json.time + ' : ' + json.text + '</p>';
        if (json.author == myName) {
            // p.textAlign = 'right';
            // p.text.css('text-align', 'left');

        }
        content.prepend(p);
    });

    //通过“回车”提交聊天信息
    var enter = function (e) {
        var msg = $('#input').val();//修该给定值。
        if (!msg) return;
        socket.send(msg);
        $('#input').val('');
        if (myName === false) {
            myName = msg;
        }

    };

    input.keydown(function (e) {
        if (e.keyCode === 13) {
            enter(e);
        }
    });

    // $('enter').submit(enter);不行
    // $('enter').click(enter);不行 搞了半天没有添加id 符号 #
    // $('#enter').addEventListener('onclick',enter);
    $('#enter').click(enter);
});