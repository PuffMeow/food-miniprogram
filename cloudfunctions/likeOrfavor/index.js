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
    await db.collection('Published').doc(event.id).update({
      data: {
        likeArr: _.push(event.openid),
        likeNum: _.inc(1),
        statusTotal: _.inc(1),
      }
    })
    const res = await db.collection('Published').doc(event.id).field({
      likeNum: true,
      likeArr: true
    }).get();
    return res;
  }


  if (event.option == 'schoolFoodLike') {
    await db.collection('SchoolFood').doc(event.id).update({
      data: {
        likeArr: _.push(event.openid),
        likeNum: _.inc(1)
      }
    })
    const res = await db.collection('SchoolFood').doc(event.id).field({
      likeNum: true,
      likeArr: true
    }).get();
    return res;
  }


  if (event.option == 'unlike') {
    await db.collection('Published').doc(event.id).update({
      data: {
        likeArr: _.pull(event.openid),
        likeNum: _.inc(-1),
        statusTotal: _.inc(-1),
      }
    })
    const res = await db.collection('Published').doc(event.id).field({
      likeNum: true,
      likeArr: true
    }).get();
    return res;
  }

  if (event.option == 'schoolFoodUnlike') {
    await db.collection('SchoolFood').doc(event.id).update({
      data: {
        likeArr: _.pull(event.openid),
        likeNum: _.inc(-1)
      }
    })
    const res = await db.collection('SchoolFood').doc(event.id).field({
      likeNum: true,
      likeArr: true
    }).get();
    return res;
  }

  if (event.option == 'favor') {
    await db.collection('Published').doc(event.id).update({
      data: {
        favorArr: _.push(event.openid),
        favorNum: _.inc(1),
        statusTotal: _.inc(1),
      }
    })
    const res = await db.collection('Published').doc(event.id).field({
      favorNum: true,
      favorArr: true
    }).get();
    return res;
  }

  if (event.option == 'unfavor') {
    await db.collection('Published').doc(event.id).update({
      data: {
        favorArr: _.pull(event.openid),
        favorNum: _.inc(-1),
        statusTotal: _.inc(-1),
      }
    })
    const res = await db.collection('Published').doc(event.id).field({
      favorNum: true,
      favorArr: true
    }).get();
    return res;
  }

  if (event.option == 'dininghallLike') {
    await db.collection('AboutDininghall').doc(event.id).update({
      data: {
        likeArr: _.push(event.openid),
        likeNum: _.inc(1)
      }
    })

    const res = await db.collection('AboutDininghall').doc(event.id).field({
      likeArr: true,
      likeNum: true
    }).get();
    return res;

  }

}