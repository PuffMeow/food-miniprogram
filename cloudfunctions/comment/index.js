// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.option === 'addComment') {
    await db.collection('Published').doc(event.id).update({
      data: {
        commentArr: _.unshift({
          avatar: event.avatar,
          gender: event.gender,
          content: event.content,
          openid: event.openid
        }),
        commentNum: _.inc(1),
        statusTotal: _.inc(1),
      }
    });
    const res = await db.collection('Published').doc(event.id).field({
        commentArr: true,
        commentNum: true
      })
      .get();
    return res;
  } else if (event.option === 'getComment') {
    return await db.collection('Published')
    .doc(event.id)
    .field({
        commentArr: true
      })
      .get()
  }
}