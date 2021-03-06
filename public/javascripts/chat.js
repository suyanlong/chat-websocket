//$ jQuery对象 客户访问时进行初始化！
// 传入函数对象，DOM，加载完成后立即执行！
$(function () {
    var content = $('#content');
    var status = $('#status');
    var input = $('#input');
    var title = $('.title');
    var leftList = $('.left-list');
    var myName = '';

    //建立websocket连接
    //io  是一个全局变量！ io在哪里传过来的？？？难道就没有思考？？
    //这里的io 对象是怎么做到传给Web端的？？？
    socket = io.connect('http://150.221.80.3:3000');

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
            // if (myName == json.text) status.text(myName + ': ').css('color', json.color);
            status.text("");
            p = '<p style="background:' + json.color + '"> ' + json.text + '</p>';
            // p = '<p>' + json.text + '</p>';
            leftList.append(p);

        } else if (json.type == 'disconnect') {
            p = '<p>' + json.text + '</p>';
            leftList.remove(json.text);
            // p = '<p style="background:' + json.color + '">system  @ ' + json.time + ' : Bye ' + json.text + '</p>';
        }

        // 怎么在后面追加？？
        // content.prepend(p);
        // content.append(p)
        // content.after(p);
    });

    //监听message事件，打印消息信息
    socket.on('message', function (json) {
        // p 字符串拼接
        //var p = '<p><span style="color:' + json.color + '">' + json.author + '</span> @ ' + json.time + ' : ' + json.text + '</p>';
        // var p = '<p align="right" ><span style="color:' + json.color + '">' + json.author + '</span> @ ' + json.time + ' : ' + json.text + '</p>';
        //上面的也可以的。
        //var p = '<p style="text-align:right " ><span style="color:' + json.color + '">' + json.author + '</span> @ ' + json.time + ' : ' + json.text + '</p>';
        var p = '';
        if (json.author == myName) {//交流对话，左右分开
            // p.textAlign = 'right';
            // p.text.css('text-align', 'left');

            p = '<p style="text-align:right " ><span style="color:' + json.color + '">' + json.author + '</span> @ ' + json.time + ' : ' + json.text + '</p>';
        } else {
            p = '<p><span style="color:' + json.color + '">' + json.author + '</span> @ ' + json.time + ' : ' + json.text + '</p>';
        }
        content.prepend(p);
        // content.append(p);
        // $('p').css("display: inline-block");

    });

    //通过“回车”提交聊天信息
    var enter = function (e) {
        var msg = $('#input').val();//修该给定值。
        if (!msg) return;
        socket.send(msg);
        $('#input').val('');
        if (myName == false) {
            myName = msg;
            title.text(msg);
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