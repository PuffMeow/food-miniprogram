// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})


const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.option === 'shareFood'){
    return await db.collection('Published').where({
      _id: event.id
    }).remove()
  }
  if(event.option === 'schoolFood'){
    return await db.collection('SchoolFood').where({
      _id: event.id
    }).remove()
  }
}