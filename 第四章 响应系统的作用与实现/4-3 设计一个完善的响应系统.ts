let activeEffect // 全局变量存储被注册的effect
const bucket = new Set() // 存储副作用函数的“桶”
// 重构4.2节effect函数功能: 注册并执行副作用函数, 相比于硬编码effect名, 支持匿名函数、不同函数名, 不依赖副作用函数的名字了
function installEffect(fn) {
  activeEffect = fn
  fn()
}
const data = { text: 'Hello Vuejs!' } // 原始数据

installEffect(() => {
  document.body.innerText = obj.text
})

const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    if(activeEffect) {
      bucket.add(activeEffect) // effect添加到桶
    }
    return target[key] // 返回属性值
  },
  set(target, key, val) {
    target[key] = val // 设置属性值
    bucket.forEach(fn => fn()) // 取出effect并执行
    return true
  }
})