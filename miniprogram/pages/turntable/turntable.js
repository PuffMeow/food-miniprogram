const {
  getFavorData
} = require('../../db/db');

let getDataNum = 20;
let total;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    animationData: [],
    chooseData: [],
    turntableData: [],
    upAnimation: [],
    downAnimation: [],
    //转动结束时
    selectedData: {},
    turnEnd: false,
    runDeg: 0,
    isTurn: false,
    screenHeight: 0,
    foodData: [],
    openid: '',
    isMore: true,
    isLoaded: false,
  },

  /**
   * 重置按钮
   */
  reset(e) {
    if (this.data.isTurn) {
      return;
    }
    this.data.foodData.forEach(ele => {
      ele.isChoose = false;
    })
    this.data.chooseData = [];
    this.setData({
      turntableData: [],
      // chooseData: [],
      foodData: this.data.foodData
    })
  },

  /**
   * 转动处理 
   */
  turn() {
    if (this.data.isTurn) {
      return;
    }
    if (this.data.turntableData.length === 0) {
      wx.showToast({
        icon: 'none',
        title: '请先进行选择',
      })
      return;
    }
    let runNum = 15;
    //随机选择物品
    let index = Math.round(Math.random() * this.data.chooseData.length - 1);
    if (index === -1) {
      index += 1;
    }
    console.log(index);

    this.data.runDeg = this.data.runDeg || 0;
    this.data.runDeg = this.data.runDeg + (360 - this.data.runDeg % 360) + (360 * runNum - index * (360 / this.data.chooseData.length));
    console.log(this.data.runDeg);

    let animationRun = wx.createAnimation({
      duration: 6000,
      timingFunction: 'ease'
    })

    animationRun.rotate(this.data.runDeg).step();
    this.data.isTurn = true;
    this.setData({
      animationData: animationRun.export(),
      index: index,
      // isTurn: true
    })
  },

  /**
   * 转动结束时触发事件
   */
  turnEnd(e) {
    console.log(e);
    setTimeout(() => {
      this.data.isTurn = false;
      this.setData({
        selectedData: this.data.chooseData[this.data.index],
        turnEnd: true,
        // isTurn: false
      })
    }, 500)
  },

  gotIt() {
    this.setData({
      turnEnd: false,
    })
  },

  /**
   *打开选择列表并加载数据
   */
  async choose(e) {
    if (this.data.isTurn) {
      return;
    }
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
      deley: 0
    })

    animation.translateY(-this.data.screenHeight).step();
    this.setData({
      upAnimation: animation.export(),
    })

    if (this.data.foodData != '') {
      return;
    }

    wx.showLoading({
      title: '加载收藏列表...',
      mask: true
    })
    const db = wx.cloud.database();
    let dataRes;
    let res = await db.collection('Published').where({
      favorArr: this.data.openid
    }).count();
    console.log(res);
    total = res.total;
    if (total >= getDataNum) {
      dataRes = await getFavorData(getDataNum, total - getDataNum);
      total -= getDataNum;
      dataRes.data.reverse();
      wx.hideLoading();
    } else if (total > 0) {
      dataRes = await getFavorData(total, 0);
      dataRes.data.reverse();
      total = 0;
      wx.hideLoading();
    } else if (total === 0) {
      wx.hideLoading();
      this.data.chooseData = []
      this.setData({
        foodData: [],
        // chooseData: [],
        isLoaded: true
      })
      return;
    }
    dataRes.data.forEach((ele, i) => {
      ele.isChoose = false;
    })
    this.setData({
      foodData: dataRes.data
    })
  },

  /**
   *关闭收藏表并渲染内容到页面上
   */
  done(e) {
    console.log(e)
    if (this.data.chooseData.length < 2) {
      wx.showToast({
        icon: 'none',
        title: '选择不能少于两个哦',
      })
      return;
    }
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
      deley: 0
    })
    animation.translateY(this.data.screenHeight).step();
    this.setData({
      upAnimation: animation.export(),
    })


    //转盘内容
    let len = this.data.chooseData.length;
    let turnNum = 1 / len;
    let tempList = [];
    for (var i = 0; i < len; i++) {
      tempList.push({
        index: i,
        turn: i * turnNum + 'turn',
        lineTurn: i * turnNum + turnNum / 2 + 'turn',
        name: this.data.chooseData[i].name,
        image: this.data.chooseData[i].image
      });
    };
    this.setData({
      turntableData: tempList
    })
  },

  /**
   * 取消按钮
   */
  cancel(e) {
    console.log(e);
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
      deley: 0
    })
    animation.translateY(this.data.screenHeight).step();
    this.setData({
      upAnimation: animation.export(),
    })
  },

  /**
   *选择收藏表里的食物
   */
  chooseFood(e) {
    console.log(e);
    let index = e.currentTarget.dataset.idx;
    let image = e.currentTarget.dataset.img;
    let name = e.currentTarget.dataset.name;

    let item = this.data.foodData[index];
    if (item.isChoose === false) {
      if (this.data.chooseData.length >= 6) {
        wx.showToast({
          icon: 'none',
          title: '选择不能超过6个哦',
        })
        return;
      }
      item.isChoose = true;
      let obj = {
        name,
        image
      }
      this.data.chooseData.push(obj);
    } else {
      item.isChoose = false;
      this.data.chooseData.forEach((ele, i) => {
        if (ele.name === name) {
          this.data.chooseData.splice(i, 1);
        }
      })
    }
    this.setData({
      // chooseData: this.data.chooseData,
      foodData: this.data.foodData
    })
  },

  /**
   *下拉加载更多内容
   */
  async getMoreData(e) {
    console.log(e)
    if (this.data.isMore === true) {
      wx.showLoading({
        title: '加载更多...',
        mask: true
      })
      if (total >= getDataNum) {
        let res = await getFavorData(getDataNum, total - getDataNum);
        res.data.reverse();
        total -= getDataNum;
        console.log(total);
        let arr = res.data;
        arr.forEach(ele => {
          ele.isChoose = false;
          this.data.foodData.push(ele);
        })
        wx.hideLoading();
      } else if (total > 0) {
        let res = await getFavorData(total, 0);
        console.log(res);
        res.data.reverse();
        total = 0;
        console.log(total);
        let arr = res.data;
        arr.forEach(ele => {
          ele.isChoose = false;
          this.data.foodData.push(ele);
        })
        wx.hideLoading();
      } else if (total === 0) {
        wx.showToast({
          icon: 'none',
          title: '暂无更多',
        })
        this.data.isMore = false;
      }
      this.setData({
        foodData: this.data.foodData,
        isMore: this.data.isMore
      })
    }
  },

  toIndex() {
    setTimeout(() => {
      wx.switchTab({
        url: '../index/index',
        complete: () => {
          let page = getCurrentPages().pop();
          if (page == undefined || page == null) {
            return;
          }
          setTimeout(() => {
            page.onLoad();
          }, 300)
        },
        fail: () => {
          wx.showToast({
            icon: 'none',
            title: '好像出了点错...',
          })
        }
      })
    }, 1200)
  },

  toMap(e) {
    let {
      name
    } = this.data.selectedData;
    wx.navigateTo({
      url: `../nearby/nearby?keyword=${name} `,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.openid = wx.getStorageSync('openid');
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let res = wx.getSystemInfoSync();
    this.setData({
      screenHeight: res.screenHeight
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

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