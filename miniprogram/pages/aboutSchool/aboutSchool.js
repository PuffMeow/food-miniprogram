import {
  getSchoolImgs
} from '../../db/db'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    isLoaded: false,
  },

  previewImg(e) {
    let index = e.currentTarget.dataset.idx;
    let images = [];
    this.data.images.forEach(ele => {
      images.push(ele.url);
    })
    wx.previewImage({
      current: images[index],
      urls: images
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    getSchoolImgs()
      .then(res => {
        wx.hideLoading();
        this.setData({
          images: res.data,
          isLoaded: true
        })
      })
      .catch(err => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '请求超时，请重试...',
        })
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