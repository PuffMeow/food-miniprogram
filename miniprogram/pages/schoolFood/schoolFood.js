const app = getApp();
const util = require('../../util/util');
let {
  msgCheck,
  getSchoolFood,
} = require('../../db/db');

let {
  getOpenid
} = require('../../db/db');
let userid;
let openid;

let pages,
  prevPage;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    clientHeight: 800,
    //数据相关
    zhongxin: [],
    yansheng: [],
    qianxihe: [],
    daxibei: [],
    honggaoliang: [],
    xingyeyuan: [],
    images: [], //暂存图片
    cloudImg: [], //存放上传云端后的图片路径
    //操作相关
    isPub: false,
    foodName: '',
    desc: '',
    foodNameCount: '0',
    descCount: '0',
    array: ["请选择", "中心食堂", "衍生食堂", "千喜鹤食堂", "大西北食堂", "红高粱食堂", "兴业苑食堂"],
    index: 0,
    selectedDininghall: '',
    animation: [],
    likeAnimation: [],
    isLiking: false,
    isLoaded: false,
  },

  swichNav(e) {
    console.log(e);
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },

  swiperChange(e) {
    console.log(e);
    this.setData({
      currentTab: e.detail.current,
    })
  },

  knowMore(e) {
    wx.navigateTo({
      url: '../aboutDininghall/aboutDininghall',
    })
  },

  pubBtn(e) {
    if (userid) {
      if (this.data.isPub === false) {
        let animation = wx.createAnimation({
          duration: 1200,
          timingFunction: 'ease-in-out',
        })
        animation.translateY(this.data.clientHeight * 1.25).step()
        this.data.isPub = true;
        this.setData({
          animation: animation.export(),
          // isPub: true
        })
      } else {
        let animation = wx.createAnimation({
          duration: 1500,
          timingFunction: 'ease-in-out',
        })
        animation.translateY(-this.data.clientHeight * 1.25).step()
        this.data.isPub = false;
        this.setData({
          animation: animation.export(),
          // isPub: false
        })
      }
    } else {
      app.toLogin();
    }
  },


  pickerChange(e) {
    console.log(e);
    let index = e.detail.value;
    this.data.selectedDininghall = this.data.array[index];
    this.setData({
      index: index,
      // selectedDininghall: this.data.array[index],
    })
  },


  foodName(e) {
    console.log(e);
    this.setData({
      foodNameCount: e.detail.value.length,
      foodName: e.detail.value
    })
  },

  desc(e) {
    console.log(e);
    this.setData({
      descCount: e.detail.value.length,
      desc: e.detail.value
    })
  },

  /**
   * 图片预览
   */
  previewImg(e) {
    console.log(e);
    let name = e.currentTarget.dataset.name;
    let index = e.currentTarget.dataset.idx;
    wx.previewImage({
      urls: this.data[name][index].images,
    })
  },


  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.showLoading({
          title: '加载预览图...',
          mask: true,
        })
        console.log(res);
        this.check(res.tempFilePaths);
      }
    })
  },

  check(tempFilePaths) {
    console.log('进入检测图片')
    //照片压缩
    let compress = (tempFilePaths) => {
      console.log('压缩图片')
      let path = tempFilePaths[0];
      // console.log(path);
      let render = (path, width, height) => {
        // console.log(width, height);
        wx.createSelectorQuery()
          .select('#compress')
          .fields({
            node: true,
          })
          .exec(res => {
            // console.log('返回节点信息', res)
            let canvas = res[0].node;
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            let img = canvas.createImage();
            // console.log('新建的img对象', img);
            img.src = path;
            // console.log(img.src)
            img.onload = () => {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              wx.canvasToTempFilePath({
                canvas,
                destWidth: width,
                destHeight: height,
                fileType: 'jpg',
                quality: 0.8,
                success: res => {
                  // console.log('开始调用云函数', res)
                  cloudCheck(res.tempFilePath, path);
                }
              })
            };
          });
      };

      let cloudCheck = (temp, origin) => {
        console.log('云函数调用')
        wx.getFileSystemManager().readFile({
          filePath: temp,
          success: res => {
            wx.cloud.callFunction({
                name: 'imgCheck',
                data: {
                  value: res.data
                },
              }).then(res => {
                // console.log('返回结果', res)
                if (res.result.errCode == 87014) {
                  wx.showToast({
                    title: '无法上传违法违规图片',
                    icon: 'none'
                  })
                  return;
                } else if (res.result.errCode == 0) {
                  this.data.images.splice(0, 1);
                  this.data.images.push(origin);
                  wx.hideLoading();
                  this.setData({
                    images: this.data.images,
                  })
                }
              })
              .catch(err => {
                wx.showToast({
                  icon: 'none',
                  title: '请求超时,请重试',
                })
              })
          }
        });
      };

      wx.getImageInfo({
        src: path,
        success: res => {
          // console.log('获取到图片信息', res)
          let aspectRatio = res.width / res.height;
          let width, height;
          // 照片比例不超过21: 9
          if (aspectRatio >= 0.42 && aspectRatio <= 2.35) {
            if (aspectRatio >= 1) {
              width = 256;
              height = Math.floor(width / aspectRatio);
            } else {
              height = 256;
              width = Math.floor(height * aspectRatio);
            }
            this.setData({
              cWidth: width,
              cHeight: height
            });
            render(path, width, height);
          } else {
            wx.hideLoading({
              complete: (res) => {
                wx.showToast({
                  icon: 'none',
                  title: '过大的图片无法上传',
                })
              },
            })
          }
        }
      })
    };
    compress(tempFilePaths);
  },

  /**
   * 发表
   */
  publish() {
    util.debounce(this.clickedPublish(), 500);
  },
  async clickedPublish(e) {
    wx.showLoading({
      title: '正在分享...',
      mask: true,
    })
    if (this.data.foodName === '') {
      wx.showToast({
        icon: 'none',
        title: '菜名不能为空',
      })
      return;
    } else {
      let foodNameCheck = await msgCheck(this.data.foodName, '菜名中含有敏感词');
      console.log(foodNameCheck);
      if (foodNameCheck === false) {
        return;
      }
    }
    if (this.data.desc === '') {
      wx.showToast({
        icon: 'none',
        title: '简评不能为空',
      })
      return;
    } else {
      let descCheck = await msgCheck(this.data.desc, '简评中含有敏感词');
      if (descCheck === false) {
        return;
      }
    }
    if (this.data.selectedDininghall === '') {
      wx.showToast({
        icon: 'none',
        title: '请先选择食堂',
      })
      return;
    }
    if (this.data.images.length === 0) {
      wx.showToast({
        icon: 'none',
        title: '请先上传图片',
      })
      return;
    }

    wx.cloud.uploadFile({
        cloudPath: 'schoolFoodImgs/' + new Date().getTime() + '.png',
        filePath: this.data.images[0]
      })
      .then(res => {
        this.data.cloudImg.push(res.fileID);
        wx.cloud.callFunction({
            name: 'addShareFood',
            data: {
              option: 'schoolFood',
              openid: wx.getStorageSync('openid'),
              avatar: wx.getStorageSync('avatar'),
              nickName: wx.getStorageSync('nickName'),
              gender: wx.getStorageSync('gender'),
              foodName: this.data.foodName,
              desc: this.data.desc,
              dininghall: this.data.selectedDininghall,
              images: this.data.cloudImg,
              likeNum: 0,
              likeArr: [],
            }
          })
          .then(res => {
            console.log(res);
            let animation = wx.createAnimation({
              duration: 1500,
              timingFunction: 'ease-in-out',
            })
            animation.translateY(-this.data.clientHeight * 1.25).step();
            wx.hideLoading();
            wx.showToast({
              title: '分享成功',
            })
            this.data.isPub = false;
            this.data.cloudImg = [];
            this.data.selectedDininghall = '';
            this.setData({
              animation: animation.export(),
              // isPub: false,
              foodName: '',
              desc: '',
              images: [],
              index: 0,
              // selectedDininghall: '',
              descCount: 0,
              foodNameCount: 0
            })
            this.onLoad();
          })
          .catch(err => {
            console.log(err);
            wx.showToast({
              icon: 'none',
              title: '请求超时,请重试',
            })
          })
      })
      .catch(err => {
        console.log(err);
        wx.showToast({
          icon: 'none',
          title: '请求超时，请重试'
        })
      })
  },


  likeBtn(e) {
    let dininghall = e.currentTarget.dataset.dininghall;
    app.likeMain(e, this, dininghall, true);
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    //发表之后清空原数组
    this.data.zhongxin = [];
    this.data.yansheng = [];
    this.data.qianxihe = [];
    this.data.daxibei = [];
    this.honggaoliang = [];
    this.data.xingyeyuan = [];
    wx.getSystemInfo({
      success: res => {
        console.log(res);
        this.setData({
          clientHeight: res.windowHeight - res.windowHeight / 9
        });
      }
    })
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    if (wx.getStorageSync('openid') === '' || wx.getStorageSync('openid') === null) {
      let openidRes = await getOpenid();
      openid = openidRes.result.openid;
    } else {
      openid = wx.getStorageSync('openid');
    }
    try {
      let res = await getSchoolFood();
      console.log(res);
      if (res.result === 0) {
        this.setData({
          zhongxin: [],
          yansheng: [],
          qianxihe: [],
          daxibei: [],
          honggaoliang: [],
          xingyeyuan: [],
          isLoaded: true,
        })
        wx.hideLoading();
        return;
      }
      res.result.data.reverse();
      res.result.data.forEach((ele, i) => {
        if (ele.likeArr && ele.likeArr.includes(openid)) {
          ele.isLike = true;
        } else {
          ele.isLike = false;
        }
        if (ele.dininghall === '中心食堂') {
          this.data.zhongxin.push(ele);
        }
        if (ele.dininghall === '衍生食堂') {
          this.data.yansheng.push(ele);
        }
        if (ele.dininghall === '千喜鹤食堂') {
          this.data.qianxihe.push(ele);
        }
        if (ele.dininghall === '大西北食堂') {
          this.data.daxibei.push(ele);
        }
        if (ele.dininghall === '红高粱食堂') {
          this.data.honggaoliang.push(ele);
        }
        if (ele.dininghall === '兴业苑食堂') {
          this.data.xingyeyuan.push(ele);
        }
      })

      this.data.zhongxin.forEach((ele, i) => {
        this.setData({
          [`zhongxin[${i}]`]: this.data.zhongxin[i],
        })
      })
      this.data.yansheng.forEach((ele, i) => {
        this.setData({
          [`yansheng[${i}]`]: this.data.yansheng[i],
        })
      })
      this.data.qianxihe.forEach((ele, i) => {
        this.setData({
          [`qianxihe[${i}]`]: this.data.qianxihe[i],
        })
      })
      this.data.daxibei.forEach((ele, i) => {
        this.setData({
          [`daxibei[${i}]`]: this.data.daxibei[i],
        })
      })
      this.data.honggaoliang.forEach((ele, i) => {
        this.setData({
          [`honggaoliang[${i}]`]: this.data.honggaoliang[i],
        })
      })
      this.data.xingyeyuan.forEach((ele, i) => {
        this.setData({
          [`xingyeyuan[${i}]`]: this.data.xingyeyuan[i],
        })
      })
      this.setData({
        isLoaded: true
      })
      wx.hideLoading();
    } catch (err) {
      console.log(err);
      wx.showToast({
        icon: 'none',
        title: '请求超时,请重试',
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
  onShow: async function () {
    userid = wx.getStorageSync('userid');
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
    pages = getCurrentPages();
    prevPage = pages[pages.length - 2];
    console.log(prevPage)
    if (prevPage.route === "pages/schoolShare/schoolShare") {
      prevPage.onLoad()
    }
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