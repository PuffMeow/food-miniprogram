// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.option == 'like') {
    return await db.collection('Published').doc(event.id).update({
        data: {
          likeArr: _.push(event.openid)
        }
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      })
  }

  if (event.option == 'unlike') {
    return await db.collection('Published').doc(event.id).update({
        data: {
          likeArr: _.pull(event.openid)
        }
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      })
  }

  if (event.option == 'favor') {
    return await db.collection('Published').doc(event.id).update({
        data: {
          favorArr: _.push(event.openid)
        }
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      })
  }
}