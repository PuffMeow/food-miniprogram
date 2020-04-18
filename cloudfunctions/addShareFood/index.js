// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('Published').add({
    data:{
      openid:event.openid,
      images:event.images,
      foodName:event.foodName,
      addrName:event.addrName,
      desc:event.desc,
      commentNum:event.commentNum,
      favorNum:event.favorNum,
      likeNum:event.likeNum,
      pubTime:event.pubTime,
      likeArr:event.likeArr,
      favorArr:event.favorArr,
      commentArr:event.commentArr
    }
  })
}