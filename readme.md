## 在个人百度脑图中检索脑图内容
在百度脑图上做了很多脑图，苦于没有地方可以搜索，每次进入目录单个点开查找很是费劲，于是想抓下内容存储起来，便于检索到具体的脑图。

本项目基于Nodejs, typescript，运行前请先准备好Node的环境。

#### 使用方式
1. 登录 http://naotu.baidu.com/home ，F12 开启控制台, 观察Network ，将XHR请求头中的Cookie内容复制粘贴至 cookie.txt中。
2. 启动项目：
    ```bash
    npm install
    npm start
    ```

#### TODO list

- [x] 从cookie获取登录 token
- [x] 调用 脑图 http接口，定义相关接口数据格式接收
- [ ] 数据落地
- [ ] 界面+检索，页面回馈可直接进入结果页面
- [ ] 根据接口返回时间，定时做数据更新
- [ ] 做成chrome插件，数据存储至Google Driver?

