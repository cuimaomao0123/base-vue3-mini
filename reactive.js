class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  depend() {
    activeEffect && this.subscribers.add(activeEffect);
  }
  notify() {
    this.subscribers.forEach(item => {
      item();
    })
  }
}

let activeEffect = null;
const watchEffect = (fn) => {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

//getDep为工具函数，通过targer,key获取到dep;
const targetMap = new WeakMap();
const getDep = (target, key) => {
  let depMap = targetMap.get(target);
  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap)
  }
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Dep();
    depMap.set(key, dep)
  }
  return dep;
}

//vue2方式实现数据代理
const reactive1 = (target) => {
  Object.keys(target).forEach(key => {
    let value = target[key];
    const dep = getDep(target, key);
    Object.defineProperty(target, key, {
      get() {
        dep.depend();
        return value;
      },
      set(newValue) {
        value = newValue;
        dep.notify();
      }
    })
  })
  return target;
}

//vue3方式实现数据代理
const reactive2 = (raw) => {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const value = target[key];
      const dep = getDep(target, key);
      dep.depend();
      return value;
    },
    set(target, key, newValue, receiver) {
      const dep = getDep(target, key);
      target[key] = newValue;
      dep.notify();
    }
  })
}
