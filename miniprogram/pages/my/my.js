const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showMessage: false,
    openid: '',
    avatar: '',
    nickName: '',
    gender: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getOpenid();
    let avatar = wx.getStorageSync('avatar');
    let nickName = wx.getStorageSync('nickName');
    let gender = wx.getStorageSync('gender');
    let userid = wx.getStorageSync('userid');
    if (userid) {
      this.setData({
        avatar,
        nickName,
        gender,
        showMessage: true
      })
    }
  },
  //点击获取用户信息
  getUserInfo(e) {
    let _this = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          console.log(e);
          let u = e.detail.userInfo;
          _this.setData({
            avatar: u.avatarUrl,
            nickName: u.nickName,
            gender: u.gender,
            showMessage: true,
          })
          wx.setStorageSync("nickName", u.nickName);
          wx.setStorageSync("avatar", u.avatarUrl);
          wx.setStorageSync("gender", u.gender);

          let db = wx.cloud.database();
          let _ = db.command;
          db.collection('UserInfo').where({
              openid: _this.data.openid
            })
            .get()
            .then(res => {
              console.log('查询用户:', res);
              if (res.data && res.data.length > 0) {
                console.log('用户已存在');
                wx.setStorageSync('userid', res.data[0].userid);
              } else {
                let avatar = u.avatarUrl;
                let nickName = u.nickName;
                let gender = u.gender;
                let userid = wx.getStorageSync('userid');
                if (!userid) {
                  userid = _this.getUserid();
                }
                wx.cloud.callFunction({
                    name: 'addUser',
                    data: {
                      userid: userid,
                      nickName: nickName,
                      avatar: avatar,
                      gender: gender,
                    }
                  })
                  .then(res => {
                    console.log('用户数据存进数据库成功', res);
                  })
                  .catch(err => {
                    console.log('操作失败', err);
                  })
              }
            })
            .catch(err => {
              console.log(err);
            })

        }else{
          wx.showToast({
            icon:'none',
            title: '请先授权再使用',
          })
        }
      }
    })
  },



  getOpenid() {
    wx.cloud.callFunction({
      name: 'getOpenid',
    }).then(res => {
      // console.log(res);
      let openid = res.result.openid
      wx.setStorageSync('openid', openid);
      this.setData({
        openid: openid
      })
    })
  },

  getUserid() {
    let userid = 'user' + Date.now() + (Math.random() * 1e5).toFixed(0);
    wx.setStorageSync('userid', userid);
    return userid;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})