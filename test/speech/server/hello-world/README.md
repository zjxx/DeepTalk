只需要关心`start.sh`和`src/resource`下的内容，java部分含有启动前端服务器相关的组件，所以没有更改。

但是，java后端部分的WebSocket处理逻辑实际未采用，具体的WebSocket链接产生在前端和DeepTalk的speech组件之间.

对前端的改动发生在`index.html`和`js/index.js`中，其他内容没有改变。

启动：检查`start.sh`中的Kurento服务器地址设置无误后，运行`start.sh`。

启动后，在`http://localhost:8443`访问前端，注意不需要使用安全链接。

--------------------

kurento-hello-world
===================

Kurento Java Tutorial: Hello World (WebRTC in loopback).

Running this tutorial
---------------------

In order to run this tutorial, please read the following [instructions](https://kurento.openvidu.io/docs/current/tutorials/java/tutorial-helloworld.html)

