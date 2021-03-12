let openid;
import {msgCheck} from '../../db/db'
const app = getApp();

let pages,
  prevPage;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //轮播图相关
    currentSwiper: 0,
    interval: 5000,
    indicatorDots: false,
    duration: 800,
    circular: true,
    //查看更多
    showMore: false,
    //弹幕
    isInput: false,
    inputFlag: true,
    inputContent: '',
    dmCount: 0,
    dmData: [],
    //页面数据相关
    index: 0,
    pageData: [],
    avatar: '',
    nickName: '',
    gender: 0,
    isLiking: false,
    isFavoring: false,
    favorAnimation: [],
    likeAnimation: [],
  },

  //轮播图
  swiperChange(e) {
    let current = e.detail.current;
    this.setData({
      currentSwiper: current
    })
  },

  //查看更多
  seeMore(e) {
    if (this.data.showMore) {
      this.setData({
        showMore: false
      })
    }
  },

  //图片预览
  preview(e) {
    console.log(e);
    let index = e.currentTarget.dataset.idx;
    wx.previewImage({
      current: this.data.pageData.images[index],
      urls: this.data.pageData.images,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openid = wx.getStorageSync('openid');
    //获取上个页面数据
    pages = getCurrentPages();
    prevPage = pages[pages.length - 2];
    if (JSON.parse(options.index) !== -1) {
      this.setData({
        index: JSON.parse(options.index)
      })
    } else {
      this.setData({
        index: null
      })
    }
    this.data._id = options._id;
    wx.showLoading({
      title: '正在加载中...',
      mask: true,
    })

    const db = wx.cloud.database();
    db.collection('Published')
      .where({
        _id: options._id
      })
      .get()
      .then(res => {
        console.log(res);
        //检查自己的点赞收藏状态
        app.checkArrStatus(res.data, false, null, openid);
        this.data.pageData = res.data[0];
        //获取发表人的信息
        db.collection('UserInfo')
          .where({
            openid: res.data[0].openid
          })
          .get()
          .then(res => {
            console.log(res);

            this.setData({
              avatar: res.data[0].avatar,
              nickName: res.data[0].nickName,
              gender: res.data[0].gender,
              pageData: this.data.pageData,
            })
          }).then(res => {
            //查看更多
            let query = wx.createSelectorQuery();
            query.select('.content').boundingClientRect(res => {
              let height = res.height;
              console.log(height)
              if (height > 128) {
                this.setData({
                  showMore: true
                })
              } else {
                this.setData({
                  showMore: false
                })
              }
            }).exec()

            wx.cloud.callFunction({
                name: 'comment',
                data: {
                  option: 'getComment',
                  id: this.data._id
                }
              })
              .then(res => {
                console.log(res);
                if (res.result.data.commentArr.length !== 0) {
                  console.log('执行');
                  let newCommentArr = res.result.data.commentArr;
                  newCommentArr.forEach((ele, i) => {
                    ele.top = this.getTop();
                  })
                  this.setData({
                    dmData: newCommentArr
                  })
                }
              })
              .catch(err => {
                console.log(err);
                wx.hideLoading();
                wx.showToast({
                  icon: 'none',
                  title: '获取弹幕数据失败',
                })
              })

            wx.hideLoading({})
          })
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '请求超时,请重试...',
        })
      })
  },

  //点赞按钮
  likeBtn(e) {
    //上个页面的数据
    console.log(e);
    let index = this.data.index;
    let prevLikeNum, prevIsLike;

    if (this.data.pageData.isLike === false) {
      if (this.data.isLiking === false) {
        let likeAnimation = wx.createAnimation({
          duration: 1200
        })
        likeAnimation.scale(0.1).step({
          duration: 320
        });
        likeAnimation.scale(1.0).step({
          duration: 280
        });
        this.data.isLiking = true;
        this.setData({
          likeAnimation: likeAnimation.export(),
          // isLiking: true
        })
        this.likeOrFavor(this.data._id, 'like')
          .then(res => {
            // console.log(res);
            this.data.isLiking = false;
            this.setData({
              // isLiking: false,
              'pageData.likeNum': res.result.data.likeNum,
              'pageData.isLike': true
            })

            if (index !== null) {
              prevLikeNum = "foodData[" + index + "].likeNum";
              prevIsLike = "foodData[" + index + "].isLike";
              prevPage.setData({
                [prevLikeNum]: res.result.data.likeNum,
                [prevIsLike]: true
              })
            }
          })
          .catch(err => {
            wx.showToast({
              icon: 'none',
              title: '请求超时,请重试...',
            })
          })
      }
    }

    if (this.data.pageData.isLike === true) {
      if (this.data.isLiking === false) {
        this.data.isLiking = true;
        // this.setData({
        //   isLiking: true
        // })
        this.likeOrFavor(this.data._id, 'unlike')
          .then(res => {
            // console.log(res);
            this.data.isLiking = false;
            this.setData({
              // isLiking: false,
              'pageData.likeNum': res.result.data.likeNum,
              'pageData.isLike': false
            })


            if (index !== null) {
              prevLikeNum = "foodData[" + index + "].likeNum";
              prevIsLike = "foodData[" + index + "].isLike";
              prevPage.setData({
                [prevLikeNum]: res.result.data.likeNum,
                [prevIsLike]: false
              })
            }
          })
          .catch(err => {
            console.log(err);
            wx.showToast({
              icon: 'none',
              title: '请求超时,请重试...',
            })
          })
      }
    }
  },

  //收藏按钮
  favorBtn() {
    //上个页面的数据
    let index = this.data.index;
    let prevFavorNum, prevIsFavor
    if (this.data.pageData.isFavor === false) {
      if (this.data.isFavoring === false) {
        let favorAnimation = wx.createAnimation({
          duration: 1200
        })
        favorAnimation.scale(0.1).step({
          duration: 320
        });
        favorAnimation.scale(1.0).step({
          duration: 280
        });
        this.data.isFavoring = true;
        this.setData({
          favorAnimation: favorAnimation.export(),
          // isFavoring: true
        })
        this.likeOrFavor(this.data._id, 'favor')
          .then(res => {
            this.data.isFavoring = false;
            this.setData({
              // isFavoring: false,
              'pageData.favorNum': res.result.data.favorNum,
              'pageData.isFavor': true
            })

            if (index !== null) {
              prevFavorNum = "foodData[" + index + "].favorNum";
              prevIsFavor = "foodData[" + index + "].isFavor";
              prevPage.setData({
                [prevFavorNum]: res.result.data.favorNum,
                [prevIsFavor]: true
              })
            }
          })
          .catch(err => {
            wx.showToast({
              icon: 'none',
              title: '请求超时,请重试...',
            })
          })
      }
    }

    if (this.data.pageData.isFavor === true) {
      if (this.data.isFavoring === false) {
        this.data.isFavoring = true;
        // this.setData({
        //   isFavoring: true,
        // })
        this.likeOrFavor(this.data._id, 'unfavor')
          .then(res => {
            this.data.isFavoring = false;
            this.setData({
              // isFavoring: false,
              'pageData.favorNum': res.result.data.favorNum,
              'pageData.isFavor': false
            })

            if (index !== null) {
              prevFavorNum = "foodData[" + index + "].favorNum";
              prevIsFavor = "foodData[" + index + "].isFavor";
              prevPage.setData({
                [prevFavorNum]: res.result.data.favorNum,
                [prevIsFavor]: false
              })
            }
          })
          .catch(err => {
            wx.showToast({
              icon: 'none',
              title: '请求超时,请重试...',
            })
          })
      }
    }
  },


  //点赞或收藏云函数请求
  likeOrFavor(id, option) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'likeOrfavor',
        data: {
          option: option,
          id: id,
          openid: openid
        }
      }).then(res => {
        console.log(res)
        resolve(res);
      }).catch(err => {
        console.log(err)
        reject(err);
      })
    })
  },

  comment() {
    if (this.data.inputFlag) {
      this.setData({
        isInput: true
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '休息几秒再评论吧~',
      })
    }
  },

  //弹幕输入
  dmInput(e) {
    // console.log(e);
    this.setData({
      inputContent: e.detail.value,
      dmCount: e.detail.value.length
    })
  },

  //离开输入框
  inputBlur() {
    this.setData({
      isInput: false
    })
  },

  //完成弹幕输入
  async endInput() {
    if (this.data.inputContent.trim() === '' || this.data.dmCount === 0) {
      wx.showToast({
        icon: 'none',
        title: '输入内容不能为空',
      })
      return;
    }
    wx.showLoading({
      title: '发送弹幕中...',
      mask: true
    })
    let msgRes = await msgCheck(this.data.inputContent, '含有敏感词汇');
    if (msgRes === false) {
      wx.hideLoading();
      return;
    } else {
      let index = this.data.index;
      wx.cloud.callFunction({
        name: 'comment',
        data: {
          option: 'addComment',
          id: this.data._id,
          avatar: wx.getStorageSync('avatar'),
          gender: wx.getStorageSync('gender'),
          openid: openid,
          content: this.data.inputContent
        }
      }).then(res => {
        console.log(res);
        let newCommentArr = res.result.data.commentArr;
        newCommentArr.forEach((ele, i) => {
          ele.top = this.getTop();
        })
        this.setData({
          dmData: [],
          'pageData.commentNum': res.result.data.commentNum,
          isInput: false
        })
        if (this.data.index !== null) {
          let prevCommentNum = "foodData[" + index + "].commentNum";
          prevPage.setData({
            [prevCommentNum]: res.result.data.commentNum
          })
        }
        setTimeout(() => {
          wx.hideLoading();
          wx.showToast({
            title: '发送成功',
          })
          this.setData({
            dmData: newCommentArr,
            inputContent: '',
            dmCount: 0,
            inputFlag: false,
          })
        }, 50);
        setTimeout(() => {
          this.setData({
            inputFlag: true
          })
        }, 8000);
      }).catch(err => {
        console.log(err);
      })
    }
  },


  //弹幕动画结束一次循环
  animationend(e) {
    if (e.currentTarget.dataset.index === this.data.dmData.length - 1) {
      // console.log(e, '触发')
      this.setData({
        tempArr: this.data.dmData,
        dmData: []
      })
      setTimeout(() => {
        this.setData({
          dmData: this.data.tempArr
        })
      }, 10);
    }
  },

  getTop() {
    return Math.random() * 90;
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
    console.log(prevPage);
    if (prevPage.route === "pages/favorite/favorite") {
      return;
    }
    const db = wx.cloud.database();
    db.collection('Published').where({
        _id: this.data._id
      }).field({
        likeNum: true,
        favorNum: true,
        commentNum: true,
        foodName: true,
        images: true,
        desc: true,
      })
      .get()
      .then(res => {
        console.log(res);
        if (this.data.index === null) {
          return;
        }
        let index = this.data.index;
        let prevFavorNum = "foodData[" + index + "].favorNum";
        let prevLikeNum = "foodData[" + index + "].likeNum";
        let prevCommentNum = "foodData[" + index + "].commentNum";
        let prevFoodName = "foodData[" + index + "].foodName";
        let prevImages = "foodData[" + index + "].images";
        let prevDesc = "foodData[" + index + "].desc";
        prevPage.setData({
          [prevFavorNum]: res.data[0].favorNum,
          [prevLikeNum]: res.data[0].likeNum,
          [prevCommentNum]: res.data[0].commentNum,
          [prevFoodName]: res.data[0].foodName,
          [prevImages]: res.data[0].images,
          [prevDesc]: res.data[0].desc
        })
      })
      .catch(err => {
        console.log(err);
      })
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