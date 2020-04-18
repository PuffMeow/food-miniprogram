import util from '../../util/util'

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
    flag:0, //判断上传的标志
    //canvas
    cWidth: '',
    cHeight: '',
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openid = wx.getStorageSync('openid');
    this.data.openid = openid;
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
    this.setData({
      desc: e.detail.value
    })
    this.pubBtn();
  },

  chooseImage() {
    wx.chooseImage({
      count: 6 - this.data.images.length,
      sizeType: ['original','compressed'],
      sourceType:['album','camera'],
      success: res => {
        wx.showLoading({
          title: '正在上传中...',
          mask: true
        })
        this.check(res.tempFilePaths);
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
              this.setData({
                checkListLength: this.data.checkListLength - 1
              })
              setTimeout(()=>{this.pubBtn();},1500)
              return;
            } else if (res.result.errCode == 0) {
              this.data.images.push(origin);
              this.setData({
                images: this.data.images,
                flag:this.data.flag+1,
                checkListLength: checkList.length
              })
              if (this.data.flag == this.data.checkListLength) {
                wx.hideLoading({
                  complete: (res) => {
                    wx.showToast({
                      title: '上传成功',
                    })
                    this.setData({
                      flag:0
                    })
                    this.pubBtn();
                  },
                })
              }
            }
          })
        }
      });
    };

  //照片压缩
    let compress = (checkList, i) => {
      console.log('压缩图片')
      let path = checkList[i]; 
      console.log(path);
      let render = (path, width, height) => {
        console.log(width, height);
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
            console.log(img.src)
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
                  console.log('开始调用云函数', res)
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
          console.log('获取到图片信息开始计算', res)
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
                  title: '图片太大啦',
                })
              },
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

  msgCheck(myContent, toast) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
          name: 'msgCheck',
          data: {
            content: myContent,
          }
        })
        .then(res => {
          // console.log(res);
          if (res.result.errCode == 87014) {
            wx.showToast({
              title: toast,
              duration: 3000,
              icon: "none"
            })
            resolve(false);
          }
          if (res.result.errCode == 0) {
            resolve(true);
          }
        })
    })
  },

  //上传图片
  uploadImg(imgPath) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + '.png',
          filePath: imgPath
        })
        .then(res => {
          this.data.cloudImg.push(res.fileID);
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    })
  },

  //发布
  async publishFood(e) {
    wx.showLoading({
      title: '正在分享中...',
      mask: true
    })
    let checkFoodName = await this.msgCheck(this.data.foodName, '第一项内容中含有敏感词');
    let checkAddr = await this.msgCheck(this.data.addrName, '第二项内容中含有敏感词')
    let checkDesc = await this.msgCheck(this.data.desc, '第三项内容中含有敏感词')
    if (checkFoodName && checkAddr && checkDesc) {

      await this.data.images.reduce(async (prev, ele, i) => {
        console.log('调用上传图片', i, ele)
        await prev;
        return this.uploadImg(ele);
      }, Promise.resolve())

      wx.cloud.callFunction({
        name: 'addShareFood',
        data: {
          openid: this.data.openid,
          images: this.data.cloudImg,
          foodName: this.data.foodName,
          addrName: this.data.addrName,
          desc: this.data.desc,
          commentNum: 0,
          favorNum: 0,
          likeNum: 0,
          pubTime: util.getTime(),
          likeArr:[],
          favorArr:[],
          commentArr:[]
        }
      }).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })

      wx.switchTab({
        url: '../index/index',
        complete: () => {
          let page = getCurrentPages().pop();
          if (page == undefined || page == null) {
            return;
          }
          wx.showToast({
            title: '分享成功',
            mask:true,
            duration: 2000
          })
          setTimeout(() => {
            page.onLoad();
          }, 2000)
        },
        fail: () => {
          wx.showToast({
            icon: 'none',
            title: '好像出了点差错...',
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