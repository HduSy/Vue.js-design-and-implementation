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

/**
 * 根本原因是，我们没有在副作用函数与被操作的目标字段之间建立明确的联系，拦截了对所有属性的操作！
 * 当读取属性时，无论读取的是哪一个属性，其实都一样，都会把副作用函数收集到“桶”里；
 * 当设置属性时，无论设置的是哪一个属性，也都会把“桶”里的副作用函数取出并执行
 * 设计一个树形结构
 * 同一属性可能对应多个不同的副作用函数；
 * 同一副作用函数可能同时读取了多个属性
 * target --> keys --> effectFns
 */

const bucket2 = new WeakMap()
const obj2 = new Proxy(data, {
  get(target, key) {
    if(!activeEffect) return target[key] // 没有effect直接返回
    let depsMap = bucket2.get(target) // Map: target ---> keys map
    if(!depsMap) bucket2.set(target, depsMap = new Map())
    let deps = depsMap.get(key) // Set: key ---> effectFns set
    if(!deps) depsMap.set(key, deps = new Set())
    deps.add(activeEffect)
    return target[key]
  },
  set(target, key, val) {
    target[key] = val
    const depsMap = bucket2.get(target) // Map: target ---> keys map
    if(!depsMap) return false
    const effectFns = depsMap.get(key) // Set: key ---> effectFns set
    effectFns && effectFns.forEach(fn => fn())
    return true
  }
})

// 逻辑封装到track trigger
const obj3 = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, val) {
    target[key] = val
    trigger(target, key)
    return true
  }
})
// get时拦截，追踪变化
function track(target, key) {
  if(!activeEffect) return
  let depsMap = bucket2.get(target)
  if(!depsMap) {
    bucket2.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if(!deps) {
    depsMap.set(key, (deps = new Map()))
  }
  deps.add(activeEffect)
}
// set时拦截，执行相关副作用函数
function trigger(target, key) {
  const depsMap = bucket2.get(target)
  if(!depsMap) return
  const effectFns = depsMap.get(key)
  effectFns && effectFns.forEach(fn => fn())
}