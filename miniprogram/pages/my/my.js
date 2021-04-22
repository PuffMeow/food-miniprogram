import {
  getOpenid
} from '../../db/db'

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
    schoolFoodCount: 0,
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
    wx.getUserProfile({
      desc: "将用于更好的展示体验",
      success: async res => {
        const {
          nickName,
          avatarUrl,
          gender
        } = res.userInfo

        wx.setStorageSync("nickName", nickName)
        wx.setStorageSync("avatar", avatarUrl)
        wx.setStorageSync("gender", gender)

        this.setData({
          avatar: avatarUrl,
          nickName: nickName,
          gender: gender,
          showMessage: true,
        })

        const db = wx.cloud.database();
        const _ = db.command;

        const openidRes = await getOpenid()
        const openid = openidRes.result.openid
        this.data.openid = openid
        wx.setStorageSync('openid', openid)

        db.collection('UserInfo').where({
            openid: openid
          })
          .get()
          .then(res => {
            console.log('查询用户:', res);
            if (res.data && res.data.length) {
              console.log('用户已存在');
              wx.setStorageSync('userid', res.data[0].userid);
            } else {
              const userid = wx.getStorageSync('userid') || this.getUserid()
              wx.cloud.callFunction({
                name: 'addUser',
                data: {
                  userid,
                  nickName,
                  avatar: avatarUrl,
                  gender
                }
              }).then(res => {
                console.log('用户数据存进数据库成功', res);
              }).catch(err => {
                console.log('操作失败', err);
              })
            }
          })
          .catch(err => {
            console.log(err);
          })
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          icon: 'none',
          title: '请先登录再使用',
        })
      }
    })
  },

  getUserid() {
    let userid = 'user' + Date.now() + (Math.random() * 1e5).toFixed(0);
    wx.setStorageSync('userid', userid);
    return userid;
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