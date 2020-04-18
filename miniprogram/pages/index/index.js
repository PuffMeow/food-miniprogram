const app = getApp();

let openid = wx.getStorageSync('openid');
let total = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodData: [],
    isFirst: true
  },

  cardMove(e) {
    // console.log(e);
    let index = e.target.dataset.idx;
    if (e.detail.y > 430 || e.detail.y < -430) {
      // console.log(index)
      // console.log(e.detail)
      this.data.foodData.splice(index, 1)
      if (this.data.foodData.length != 0) {
        this.data.foodData[this.data.foodData.length - 1].isMove = false;
      } else {
        wx.showToast({
          icon: 'none',
          title: '暂无更多,自动刷新',
        })
        setTimeout(() => {
          this.onLoad()
        }, 1000)
      }
      this.setData({
        foodData: this.data.foodData
      })
      // console.log(index)
    }
  },

  touchEnd(e) {
    if (this.data.foodData.length <= 2) {
      if (this.data.isFirst == true) {
        wx.showToast({
          icon: 'loading',
          title: '加载更多...',
          duration: 2500,
          mask: true
        })
      }
      console.log(total);
      if (total >= 5) {
        console.log('开始调用获取数据函数')
        this.getData(5, total - 5).then(res => {
            console.log(res);
            let newData = res.data.concat(this.data.foodData)
            // console.log(newData)
            newData.forEach((ele, i) => {
              // console.log(ele);
              ele.isMove = true;
              if (i == newData.length - 1) {
                ele.isMove = false;
              }
            })
            this.setData({
              foodData: newData,
            })
            total -= 5;
            console.log(total)
          })
          .catch(err => {
            console.log(err);
          })
      } else if (total < 5) {
        if (total != 0) {
          console.log('total小于5')
          this.getData(total, 0).then(res => {
            console.log(res);
            let newData = res.data.concat(this.data.foodData)
            // console.log(newData)
            newData.forEach((ele, i) => {
              // console.log(ele);
              ele.isMove = true;
              if (i == newData.length - 1) {
                ele.isMove = false;
              }
            })
            this.setData({
              foodData: newData
            })
            setTimeout(() => {
              wx.hideLoading()
            }, 2000)
            total = 0;
            console.log(total)
          })
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    const db = wx.cloud.database();
    let res = await db.collection('Published').count();
    console.log(res);
    total = res.total;
    this.getData(5, total - 5)
      .then(res => {
        total -= 5;
        console.log(total)
        res.data.forEach((ele, i) => {
          // console.log(ele);
          ele.isMove = true;
          if (i == res.data.length - 1) {
            ele.isMove = false;
          }
        })
        this.setData({
          foodData: res.data
        })
        setTimeout(() => {
          wx.hideLoading()
        }, 3000)
      })
      .catch(err => {
        wx.hideLoading({
          complete: (res) => {
            wx.showToast({
              icon: 'none',
              title: '出了点错...',
            })
          },
        })
      })
  },

  //获取主页的数据
  getData(limit, skip) {
    console.log('调用获取数据函数')
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database();
      db.collection('Published')
        .orderBy('pubTime', 'asc')
        .limit(limit)
        .skip(skip)
        .get()
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    })
  },


  //点赞按钮
  likeBtn(e) {
    console.log(e);
    let id = e.currentTarget.dataset._id;
    let index = e.currentTarget.dataset.idx;
    let isLike = "foodData[" + index + "].isLike";
    console.log(isLike)
    this.setData({
      [isLike]: !this.data.foodData[index].isLike
    })
    if (this.data.foodData[index].isLike == true) {
      wx.cloud.callFunction({
          name: 'likeOrfavor',
          data: {
            option: 'like',
            id: id,
            openid: openid
          }
        })
        .then(res => {
          console.log(res);
          wx.showToast({
            icon: 'none',
            mask: true,
            duration: 500,
            title: '点赞成功',
          })
        })
        .catch(err => {
          console.log(err);
        })
    }
    if (this.data.foodData[index].isLike == false) {
      wx.cloud.callFunction({
          name: 'likeOrfavor',
          data: {
            option: 'unlike',
            id: id,
            openid: openid
          }
        })
        .then(res => {
          console.log(res);

        })
        .catch(err => {
          console.log(err);
        })
    }
  },




  toComment(e) {
    let userid = wx.getStorageSync('userid');
    console.log(e);
    let _id = e.currentTarget.dataset._id;
    if (userid) {
      wx.navigateTo({
        url: '../comment/comment?_id=' + _id
      })
    } else {
      wx.switchTab({
        url: '../my/my',
        success: (res) => {
          wx.showToast({
            icon: 'none',
            title: '请先登录'
          })
        }
      })
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