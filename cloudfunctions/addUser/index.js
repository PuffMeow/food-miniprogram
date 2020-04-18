// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;


// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('UserInfo').add({
    data:{
      userid:event.userid,
      openid:event.userInfo.openId,
      nickName:event.nickName,
      avatar:event.avatar,
      gender:event.gender,
    }
  })
}