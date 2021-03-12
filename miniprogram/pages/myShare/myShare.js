const {
  getMyData,
} = require('../../db/db')
const app = getApp();
let total;
let openid;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    foodData: [],
    isMore: true,
    isLiking: false,
    isFavoring: false,
    likeAnimation: [],
    favorAnimation: [],
    isLoaded: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openid = wx.getStorageSync('openid');

    wx.showLoading({
      title: '加载中...',
      mask: true,
    })

    getMyData()
      .then(res => {
        console.log(res)
        wx.hideLoading();
        if (res.total == 0) {
          this.setData({
            foodData: [],
            isLoaded: true,
          })
          return;
        }
        res.data.reverse();
        app.checkArrStatus(res.data, false, null, openid);
        this.setData({
          foodData: res.data,
          isLoaded: true,
        })
      }).catch(err => {
        wx.showToast({
          icon: 'none',
          title: '请求超时，请重试...',
        })
      })
  },
  // onLoad: async function (options) {
  //   openid = wx.getStorageSync('openid');

  //   wx.showLoading({
  //     title: '加载中...',
  //     mask: true,
  //   })
  //   const db = wx.cloud.database();
  //   let dataRes;
  //   let res = await db.collection('Published').where({
  //     openid: openid
  //   }).count();
  //   console.log(res);
  //   total = res.total;

  //   if (total >= 10) {
  //     dataRes = await getMyData(10, total - 10);
  //     console.log(dataRes);
  //     dataRes.data.reverse();
  //     app.checkArrStatus(dataRes.data, false, null, openid);
  //     total -= 10;
  //     console.log(total);
  //     wx.hideLoading();
  //   } else if (total > 0) {
  //     dataRes = await getMyData(total, 0);
  //     console.log(dataRes);
  //     dataRes.data.reverse();
  //     app.checkArrStatus(dataRes.data, false, null, openid);
  //     console.log(total);
  //     total = 0;
  //     wx.hideLoading();
  //   } else if (total === 0) {
  //     wx.hideLoading();
  //     return;
  //   }

  //   this.setData({
  //     foodData: dataRes.data,
  //     isLoaded: true
  //   })
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      likeAnimation: [],
      favorAnimation: []
    })
  },

  likeBtn(e) {
    app.globalData.isAnotherPage = true;
    app.likeMain(e, this, 'foodData');
  },

  favorBtn(e) {
    app.globalData.isAnotherPage = true;
    app.favorMain(e, this, 'foodData');
  },

  delete(e) {
    let _this = this;
    console.log(e);
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
            mask: true
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
                icon:'none',
                title: '删除失败',
              })
              return;
            }
          })
          wx.cloud.callFunction({
              name: 'deleteShare',
              data: {
                option: 'shareFood',
                id
              }
            })
            .then(res => {
              console.log(res);
              _this.data.foodData.splice(index, 1);
              _this.setData({
                foodData: _this.data.foodData
              })
              app.globalData.isAnotherPage = true;
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

  edit(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.idx;
    app.globalData.isAnotherPage = true;
    wx.navigateTo({
      url: `../publish/publish?id=${id}&index=${index}`,
    })
  },


  toComment(e) {
    console.log(e);
    app.globalData.isAnotherPage = true;
    let index = e.currentTarget.dataset.idx;
    let _id = e.currentTarget.dataset._id;
    wx.navigateTo({
      url: `../comment/comment?_id=${_id}&index=${index}`
    })
  },

  toPublish() {
    wx.navigateTo({
      url: '../publish/publish',
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
  // onReachBottom: async function () {
  //   if (this.data.isMore === true) {
  //     wx.showLoading({
  //       title: '加载更多...',
  //       mask: true
  //     })
  //     if (total >= 10) {
  //       let res = await getMyData(10, total - 10);

  //       app.checkArrStatus(res.data, false, null, openid);
  //       console.log(res);
  //       wx.hideLoading();
  //       res.data.reverse();
  //       total -= 10;
  //       console.log(total);
  //       let arr = res.data;
  //       this.data.foodData.push(...arr);
  //       this.setData({
  //         foodData: this.data.foodData
  //       })
  //     } else if (total > 0) {
  //       let res = await getMyData(total, 0);

  //       app.checkArrStatus(res.data, false, null, openid);
  //       console.log(res);
  //       res.data.reverse();
  //       total = 0;
  //       console.log(total);
  //       let arr = res.data;
  //       this.data.foodData.push(...arr);
  //       this.setData({
  //         foodData: this.data.foodData
  //       })
  //       wx.hideLoading();
  //     } else if (total === 0) {
  //       wx.showToast({
  //         icon: 'none',
  //         title: '暂无更多',
  //       })
  //       this.setData({
  //         isMore: false
  //       })
  //     }
  //   }
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})