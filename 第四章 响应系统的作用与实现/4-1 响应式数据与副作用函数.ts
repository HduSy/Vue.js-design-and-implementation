// 副作用函数: effect函数的执行会直接或间接影响其他函数的执行，这时我们说effect函数产生了副作用
function effect() {
  document.body.innerText = obj.text
}

const obj = { text: 'Hello Vue.js!' }
// 响应式数据：当值变化后，副作用函数能够自动重新执行，那么该值就符合响应式数据的概念
obj.text = 'Welcome Vue3!'