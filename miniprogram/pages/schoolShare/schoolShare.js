const app = getApp();
let {
  getSchoolFood,
} = require('../../db/db');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //数据相关
    foodData: [],
    foodName: '',
    desc: '',
    isLoaded: false,
  },

  /**
   * 图片预览
   */
  previewImg(e) {
    console.log(e);
    let imgs = e.currentTarget.dataset.imgs;
    wx.previewImage({
      urls: imgs,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    wx.showLoading({
      title: '加载数据中...',
      mask: true,
    })
    try {
      let res = await getSchoolFood();
      let openid = wx.getStorageSync('openid');
      console.log(res);
      if (res.result === 0) {
        this.setData({
          foodData: [],
          isLoaded: true,
        })
        wx.hideLoading();
        return;
      }
      res.result.data.forEach((ele, i) => {
        if (ele.likeArr && ele.likeArr.includes(openid)) {
          ele.isLike = true;
        } else {
          ele.isLike = false;
        }
        if (ele.openid === openid) {
          this.data.foodData.unshift(ele)
        }
      })
      this.setData({
        foodData: this.data.foodData,
        isLoaded: true
      })
      wx.hideLoading();
    } catch (err) {
      console.log(err);
      wx.showToast({
        icon: 'none',
        title: '请求超时,请重试',
      })
    }
  },


  delete(e) {
    console.log(e)
    let _this = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.idx;
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.showLoading({
            title: '正在删除...',
          })

          let deleteImgs = _this.data.foodData[index].images;
          wx.cloud.deleteFile({
            fileList: deleteImgs,
            success: res => {
              console.log(res.fileList)
            },
            fail: err => {
              console.log(err);
              wx.showToast({
                icon: 'none',
                title: '删除失败',
              })
              return;
            }
          })

          wx.cloud.callFunction({
              name: 'deleteShare',
              data: {
                option: 'schoolFood',
                id
              }
            })
            .then(res => {
              console.log(res);
              _this.data.foodData.splice(index, 1);
              _this.setData({
                foodData: _this.data.foodData
              })
              wx.hideLoading({
                complete: (res) => {
                  wx.showToast({
                    title: '删除成功',
                  })
                },
              })
            })
        } else if (res.cancel) {
          return;
        }
      },
      fail(err) {
        wx.showToast({
          icon: 'none',
          title: '删除失败'
        })
      },
    })
  },

  toSchoolFood() {
    wx.navigateTo({
      url: '../schoolFood/schoolFood',
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
  onShow: async function () {

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