const {
  getFavorData
} = require('../../db/db');
let total;
let openid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodData: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    openid = wx.getStorageSync('openid');
    const db = wx.cloud.database();
    let dataRes;
    let res = await db.collection('Published').where({
      favorArr: openid
    }).count();
    console.log(res);
    total = res.total;
    if (total >= 10) {
      dataRes = await getFavorData(10, total - 10);
      total -= 10;
      dataRes.data.reverse();
      wx.hideLoading();
    } else if (total > 0) {
      dataRes = await getFavorData(total, 0);
      dataRes.data.reverse();
      total = 0;
      wx.hideLoading();
    } else if (total === 0) {
      wx.hideLoading();
      return;
    }
    this.setData({
      foodData: dataRes.data
    })

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    wx.showLoading({
      title: '加载更多...',
      mask: true
    })
    if (total >= 10) {
      let res = await getFavorData(10, total - 10);
      wx.hideLoading();
      res.data.reverse();
      total -= 10;
      console.log(total);
      let arr = res.data;
      this.data.foodData.push(...arr);
    } else if (total > 0) {
      wx.hideLoading();
      let res = await getFavorData(total, 0);
      console.log(res);
      res.data.reverse();
      total = 0;
      console.log(total);
      let arr = res.data;
      this.data.foodData.push(...arr);
    } else if (total === 0) {
      wx.showToast({
        icon: 'none',
        title: '暂无更多',
      })
    }
    this.setData({
      foodData: this.data.foodData
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})