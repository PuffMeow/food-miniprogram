const util = require('../../util/util');
import util from '../../util/util'
import {
  msgCheck
} from '../../db/db'


let pages,
  prevPage;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    images: [],
    cloudImg: [],
    foodNameCount: 0,
    foodName: '',
    addrCount: 0,
    addrName: '',
    desc: '',
    pubBtn: true,
    checkListLength: 0,
    flag: 0, //判断上传的标志
    //canvas
    cWidth: '',
    cHeight: '',
    //判断敏感词flag
    checkFoodName: '',
    checkAddr: '',
    checkDesc: '',
    //进度条
    percent: 0,
    activeColor: '#FF8D00',
    progressHidden: true,
    activeMode: 'forwards',
    //是否修改信息状态
    isEdit: false,
    index: '',
    id: '',
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openid = wx.getStorageSync('openid');
    this.data.openid = openid;

    pages = getCurrentPages();
    prevPage = pages[pages.length - 2];

    console.log(options);
    if (Object.keys(options).length !== 0) {
      wx.showLoading({
        mask: true,
        title: '加载中...',
      })
      this.data.index = options.index;
      this.data.id = options.id;
      const db = wx.cloud.database();
      db.collection('Published')
        .where({
          _id: options.id
        })
        .get()
        .then(res => {
          console.log(res);
          this.data.imgsLeng = res.data[0].images.length;
          let addrCount = res.data[0].addrName.length;
          let foodNameCount = res.data[0].foodName.length;
          this.setData({
            foodName: res.data[0].foodName,
            addrName: res.data[0].addrName,
            foodNameCount: foodNameCount,
            addrCount: addrCount,
            desc: res.data[0].desc,
            images: res.data[0].images,
            isEdit: true,
            pubBtn: false,
          })
          this.checkMsg1();
          this.checkMsg2();
          this.checkMsg3();
          wx.hideLoading();
        })
        .catch(err => {
          console.log(err);
          wx.showToast({
            title: '请求超时，请重试...',
          })
        })
    }
  },

  foodNameCount(e) {
    // console.log(e)
    this.setData({
      foodNameCount: e.detail.value.trim().length,
      foodName: e.detail.value
    })
    this.pubBtn();
  },

  addrCount(e) {
    this.setData({
      addrCount: e.detail.value.trim().length,
      addrName: e.detail.value
    })
    this.pubBtn();
  },

  userDesc(e) {
    console.log(e);
    this.setData({
      desc: e.detail.value
    })
    this.pubBtn();
  },

  /**
   * 选择图片上传并检测图片
   */
  chooseImage() {
    wx.chooseImage({
      count: 6 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let isGif;
        res.tempFilePaths.forEach((ele, i) => {
          if (ele.endsWith('.gif')) {
            isGif = true;
            wx.showToast({
              icon: 'none',
              title: '不支持上传gif图',
            })
            return;
          }
        })
        if (isGif) {
          return;
        } else {
          console.log(res);
          this.setData({
            progressHidden: false,
          })
          this.check(res.tempFilePaths);
        }
      }
    })
  },

  check(tempFilePaths) {
    console.log('进入检测图片')
    let checkList = tempFilePaths;
    let i = 0; //递归计数
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
              console.log('返回结果', res)
              if (res.result.errCode == 87014) {
                wx.showToast({
                  title: '无法上传违法违规图片',
                  icon: 'none'
                })
                this.data.checkListLength -= 1;
                this.setData({
                  // checkListLength: this.data.checkListLength - 1,
                  percent: 0,
                  progressHidden: true
                })
                setTimeout(() => {
                  wx.hideLoading();
                  this.pubBtn();
                }, 1200)
                return;
              } else if (res.result.errCode == 0) {
                this.data.images.push(origin);
                this.data.flag += 1;
                this.data.checkListLength = checkList.length;
                this.setData({
                  images: this.data.images,
                  // flag: this.data.flag + 1,
                  // checkListLength: checkList.length,
                })
                if (this.data.flag == this.data.checkListLength) {
                  this.data.flag = 0;
                  this.setData({
                    // flag: 0,
                    percent: 100
                  })
                  this.pubBtn();

                  setTimeout(() => {
                    this.setData({
                      progressHidden: true,
                      percent: 0
                    })
                  }, 1500)
                  wx.hideLoading();
                } else {
                  let percent = this.data.percent;
                  this.setData({
                    percent: percent += Math.ceil(100 / this.data.checkListLength)
                  })
                  wx.hideLoading();
                }
              }
            })
            .catch(err => {
              console.log(err);
              wx.hideLoading();
              wx.showToast({
                icon: 'none',
                title: '请求超时,请重试',
              })
            })
        }
      });
    };

    //照片压缩
    let compress = (checkList, i) => {
      console.log('压缩图片')
      let path = checkList[i];
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
                  if (++i < checkList.length) {
                    compress(checkList, i);
                  };

                }
              })
            };
          });
      };

      wx.getImageInfo({
        src: path,
        success: res => {
          console.log('获取到图片信息', res);
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
            wx.hideLoading();
            wx.showToast({
              icon: 'none',
              title: '过大的图片无法上传',
            })
            this.setData({
              progressHidden: true
            })
          }
        }
      })
    };
    compress(checkList, i);
  },

  previewImg(e) {
    let idx = e.currentTarget.dataset.idx;
    let imgs = this.data.images;
    wx.previewImage({
      current: imgs[idx],
      urls: imgs,
    })
  },

  /**
   * 移除图片
   */
  removeImg(e) {
    // console.log(e)
    let idx = e.currentTarget.dataset.idx;
    this.data.cloudImg.splice(idx, 1);
    this.data.images.splice(idx, 1);
    this.setData({
      images: this.data.images
    })
    this.pubBtn();
  },

  //能否点击分享按钮
  pubBtn() {
    if (this.data.foodNameCount != 0 && this.data.addrCount != 0 && this.data.desc.trim() != 0 && this.data.images.length > 0) {
      // console.log("true")
      this.setData({
        pubBtn: false
      })
    } else {
      // console.log("false")
      this.setData({
        pubBtn: true
      })
    }
  },

  //检测三项的文本是否有敏感词
  async checkMsg1(e) {
    console.log('检测第1项文本')
    this.data.checkFoodName = await msgCheck(this.data.foodName, '第一项内容中含有敏感词');
  },

  async checkMsg2(e) {
    console.log('检测第2项文本')
    this.data.checkAddr = await msgCheck(this.data.addrName, '第二项内容中含有敏感词');
  },

  async checkMsg3(e) {
    console.log('检测第3项文本')
    this.data.checkDesc = await msgCheck(this.data.desc, '第三项内容中含有敏感词');
  },

  /**
   * 点击分享后开始上传图片
   */
  uploadImg(imgPath) {
    return new Promise((resolve, reject) => {
      if (String(imgPath).startsWith('cloud')) {
        this.data.cloudImg.push(imgPath);
        resolve();
      } else {
        console.log('开始上传图片')
        wx.cloud.uploadFile({
            cloudPath: 'indexImgs/' + new Date().getTime() + '.png',
            filePath: imgPath
          })
          .then(res => {
            this.data.cloudImg.push(res.fileID);
            if (this.data.cloudImg.length === this.data.images.length) {
              this.setData({
                percent: 100
              })
              setTimeout(() => {
                this.setData({
                  progressHidden: true,
                })
              }, 1500)
            } else {
              this.setData({
                activeMode: 'forwards',
                percent: this.data.percent += Math.ceil(100 / this.data.images.length)
              })
            }
            resolve(res);
          })
          .catch(err => {
            reject(err);
          })

      }
    })
  },


  /**
   * 点击分享按钮
   */
  publishFood(e) {
    //修改信息
    if (this.data.progressHidden === false) {
      return;
    }
    util.debounce(this.publish(), 500);
  },

  async publish() {
    if (this.data.isEdit === true) {
      wx.showLoading({
        title: '努力修改中...',
        mask: true
      })

      if (this.data.images.length <= this.data.imgsLeng) {
        this.setData({
          progressHidden: true
        })
      } else {
        this.setData({
          activeMode: 'backwards',
          progressHidden: false
        })
      }

      console.log('修改信息');
      if (this.data.checkFoodName && this.data.checkAddr && this.data.checkDesc) {
        await this.data.images.reduce(async (prev, ele, i) => {
          console.log('调用上传图片', i, ele)
          await prev;
          return this.uploadImg(ele);
        }, Promise.resolve())

        wx.cloud.callFunction({
          name: 'addShareFood',
          data: {
            option: 'edit',
            id: this.data.id,
            images: this.data.cloudImg,
            foodName: this.data.foodName,
            addrName: this.data.addrName,
            desc: this.data.desc,
          }
        }).then(res => {
          console.log(res);
          console.log(prevPage);
          let prevFoodName = "foodData[" + this.data.index + "].foodName";
          let prevAddrName = "foodData[" + this.data.index + "].addrName";
          let prevDesc = "foodData[" + this.data.index + "].desc";
          let prevImgs = "foodData[" + this.data.index + "].images";
          prevPage.setData({
            [prevFoodName]: res.result.data[0].foodName,
            [prevAddrName]: res.result.data[0].addrName,
            [prevDesc]: res.result.data[0].desc,
            [prevImgs]: res.result.data[0].images,
          })
          wx.hideLoading();

          setTimeout(() => {
            wx.navigateBack({
              complete: (res) => {
                wx.showToast({
                  mask: true,
                  title: '修改成功',
                })
              },
            })
          }, 1200)
        }).catch(err => {
          console.log(err);
          wx.hideLoading();
          wx.showToast({
            icon: 'none',
            title: '请求超时，请重试...',
          })
        })
      }
    } else {
      wx.showLoading({
        title: '努力上传中...',
        mask: true
      })
      this.setData({
        activeMode: 'backwards',
        progressHidden: false
      })
      console.log('发布')
      setTimeout(async () => {
        if (this.data.checkFoodName === true && this.data.checkAddr === true && this.data.checkDesc === true) {
          console.log('进入上传图片函数')
          await this.data.images.reduce(async (prev, ele, i) => {
            console.log('调用上传图片', i, ele)
            await prev;
            return this.uploadImg(ele);
          }, Promise.resolve())

          wx.cloud.callFunction({
            name: 'addShareFood',
            data: {
              option: 'shareFood',
              openid: this.data.openid,
              images: this.data.cloudImg,
              foodName: this.data.foodName,
              addrName: this.data.addrName,
              desc: this.data.desc,
              commentNum: 0,
              favorNum: 0,
              likeNum: 0,
              pubTime: util.getTime(),
              likeArr: [],
              favorArr: [],
              commentArr: []
            }
          }).then(res => {
            console.log(res);
            setTimeout(() => {
              wx.switchTab({
                url: '../index/index',
                complete: () => {
                  let page = getCurrentPages().pop();
                  if (page == undefined || page == null) {
                    return;
                  }
                  wx.hideLoading();
                  wx.showToast({
                    title: '分享成功',
                    mask: true,
                    duration: 1000
                  })
                  setTimeout(() => {
                    page.onLoad();
                  }, 1000)
                },
                fail: () => {
                  wx.hideLoading();
                  wx.showToast({
                    icon: 'none',
                    title: '请求超时，请重试...',
                  })
                }
              })
            }, 1200)
          }).catch(err => {
            console.log(err);
            wx.showToast({
              icon: 'none',
              title: '请求超时，请重试...',
            })
          })
        }
      }, 500)
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