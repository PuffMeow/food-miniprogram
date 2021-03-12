const {
  getOpenid
} = require('../../db/db')

let openid;

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
    shareCount: 0,
    favorCount: 0,
    schoolFoodCount:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    let avatar = wx.getStorageSync('avatar');
    let nickName = wx.getStorageSync('nickName');
    let gender = wx.getStorageSync('gender');
    let userid = wx.getStorageSync('userid');
    if (userid) {
      this.setData({
        avatar,
        nickName,
        gender,
        showMessage: true,
      })
    }

  },

  /**
   * 点击获取用户信息
   */
  async getUserInfo(e) {
    let res = await getOpenid();
    openid = res.result.openid;
    this.data.openid = openid;
    wx.setStorageSync('openid', openid);
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

        } else {
          wx.showToast({
            icon: 'none',
            title: '请先登录再使用',
          })
        }
      }
    })
  },

  getUserid() {
    let userid = 'user' + Date.now() + (Math.random() * 1e5).toFixed(0);
    wx.setStorageSync('userid', userid);
    return userid;
  },


  toMyShare() {
    wx.navigateTo({
      url: '../myShare/myShare'
    })
  },

  toMyFavor() {
    wx.navigateTo({
      url: '../favorite/favorite'
    })
  },

  toAboutSchool(e) {
    wx.navigateTo({
      url: '../aboutSchool/aboutSchool',
    })
  },

  toAbout(e) {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  toSchoolShare(e) {
    wx.navigateTo({
      url: '../schoolShare/schoolShare',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let openid = wx.getStorageSync('openid')
    const db = wx.cloud.database();

    let p1 = db.collection('Published').where({
        openid: openid
      })
      .count();

    let p2 = db.collection('Published').where({
        favorArr: openid
      })
      .count();

    let p3 = db.collection('SchoolFood').where({
        openid: openid
      })
      .count();

    Promise.all([p1, p2,p3]).then(res => {
      console.log(res);
      this.setData({
        shareCount: res[0].total,
        favorCount: res[1].total,
        schoolFoodCount:res[2].total
      })
    }).catch(err => {
      console.log(err);
      wx.showToast({
        icon: 'none',
        title: '出了点错...',
      })
    })

  },

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