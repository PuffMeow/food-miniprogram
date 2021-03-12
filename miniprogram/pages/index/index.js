const app = getApp();
import {
  getOpenid,
  getData,
  getHotData
} from '../../db/db'

let userid;
let total = 0;
let getDataLength = 6; //每次加载更多时追加的数量

Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodData: [],
    hotData: [],
    isRequest: false,
    isDataGtDLength: true,
    openid: '',
    height: '',
    isLiking: false,
    isFavoring: false,
    isFirst: false,
    favorAnimation: [],
    likeAnimation: [],
    isLoaded: false,
  },

  /**
   * 卡片移动触发
   */
  cardMove(e) {
    // console.log('卡片移动了',e);
    if (this.data.isRequest) return;
    if (e.detail.y > this.data.height - 130 || e.detail.y < -(this.data.height - 105)) {
      let index = e.target.dataset.idx;
      // console.log(index)
      this.data.foodData.splice(index, 1); //删除当前卡片
      //删除卡片移动滑动手指
      this.setData({
        isFirst: false
      })
      wx.setStorageSync('isFirst', false)
      if (this.data.foodData.length === 2) {
        if (this.data.isDataGtDLength && total !== 0) {
          wx.showLoading({
            title: '加载更多...',
            mask: true,
          })
        }
        // console.log(total);
        if (total >= getDataLength) {
          this.data.isRequest = true;
          getData(getDataLength, total - getDataLength, 'asc')
            .then(res => {
              console.log('开始获取数据', res);
              app.checkArrStatus(res.data, true, this.data.foodData, this.data.openid);
              this.setData({
                foodData: this.data.foodData,
                isRequest: false,
                favorAnimation: [],
                likeAnimation: [],
              })
              total -= getDataLength;
              console.log(total);
              setTimeout(() => {
                wx.hideLoading();
              }, 1200);
            }).catch(err => {
              // console.log(err);
              wx.hideLoading();
              wx.showToast({
                title: '请求超时，请重试...',
                icon: 'none',
              })
            })
        } else if (total < getDataLength && total > 0) {
          this.data.isRequest = true;
          this.data.isDataGtDLength = false;
          getData(total, 0, 'asc')
            .then(res => {
              console.log('小于获取的数据并且大于0', res);
              app.checkArrStatus(res.data, true, this.data.foodData, this.data.openid);
              this.setData({
                foodData: this.data.foodData,
                isRequest: false,
                favorAnimation: [],
                likeAnimation: [],
              })
              total = 0;
              // console.log(total);
              setTimeout(() => {
                wx.hideLoading();
              }, 1200)
            }).catch(err => {
              console.log(err);
              wx.showToast({
                icon: 'none',
                title: '请求超时，请重试...',
              })
            })
        } else if (total <= 0) {
          setTimeout(() => {
            this.setData({
              foodData: this.data.foodData
            })
            wx.hideLoading();
          }, 1200);
        }
      }

      if (this.data.foodData.length !== 0) {
        this.data.foodData[this.data.foodData.length - 1].isMove = false;
        this.setData({
          foodData: this.data.foodData
        })
      } else {
        //当数据等于0的时候，开始重新请求追加最新的数据
        this.setData({
          foodData: this.data.foodData
        })
        this.data.isRequest = true;
        wx.showToast({
          icon: 'none',
          title: '暂无更多,自动刷新',
          mask: true,
        })
        setTimeout(() => {
          this.data.isRequest = false;
          this.onLoad();
        }, 1200);
      }
    }
  },

  /**
   * 点击关闭滑动手指
   */
  upAndDown() {
    this.setData({
      isFirst: false
    })
    wx.setStorageSync('isFirst', false)
  },

  /** 
   * 点赞按钮触发
   */
  likeBtn(e) {
    app.likeMain(e, this, 'foodData')
  },

  /** 
   * 收藏按钮触发
   */
  favorBtn(e) {
    app.favorMain(e, this, 'foodData');
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let system = wx.getSystemInfoSync();
    // console.log(system);
    this.data.height = system.windowHeight;
    this.data.isDataGtDLength = true;
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    const db = wx.cloud.database();
    try {
      let res = await db.collection('Published').count();
      console.log(res);
      total = res.total;
    } catch (err) {
      console.log(err);
      wx.showToast({
        title: '请求超时，请重试...',
      })
    }
    let openid = wx.getStorageSync('openid');
    if (openid !== '') {
      this.data.openid = openid;
    } else {
      let openidRes = await getOpenid();
      this.data.openid = openidRes.result.openid;
      wx.setStorage({
        data: openidRes.result.openid,
        key: 'openid',
      })
    }

    if (total >= 8) {
      getData(8, total - 8, 'asc')
        .then(res => {
          total -= 8;
          // console.log(total)
          // console.log(res);
          let arr = res.data;
          app.checkArrStatus(arr, true, null, this.data.openid);
          this.setData({
            favorAnimation: [],
            likeAnimation: [],
            foodData: res.data,
            isLoaded: true
          })
          setTimeout(() => {
            wx.hideLoading();
          }, 1800)
        }).catch(err => {
          console.log(err);
          wx.hideLoading();
          wx.showToast({
            icon: 'none',
            title: '请求超时，请重试...',
          })
        })
    } else {
      getData(total, 0, 'asc')
        .then(res => {
          // console.log(res.data)
          total = 0;
          app.checkArrStatus(res.data, true, null, this.data.openid);
          this.setData({
            favorAnimation: [],
            likeAnimation: [],
            isLoaded: true,
            foodData: res.data
          })
          setTimeout(() => {
            wx.hideLoading();
          }, 1800)
        }).catch(err => {
          // console.log(err);
          wx.hideLoading();
          wx.showToast({
            icon: 'none',
            title: '请求超时，请重试...',
          })
        })
    }
  },

  toHotComment(e) {
    // console.log(e);
    let _id = e.currentTarget.dataset._id;
    let index = this.data.foodData.findIndex(v => v._id === _id);
    // console.log('hotIndex', index);
    if (userid) {
      wx.navigateTo({
        url: `../comment/comment?_id=${_id}&index=${index}`
      })
    } else {
      app.toLogin();
    }
  },

  toComment(e) {
    if (e.currentTarget.dataset.ismove === false) {
      // console.log(e);
      let _id = e.currentTarget.dataset._id;
      let index = e.currentTarget.dataset.idx;
      if (userid) {
        wx.navigateTo({
          url: `../comment/comment?_id=${_id}&index=${index}`
        })
      } else {
        app.toLogin();
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    userid = wx.getStorageSync('userid');
    if (app.globalData.isAnotherPage === true) {
      this.onLoad();
      app.globalData.isAnotherPage = false;
    }
    this.setData({
      favorAnimation: [],
      likeAnimation: [],
    })

    getHotData()
      .then(res => {
        // console.log(res);
        this.setData({
          hotData: res.data
        })
      }).catch(err => {
        // console.log(err);
        wx.showToast({
          icon: 'none',
          title: '获取热门数据失败',
        })
      })
  },

  onReady: function () {
    let isFirst = wx.getStorageSync('isFirst');
    if (isFirst === false) {
      this.setData({
        isFirst: isFirst
      })
    } else {
      this.setData({
        isFirst: true
      })
    }
  }
})