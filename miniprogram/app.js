//app.js
App({

  globalData: {
    //用户id
    userId:'',
    //用户信息
    userInfo:null,
    //授权状态
    auth:{
      "scope.userInfo":false
    },
    //登陆状态
    login:false
  },

  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'skywechat',
        traceUser: true,
      })
    }
    this.globalData = {}
  },
})