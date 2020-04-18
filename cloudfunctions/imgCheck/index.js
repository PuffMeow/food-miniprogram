// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const res = await cloud.openapi.security.imgSecCheck({
      media: {
        header: {
          'Content-Type': 'application/octet-stream'
        },
        contentType: 'image/png',
        value: Buffer.from(event.value)
      }
    });
    return res;
  } catch (err) {
    return err;
  }
};