Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:[]
  },

  chooseImage(e){
    wx.chooseImage({
      sizeType:['original','compressed'],
      sourceType:['album','camera'],
      count:6,
      success:(res)=>{
        wx.showToast({
          title: '努力上传中...',
          icon: 'loading',
          mask: true,
          duration: 1000
        })
        let tempImgs = this.data.images.concat(res.tempFilePaths);
        let imgs = tempImgs.length <= 6 ? tempImgs : tempImgs.slice(0, 6);
        this.setData({
          images:imgs
        })
      }
    })
  },

  previewImg(e){
    let idx = e.currentTarget.dataset.idx;
    let imgs = this.data.images;
    wx.previewImage({
      current:imgs[idx],
      urls: imgs
    })
  },

  removeImg(e){
    console.log(e)
    let idx = e.currentTarget.dataset.idx;
    let imgs = this.data.images;
    imgs.splice(idx,1);
    this.setData({
      images:imgs
    })
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