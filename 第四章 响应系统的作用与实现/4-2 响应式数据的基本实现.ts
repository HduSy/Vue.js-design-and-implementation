// 1. 当副作用函数 effect 执行时，会触发字段 obj.text 的读取操作
// 2. 当修改 obj.text 的值时，会触发字段 obj.text 的设置操作
// 目的：拦截一个对象的读取、设置操作

const bucket = new Set() // 存储副作用函数的“桶”
const data = { text: 'Hello Vuejs!' } // 原始数据

const effect = function() {
  document.body.innerText = obj.text
}

const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    bucket.add(effect) // effect添加到桶
    return target[key] // 返回属性值
  },
  set(target, key, val) {
    target[key] = val // 设置属性值
    bucket.forEach(fn => fn&&fn()) // 取出effect并执行
    return true
  }
})

// Vue2使用 Object.defineProperty API 将普通数据变为响应式数据
// Vue3使用 Proxy API 将普通数据变为响应式数据