let openid;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    clientHeight: 800,
    index: 0,
    likeAnimation:[],
    isLoaded:false,
  },

  swichNav(e) {
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },

  swiperChange(e) {
    this.setData({
      currentTab: e.detail.current,
    })
  },

  /**
   * 图片预览
   */
  previewImg(e) {
    console.log(e);
    let name = e.currentTarget.dataset.name;
    wx.previewImage({
      urls: this.data[name].images,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    wx.showLoading({
      mask: true,
      title: '加载中...',
    })
    wx.getSystemInfo({
      success: res => {
        console.log(res);
        this.setData({
          clientHeight: res.windowHeight - res.windowHeight / 9
        });
      }
    })
    const db = wx.cloud.database();
    db.collection('AboutDininghall').get()
      .then(res => {
        getApp().checkArrStatus(res.data, false, false, openid);
        console.log(res);
        this.setData({
          qianxihe: res.data[0],
          yansheng: res.data[1],
          daxibei: res.data[2],
          zhongxin: res.data[3],
          honggaoliang: res.data[4],
          xingyeyuan: res.data[5],
          isLoaded:true
        })
        wx.hideLoading();
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

  likeBtn(e) {
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    if (this.data[name].isLike) {
      wx.showToast({
        icon: 'none',
        title: '已打Call',
      })
      return;
    }
    let userid = wx.getStorageSync('userid');
    if (userid) {
      let likeAnimation = wx.createAnimation({
        duration: 1500
      })
      likeAnimation.scale(0.1).step({
        duration: 600
      });
      likeAnimation.scale(1.0).step({
        duration: 450
      });
      likeAnimation[name] = likeAnimation.export(),
        this.setData({
          likeAnimation: likeAnimation,
        })

      wx.cloud.callFunction({
          name: 'likeOrfavor',
          data: {
            option: 'dininghallLike',
            id,
            openid,
          }
        })
        .then(res => {
          console.log(res);
          let isLike = name + '.isLike';
          let likeNum = name + '.likeNum'
          this.setData({
            [isLike]: true,
            [likeNum]: res.result.data.likeNum
          })
        })
        .catch(err=>{
          wx.showToast({
            icon:'none',
            title: '请求超时，请重试...',
          })
        })
    } else {
      getApp().toLogin();
    }

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
    openid = wx.getStorageSync('openid');
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