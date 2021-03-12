const {
  getFavorData
} = require('../../db/db');

let openid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodData: [],
    oldData: [],
    isMore: true,
    isLoaded: false,
    isSearchLoaded: false,
    input: '',
  },

  searchIpt(e) {
    // console.log(e);
    this.setData({
      input: e.detail.value
    })
    if (this.data.input === '' || this.data.input === null) {
      getFavorData()
        .then(res => {
          console.log(res)
          if (res.total == 0) {
            wx.hideLoading();
            this.setData({
              isLoaded: true,
              foodData: [],
            })
          }
          if (res.data) {
            this.setData({
              isLoaded: true,
              foodData: res.data,
              isSearchLoaded: true,
            })
          }
        })
        .catch(err => {
          console.log(err);
          wx.showToast({
            icon: 'none',
            title: '请求超时,请重试...',
          })
        })
    }
  },

  searchBtn(e) {
    // console.log(e);
    if (this.data.input === '') {
      return;
    }
    const db = wx.cloud.database();
    db.collection('Published').where({
        favorArr: openid,
        foodName: db.RegExp({
          regexp: this.data.input,
          options: 'i',
        })
      })
      .field({
        foodName: true,
        images: true
      })
      .get()
      .then(res => {
        console.log(res);
        this.setData({
          foodData: res.data,
          isSearchLoaded: true,
        })
        if (this.data.foodData.length === 0) {
          wx.showToast({
            title: 'Ops收藏夹中找不到这个呢...',
            icon: 'none'
          })
        }
      })
  },

  toComment(e) {
    getApp().globalData.isAnotherPage = true;
    console.log(e);
    let id = e.currentTarget.dataset._id;
    let index = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: `../comment/comment?_id=${id}&index=${index}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    openid = wx.getStorageSync('openid');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  onShow: async function () {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    if (this.data.input !== '') {
      this.searchBtn();
      wx.hideLoading();
    } else {
      getFavorData()
        .then(res => {
          console.log(res)
          if (res.total == 0) {
            wx.hideLoading();
            this.setData({
              isLoaded: true,
              foodData: [],
            })
          }
          if (res.data) {
            this.setData({
              isLoaded: true,
              foodData: res.data,
              isSearchLoaded: true,
            })
            wx.hideLoading();
          }
        })
        .catch(err => {
          console.log(err);
          wx.hideLoading();
          wx.showToast({
            icon: 'none',
            title: '请求超时,请重试...',
          })
        })
    }
  },


  toIndex(e) {
    wx.switchTab({
      url: '../index/index',
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
  onReachBottom: async function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})