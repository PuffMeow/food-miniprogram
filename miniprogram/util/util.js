function getTime() {
  let date = new Date();
  let year = date.getFullYear();
  let getMonth = date.getMonth() + 1;
  let month = getMonth < 10 ? "0" + getMonth : getMonth;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  let minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  let second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

//节流/防抖
function debounce(fn, wait = 50, isDebounce = true) {
  if (isDebounce) {
    let timer
    return function () {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        fn.apply(this, arguments)
      }, wait)
    }
  } else {
    let prev = new Date()
    return function () {
      let now = new Date()
      if (now - prev > wait) {
        fn.apply(this, arguments)
        prev = new Date()
      }
    }
  }
}


module.exports = {
  getTime,
  debounce
}