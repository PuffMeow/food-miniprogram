App({
  globalData: {
    isAnotherPage: false,
  },

  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'skywechat',
        traceUser: true,
      })
    }
    this.globalData = {};
  },


  toLogin() {
    wx.switchTab({
      url: '../my/my',
      success: (res) => {
        wx.showToast({
          icon: 'none',
          title: '请先登录体验更多功能'
        })
      }
    })
  },

  /**
   * @param 传入事件 e 
   * @param 传入页面的this pointer
   * @param 传入要改变的数组 arr 
   */
  likeMain(e, pointer, arr, isSchoolFood = false) {
    let userid = wx.getStorageSync('userid');
    const {
      likeOrFavor
    } = require('./db/db');
    console.log('触发点赞事件', e);
    console.log(pointer.data);
    console.log(arr);
    if (userid) {
      if (e.currentTarget.dataset.ismove === false && e.currentTarget.dataset.name === '主页' || e.currentTarget.dataset) {
        let id = e.currentTarget.dataset._id;
        let index = e.currentTarget.dataset.idx;
        console.log(id, index);
        let isLike = arr + "[" + index + "].isLike";
        let likeNum = arr + "[" + index + "].likeNum";
        let likeArr = arr + "[" + index + "].likeArr";
        console.log(isLike, likeNum, likeArr);
        if (pointer.data[arr][index].isLike === false) {
          if (pointer.data.isLiking === false) {
            let likeAnimation = wx.createAnimation({
              duration: 1200
            })
            likeAnimation.scale(0.1).step({
              duration: 320
            });
            likeAnimation.scale(1.0).step({
              duration: 280
            });
            likeAnimation[index] = likeAnimation.export(),
              pointer.data.isLiking = true;
            pointer.setData({
              likeAnimation: likeAnimation,
              // isLiking: true
            })
            if (isSchoolFood) {
              likeOrFavor(id, 'schoolFoodLike')
                .then(res => {
                  console.log(res);
                  pointer.data.isLiking = false;
                  pointer.setData({
                    [isLike]: true,
                    [likeNum]: res.result.data.likeNum,
                    [likeArr]: res.result.data.likeArr,
                    // isLiking: false,
                  })
                })
                .catch(err => {
                  console.log(err)
                  wx.showToast({
                    icon: 'none',
                    title: '请求超时，请重试...',
                  })
                })
            } else {
              likeOrFavor(id, 'like')
                .then(res => {
                  console.log(res);
                  pointer.data.isLiking = false;
                  pointer.setData({
                    // isLiking: false,
                    [isLike]: true,
                    [likeNum]: res.result.data.likeNum,
                    [likeArr]: res.result.data.likeArr
                  })
                })
                .catch(err => {
                  console.log(err)
                  wx.showToast({
                    icon: 'none',
                    title: '请求超时，请重试...',
                  })
                })
            }
          }
        }
        if (pointer.data[arr][index].isLike === true) {
          console.log('取消点赞');
          if (pointer.data.isLiking === false) {
            pointer.data.isLiking = true;
            // pointer.setData({
            //   isLiking: true
            // })
            if (isSchoolFood) {
              likeOrFavor(id, 'schoolFoodUnlike')
                .then(res => {
                  console.log(res);
                  pointer.data.isLiking = false;
                  pointer.setData({
                    // isLiking: false,
                    [isLike]: false,
                    [likeNum]: res.result.data.likeNum,
                    [likeArr]: res.result.data.likeArr
                  })
                }).catch(err => {
                  console.log(err);
                  wx.showToast({
                    icon: 'none',
                    title: '请求超时，请重试...',
                  })
                })
            } else {
              likeOrFavor(id, 'unlike')
                .then(res => {
                  console.log(res);
                  pointer.data.isLiking = false;
                  pointer.setData({
                    // isLiking: false,
                    [isLike]: false,
                    [likeNum]: res.result.data.likeNum,
                    [likeArr]: res.result.data.likeArr
                  })
                }).catch(err => {
                  console.log(err);
                  wx.showToast({
                    icon: 'none',
                    title: '请求超时，请重试...',
                  })
                })
            }
          }
        }
      }
    } else {
      this.toLogin();
    }
  },

  /**
   * @param 传入事件 e 
   * @param 传入页面的this pointer
   * @param 传入要收藏的数组 arr 
   */
  favorMain(e, pointer, arr) {
    console.log('触发收藏事件', e);
    let userid = wx.getStorageSync('userid');
    const {
      likeOrFavor
    } = require('./db/db');
    if (userid) {
      if (e.currentTarget.dataset.ismove === false && e.currentTarget.dataset.name === '主页' || e.currentTarget.dataset) {
        let id = e.currentTarget.dataset._id;
        let index = e.currentTarget.dataset.idx;
        let isFavor = arr + "[" + index + "].isFavor";
        let favorNum = arr + "[" + index + "].favorNum";
        let favorArr = arr + "[" + index + "].favorArr";
        if (pointer.data[arr][index].isFavor === false) {
          if (pointer.data.isFavoring === false) {
            let favorAnimation = wx.createAnimation({
              duration: 1200
            })
            favorAnimation.scale(0.1).step({
              duration: 320
            });
            favorAnimation.scale(1.0).step({
              duration: 280
            });
            favorAnimation[index] = favorAnimation.export(),
            pointer.data.isFavoring = true;
              pointer.setData({
                favorAnimation: favorAnimation,
                // isFavoring: true
              })
            likeOrFavor(id, 'favor')
              .then(res => {
                console.log(res);
                pointer.data.isFavoring = false;
                pointer.setData({
                  // isFavoring: false,
                  [isFavor]: true,
                  [favorNum]: res.result.data.favorNum,
                  [favorArr]: res.result.data.favorArr
                })
              }).catch(err => {
                console.log(err);
                wx.showToast({
                  icon: 'none',
                  title: '请求超时，请重试...',
                })
              })
          }
        }

        if (pointer.data[arr][index].isFavor === true) {
          if (pointer.data.isFavoring === false) {
            pointer.data.isFavoring = true;
            // pointer.setData({
            //   isFavoring: true
            // })
            likeOrFavor(id, 'unfavor')
              .then(res => {
                pointer.data.isFavoring = false;
                pointer.setData({
                  // isFavoring: false,
                  [isFavor]: false,
                  [favorNum]: res.result.data.favorNum,
                  [favorArr]: res.result.data.favorArr
                })
              })
              .catch(err => {
                console.log(err);
                wx.showToast({
                  icon: 'none',
                  title: '请求超时，请重试...',
                })
              });
          }
        }
      }
    } else {
      this.toLogin();
    }
  },


  /**
   * 检测数组中的状态值
   * @param 传入要判断的数组 arr 
   * @param 判断是否是主页的调用 isIndex 
   * @param 传入主页加载更多数据时拼接数组,仅在isIndex为true的时候设置该值 dataArr 
   * @param 判断用户的openid是否存在数组中 openid
   */
  checkArrStatus(arr, isIndex, dataArr, openid) {
    // console.log("进入判断状态函数");
    arr.forEach((ele, i) => {
      // console.log(ele);
      if (ele.likeArr && ele.likeArr.includes(openid)) {
        ele.isLike = true
      } else {
        ele.isLike = false;
      }
      if (ele.favorArr && ele.favorArr.includes(openid)) {
        ele.isFavor = true
      } else {
        ele.isFavor = false;
      }
      //主页要进行滑动判断
      if (isIndex) {
        if (dataArr) {
          console.log(dataArr);
          dataArr.unshift(ele);
        }
        ele.isMove = true;
        //让数组中的最后一个值变为可移动状态
        if (i == arr.length - 1) {
          ele.isMove = false;
        }
      }
    })
  }

})