const db = wx.cloud.database();
const $ = db.command.aggregate

let openid = wx.getStorageSync('openid');
if (openid === '') {
  getOpenid()
    .then(res => {
      openid = res.result.openid
    })
}

/**
 * 获取用户的openid
 */
function getOpenid() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenid',
    }).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    })
  })
}

/**
 * 获取主页的数据
 */
function getData(limit, skip, sort) {
  console.log('调用获取数据函数')
  return new Promise((resolve, reject) => {
    db.collection('Published')
      .orderBy('pubTime', sort)
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
}

/**
 *获取历史分享页的数据
 */
function getMyData() {
  return new Promise(async (resolve, reject) => {
    try {
      let countRes = await db.collection('Published')
        .where({
          openid: openid
        })
        .count();
      if (countRes.total == 0) {
        resolve(countRes);
        return;
      }
      let limit = 20;
      let total = countRes.total;
      let batchTimes = Math.ceil(total / limit);
      let tasks = [];
      for (let i = 0; i < batchTimes; i++) {
        let promise = await db.collection('Published')
          .where({
            openid: openid
          }).skip(i * limit).limit(limit).get();
        tasks.push(promise);
      }
      let data = (await Promise.all(tasks)).reduce((prev, cur) => {
        return prev.data.concat(cur.data);
      })
      resolve(data);
    } catch (err) {
      reject(err);
    }
  })
}


/**
 * 获取收藏页的数据
 */
function getFavorData() {
  return new Promise(async (resolve, reject) => {
    try {
      let countRes = await db.collection('Published')
        .where({
          favorArr: openid
        })
        .count();
      if (countRes.total == 0) {
        resolve(countRes);
        return;
      }
      let limit = 20;
      let total = countRes.total;
      let batchTimes = Math.ceil(total / limit);
      let tasks = [];
      for (let i = 0; i < batchTimes; i++) {
        let promise = await db.collection('Published')
          .where({
            favorArr: openid
          }).skip(i * limit).limit(limit).get();
        tasks.push(promise);
      }
      let data = (await Promise.all(tasks)).reduce((prev, cur) => {
        return prev.data.concat(cur.data);
      })
      resolve(data);
    } catch (err) {
      reject(err);
    }
  })
}


/**
 * 点赞或收藏云函数请求
 */
function likeOrFavor(id, option) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'likeOrfavor',
      data: {
        option: option,
        id: id,
        openid: openid
      }
    }).then(res => {
      console.log(res);
      resolve(res);
    }).catch(err => {
      console.log(err)
      reject(err);
    })
  })
}


/**
 * 敏感词汇检测
 */
function msgCheck(myContent, toast) {
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
            duration: 1500,
            icon: 'none'
          })
          resolve(false);
        }
        if (res.result.errCode == 0) {
          resolve(true);
        }
      })
      .catch(err => {
        reject(err);
      })
  })
}

/**
 * 获取校内食堂所有食物的数据
 */
function getSchoolFood() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
        name: 'getSchoolFood'
      })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      })
  })
}

/**
 * 关于学校页面的图片请求
 */
function getSchoolImgs() {
  return new Promise(async (resolve, reject) => {
    try {
      let countRes = await db.collection('SchoolImgs').count();
      console.log(countRes);
      let limit = 20;
      let total = countRes.total;
      let batchTimes = Math.ceil(total / limit);
      let tasks = [];
      for (let i = 0; i < batchTimes; i++) {
        let promise = await db.collection('SchoolImgs').skip(i * limit).limit(limit).get();
        tasks.push(promise);
      }
      let data = (await Promise.all(tasks)).reduce((prev, cur) => {
        return prev.data.concat(cur.data);
      })
      resolve(data);
    } catch (err) {
      reject(err);
    }
  })
}


function getHotData() {
  return new Promise((resolve, reject) => {
    db.collection('Published')
      .orderBy('statusTotal', 'desc')
      .limit(3)
      .get()
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      })
  })
}

export {
  getOpenid,
  getData,
  getMyData,
  getFavorData,
  likeOrFavor,
  msgCheck,
  getSchoolFood,
  getSchoolImgs,
  getHotData,
}