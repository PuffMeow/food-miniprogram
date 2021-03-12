let QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
let qqmapsdk;

let myLatitude;
let myLongtitude;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedCallout: '',
    upAnimation: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let res = wx.getSystemInfoSync();
    this.setData({
      screenHeight: res.screenHeight
    })

    qqmapsdk = new QQMapWX({
      key: 'I27BZ-HRURF-HI7JB-NOYFI-EXRN5-O5F4C'
    });
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log(res);
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: err => {
        console.log(err);
      }
    })
    if (Object.keys(options).length !== 0) {
      this.getNearby(options.keyword);
    } else {
      this.getNearby();
    }
  },

  /**
   * 获取周边的东西
   */
  getNearby(keyword = '美食') {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log(res);
        myLatitude = res.latitude;
        myLongtitude = res.longitude;
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取位置信息失败',
        })
      }
    })
    qqmapsdk.search({
      keyword: keyword,
      page_size: 20,
      success: res => {
        if (res.data.length === 0) {
          wx.showToast({
            title: `附近找不到相关的店铺 "${keyword}"`,
          })
          return;
        }
        console.log(res);
        let markers = [];
        res.data.forEach((ele, i) => {
          console.log(ele._distance);
          if (ele._distance > 1000) {
            ele._distance = (Math.round(ele._distance / 100) / 10).toFixed(1) + "千米"
          } else {
            ele._distance = parseInt(ele._distance) + '米';
          }
          markers.push({
            title: ele.title,
            address: ele.address,
            category: ele.category.split(':')[1],
            distance: ele._distance,
            id: ele.id,
            latitude: ele.location.lat,
            longitude: ele.location.lng,
            iconPath: "/images/loc.png",
            width: 20,
            height: 20,
            callout: {
              content: ele.title,
              color: '#666666',
              bgColor: '#ffffff',
              fontSize: 14,
              padding: 10,
              borderRadius: 14,
              display: 'ALWAYS'
            }
          })
        })
        this.setData({
          markers
        })
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          icon: 'none',
          title: '请求超时，请重试...',
        })
      },
    });
  },

  /**
   * 选中地图上的泡泡
   */
  bindmarkertap(e) {
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
      deley: 0
    })
    animation.translateY(this.data.screenHeight).step();
    this.setData({
      upAnimation: animation.export(),
      polyline: []
    })
    console.log(e)
    let markerId = e.markerId;
    let selectedId = this.data.markers.findIndex((index) => index.id === markerId);
    for (let i = 0; i < this.data.markers.length; i++) {
      if (this.data.markers[i].callout == undefined) {
        continue
      }
      this.data.markers[i].callout.bgColor = '#ffffff';
      this.data.markers[i].callout.color = '#666666'
    }
    this.setData({
      selectedCallout: 'item' + markerId,
      selectedId: selectedId,
      markers: this.data.markers,
      ['markers[' + selectedId + '].callout.bgColor']: '#FF8D00',
      ['markers[' + selectedId + '].callout.color']: '#ffffff',
      longitude: this.data.markers[selectedId].longitude,
      latitude: this.data.markers[selectedId].latitude,
    })
  },

  /**
   * 选中选项
   */
  selectItem(e) {
    console.log(e);
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.idx;
    this.data.selectedIndex = index;

    for (let i = 0; i < this.data.markers.length; i++) {
      if (this.data.markers[i].callout == undefined) {
        continue
      }
      this.data.markers[i].callout.bgColor = '#ffffff';
      this.data.markers[i].callout.color = '#666666'
    }

    let distance = e.currentTarget.dataset.distance;
    this.setData({
      selectedId: index,
      selectedCallout: 'item' + id,
      markers: this.data.markers,
      ['markers[' + index + '].callout.bgColor']: '#FF8D00',
      ['markers[' + index + '].callout.color']: '#ffffff',
      longitude: this.data.markers[index].longitude,
      latitude: this.data.markers[index].latitude,
      itemDistance: distance
    })

    let animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
      deley: 0
    })
    animation.translateY(-this.data.screenHeight).step();

    qqmapsdk.direction({
      mode: 'walking',
      from: {
        latitude: myLatitude,
        longitude: myLongtitude
      },
      to: {
        latitude: this.data.markers[index].latitude,
        longitude: this.data.markers[index].longitude
      },
      success: res => {
        console.log(res);
        let ret = res.result.routes[0];
        let pl = [];
        let coors = [];
        //获取各个步骤的polyline
        if (ret.mode == 'WALKING' && ret.polyline) {
          coors.push(ret.polyline);
        }
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        let kr = 1000000;
        for (let i = 0; i < coors.length; i++) {
          for (let j = 2; j < coors[i].length; j++) {
            coors[i][j] = Number(coors[i][j - 2]) + Number(coors[i][j]) / kr;
          }
        }
        //定义新数组，将coors中的数组合并为一个数组
        let coorsArr = [];
        for (let i = 0; i < coors.length; i++) {
          coorsArr = coorsArr.concat(coors[i]);
        }
        //将解压后的坐标放入点串数组pl中
        for (let i = 0; i < coorsArr.length; i += 2) {
          pl.push({
            latitude: coorsArr[i],
            longitude: coorsArr[i + 1]
          })
        }

        //路线前的图标
        ret.steps.forEach((ele, i) => {
          if (ret.steps.length >= 1) {
            if (i === 0) {
              ele.routeImgSrc = '/images/route-start.png'
            } else if (i === ret.steps.length - 1) {
              ele.routeImgSrc = '/images/route-end.png'
            } else {
              ele.routeImgSrc = '/images/route-pass.png'
            }
          }
        })

        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          lines: ret.steps,
          polyline: [{
            points: pl,
            color: '#FF8D00',
            width: 4
          }],
          upAnimation: animation.export(),
        })
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          icon: 'none',
          title: '地点过近，无法获取路线',
        })
        this.setData({
          polyline: []
        })
      }
    });
  },


  /*
   * 关闭按钮
   */
  close(e) {
    console.log(e);
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
      deley: 0
    })
    animation.translateY(this.data.screenHeight).step();
    this.setData({
      upAnimation: animation.export(),
      polyline: []
    })
  },


  toDetailLoc(e) {
    console.log(e);
    let markers = this.data.markers;
    let index = this.data.selectedIndex;
    wx.openLocation({
      latitude: markers[index].latitude,
      longitude: markers[index].longitude,
      name: markers[index].title,
      address: markers[index].address,
      success: res => {
        console.log(res);
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          icon: 'none',
          title: '打开详情页失败',
        })
      }
    })
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