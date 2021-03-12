const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
const limit = 100;
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const countRes = await db.collection('SchoolFood').count();
  const total = countRes.total;
  if (total === 0) {
    return total;
  } else {
    // 计算需分几次取
    const batchTimes = Math.ceil(total / limit);
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('SchoolFood').skip(i * limit).limit(limit).get();
      tasks.push(promise);
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((prev, cur) => {
      return {
        data: prev.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
  }
}