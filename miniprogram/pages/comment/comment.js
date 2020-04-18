Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      "/images/pic.jpg",
      "/images/avatar.jpg",
    ],
    //轮播图相关
    currentSwiper: 0,
    interval: 4000,
    indicatorDots: false,
    duration: 1000,
    circular: true,
    count: 0,
    showMore: false,
    //页面数据相关
    foodName: '',
    addrName: '',
    desc: '',
    images: [],
    likeNum: 0,
    favorNum: 0,
    commentNum: 0,
    pubTime: '',
    avatar: '',
    nickName: '',
    gender: 0,
  },

  //轮播图
  swiperChange(e) {
    let current = e.detail.current;
    this.setData({
      currentSwiper: current
    })
  },

  seeMore(e) {
    if (this.data.showMore) {
      this.setData({
        showMore: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '正在加载中...',
    })
    const db = wx.cloud.database();
    db.collection('Published')
      .where({
        _id: options._id
      })
      .get()
      .then(res => {
        console.log(res);
        this.data.commentNum = res.data[0].commentNum;
        this.data.favorNum = res.data[0].favorNum;
        this.data.likeNum = res.data[0].likeNum;
        this.data.foodName = res.data[0].foodName;
        this.data.addrName = res.data[0].addrName;
        this.data.desc = res.data[0].desc;
        this.data.images = res.data[0].images;
        this.data.pubTime = res.data[0].pubTime;
        let pubOpenid = res.data[0].openid;
        db.collection('UserInfo')
          .where({
            openid: pubOpenid
          })
          .get()
          .then(res => {
            console.log(res);
            this.setData({
              avatar: res.data[0].avatar,
              nickName: res.data[0].nickName,
              gender: res.data[0].gender,
              foodName: this.data.foodName,
              addrName: this.data.addrName,
              desc: this.data.desc,
              favorNum: this.data.favorNum,
              likeNum: this.data.likeNum,
              images: this.data.images,
              pubTime: this.data.pubTime,
            })
          }).then(res => {
            //查看更多
            let query = wx.createSelectorQuery();
            query.select('.content').boundingClientRect(res => {
              let height = res.height;
              console.log(height)
              if (height > 91) {
                this.setData({
                  showMore: true
                })
              } else {
                this.setData({
                  showMore: false
                })
              }
            }).exec()
            wx.hideLoading({})
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
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

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