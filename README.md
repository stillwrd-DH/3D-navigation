整个3D模型经过优化，保证不卡（总共3.58MB）。

这次的图书馆模型型经过打磨，耐看一些。

稍微加了一些外在环境，但是只有图书馆区上色，让图书馆成为焦点。

#路径规划方面：

-只有书架和大门有点位可以选

-13，14号书架如果不做起始点，路径就不会走那（桌椅），如果有就会走（不必要不穿桌椅）

-两种实现导航功能的方式

-方式1：直接鼠标点，或者屏幕点，看按钮就行

-方式2：用API，用你的前端调用API自动导航（前提是html已经启动），设置起点，设置终点，计算路径。

#版本方面：

-editor版本是可以调试API的

-user（现在的index.html）没有

#3D_navigation_api.js方面：

-API调用

    <!-- 直接写文件名 -->
    <script src="3D_navigation_api.js"></script>

-注意：这是html的写法

-调用条件是先启动html，你可以把html做到”容器”中，或者单纯跳转（注意，微信小程序web-view只能跳转，不能放容器，无论什么小程序元素都会被web-view霸屏覆盖掉，后面我给了解决方案），然后开始调用。

    // 1. 先检查API是否已经加载好
    if (typeof LibraryNavigationAPI === 'undefined') {
        console.error('找不到API，请确认api文件已正确引入');
        return;
    }

    // 2. 等待API初始化完成(重要)
    LibraryNavigationAPI.init(function(初始化成功) {
        if (初始化成功) {
            console.log(' API准备好了，可以开始用了！');
            // 在这里写你的代码
        } else {
            console.error(' API初始化失败');
        }
    });
    我准备了五个函数：
    // 函数1：设置起点
    LibraryNavigationAPI.setStartPoint({
        isDoor: true(false)  // 告诉系统：这是大门（或者不是大门）
        //如果是大门，后面的书架信息就不用写
        shelfIndex: n,      // 第n个书架（注意只有14个书架，不能越界）
        face: "back(front)",       // 背面（正面）
        column: m,          // 第m列(只有3列不能越界)
        row: p              // 第p层(只有4层不能越界)
    });
    LibraryNavigationAPI.setStartPoint({
        isDoor: true  // 告诉系统：这是大门
    });

    // 函数2：设为终点
    LibraryNavigationAPI.setEndPoint({
        isDoor: true(false)  // 告诉系统：这是大门（或者不是大门）
        //如果是大门，后面的书架信息就不用写
        shelfIndex: n,      // 第n个书架（注意只有14个书架，不能越界）
        face: "back(front)",       // 背面（正面）
        column: m,          // 第m列(只有3列不能越界)
        row: p              // 第p层(只有4层不能越界)
    });
    示例LibraryNavigationAPI.setEndPoint({
        isDoor: false,      // 不是大门，是书架
        shelfIndex: 1,      // 第1个书架
        face: "back",       // 背面（不是正面，正面是“front”）
        column: 2,          // 第2列
        row: 3              // 第3层
    });

    // 函数3：计算路线
    LibraryNavigationAPI.calculatePath();//直接用

    // 函数4：清除所有设置
    LibraryNavigationAPI.clear()

    // 函数5：获取当前状态
    LibraryNavigationAPI.getStatus()

    editor版就是调用这三个函数的调试版。
    
    点F12（打开控制台），你可以看到整个过程。

#更好的测试（如果你下载下来离线使用）

    0，把电脑和一个触屏设备连同一个网。
    
    1，电脑用live server打开
    
    2，你会看到打开网页的网址(http//x.x.x.x.xxxx....)
    
    3，电脑打开CMD（windows键+r，输入CMD），输入ipconfig回车，找到你连的网的ipv4地址（x.x.x.x）
    
    4，把电脑网页的网址复制下来，粘到一个位置（不要改原网页），把网址前四个数字换成你ipv4的四个数字。
    
    5，粘到触屏设备浏览器上，打开。

    6，就能在移动端看效果了。

#与微信小程序通信

-本系统通过 URL hash 接收小程序指令，并通过 wx.miniProgram.postMessage 返回结果。

    -1. 通信流程
    
    -javascript
    // 小程序端：修改 web-view 的 src
    const command = {
      action: 'init',           // 动作: init/setStart/setEnd/calculate/clear/getStatus
      data: { ... },            // 数据（根据动作不同）
      messageId: '123456'       // 可选，用于响应匹配
    };
    
    // 编码后设置 hash
    const hash = encodeURIComponent(JSON.stringify(command));
    webView.src = `https://你的域名/index.html#${hash}`;
    
    -2. 支持的命令
    
    动作	    描述	                数据格式
    
    init	    初始化起点终点并计算路径	{ start: 起点数据, end: 终点数据 }
    
    setStart	设置起点	                起点数据
    
    setEnd	    设置终点	                终点数据
    
    calculate	计算路径	                无
    
    clear	    清除所有设置	            无
    
    getStatus	获取当前状态	            无
    
    -3. 数据格式
    起点/终点数据（书架）
    
    -javascript
    {
      isDoor: false,
      shelfIndex: 5,     // 1-14
      face: 'front',      // 'front' 正面 / 'back' 背面
      column: 2,          // 1-3列
      row: 3              // 1-4层
    }
    
    起点/终点数据（大门）
    
    -javascript
    {
      isDoor: true,
      doorFace: 'outside' // 可选，默认 'outside'
    }
    
    -4. 返回结果
    
    网页执行命令后，会通过 wx.miniProgram.postMessage 返回：
    
    -javascript
    {
      type: 'initResult',           // 动作名 + 'Result'
      success: true,                 // 是否成功
      data: { ... },                  // 返回数据
      messageId: '123456',            // 对应命令的 messageId
      timestamp: 1641024000000        // 时间戳
    }
    
    // 错误时
    {
      type: 'error',
      message: '错误信息',
      command: 'init',
      messageId: '123456'
    }
    
    5. 小程序端监听
    
    -javascript
    // 小程序 Page 中
    Page({
      onLoad() {
        // 监听 web-view 返回的消息
        wx.onMessage(this.handleMessage);
      },
      
      handleMessage(res) {
        console.log('收到网页消息:', res);
        // 处理返回结果
      }
    });
    
-web-view不能放容器，只能跳转的话，可以先放一个输入想去的起点终点的页面，再跳转，文件夹example里的是一个粗糙版的，可以照葫芦画瓢。
    
#如果GitHub无法引用，用微信云托管部署即可。








