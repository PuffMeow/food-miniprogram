const cloud = require('wx-server-sdk');

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    let res = await cloud.openapi.security.msgSecCheck({
      content:event.content
    })
    return res;
  }
  catch(err){
    return err;
  }
}