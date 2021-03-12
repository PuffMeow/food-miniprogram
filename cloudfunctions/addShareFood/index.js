// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.option === 'shareFood') {
    return await db.collection('Published').add({
      data: {
        openid: event.openid,
        images: event.images,
        foodName: event.foodName,
        addrName: event.addrName,
        desc: event.desc,
        commentNum: event.commentNum,
        favorNum: event.favorNum,
        likeNum: event.likeNum,
        pubTime: event.pubTime,
        likeArr: event.likeArr,
        favorArr: event.favorArr,
        commentArr: event.commentArr,
        statusTotal: 0
      }
    })
  }
  if (event.option === 'edit') {
    await db.collection('Published').where({
      _id: event.id
    }).update({
      data: {
        foodName: event.foodName,
        addrName: event.addrName,
        desc: event.desc,
        images: event.images,
      }
    })

    try {
      return await db.collection('Published').where({
        _id: event.id
      }).get()
    } catch (err) {
      return err;
    }
  }
  if (event.option === 'schoolFood') {
    return await db.collection('SchoolFood').add({
      data: {
        openid: event.openid,
        avatar: event.avatar,
        nickName: event.nickName,
        gender: event.gender,
        foodName: event.foodName,
        desc: event.desc,
        dininghall: event.dininghall,
        images: event.images,
        likeArr: event.likeArr,
        likeNum: 0,
      }
    })
  }
}