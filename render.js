const h = (type, props, children) => {
  return {
    type,
    props,
    children
  }
}

//将vnode转换成真实的Dom，并且挂载到父容器上
const mount = (vnode, container) => {
  //1、创建标签
  const el = vnode.el = document.createElement(vnode.type);

  //2、处理props
  if (vnode.props) {
    const props = Object.keys(vnode.props);
    props.forEach(key => {
      const value = vnode.props[key]
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    })
  }

  //3、处理children
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children;
    } else {
      vnode.children.forEach(item => {
        mount(item, el);
      })
    }
  }

  //挂载到父容器上
  let parentDom;
  if (typeof container === "string") {
    parentDom = document.querySelector(container);
  } else {
    parentDom = container;
  }
  parentDom.appendChild(el)
}

//比较新旧vnode，更新节点(n1旧，n2新)
const patch = (n1, n2) => {
  //1、比较节点类型
  if (n1.type !== n2.type) {
    const parentDom = n1.el.parentElement;
    parentDom.removeChild(n1.el);
    mount(n2, parentDom);
  } else {
    const el = n2.el = n1.el;

    //2、比较与处理props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    //2.1将新节点没有的props添加到新节点上
    for (let prop in newProps) {
      const oldValue = oldProps[prop];
      const newValue = newProps[prop];
      if (oldValue !== newValue) {
        if (prop.startsWith("on")) {
          el.addEventListener(prop.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(prop, newValue);
        }
      }
    }

    //2.2将多余的旧props从新节点移除
    for (let prop in oldProps) {
      if (prop.startsWith("on")) {
        el.removeEventListener(prop.slice(2).toLowerCase(), oldProps[prop])
      }
      if (!(prop in newProps)) {
        el.removeAttribute(prop)
      }
    }

    //3、比较与处理children
    const oldChildren = n1.children || [];
    const newChildren = n2.children || [];
    if (typeof newChildren === "string") {
      //3.1 newChildren是string
      if (typeof oldChildren === "string") {
        el.textContent = n2.children;
      } else {
        el.innerHtml = n2.children;
      }
    } else if (typeof oldChildren === "string") {
      //3.2 oldChildren是string
      el.innerHtml = "";
      newChildren.forEach(item => {
        mount(item, el)
      })
    } else {
      //3.3新旧children都是数组
      const commonLength = Math.min(oldChildren.length, newChildren.length);
      for (let i =0; i<commonLength; i++) {
        patch(oldChildren[i], newChildren[i])
      }
      if (oldChildren.length > commonLength) {
        oldChildren.slice(commonLength).forEach(item => {
          el.removeChild(item.el)
        })
      }
      if (newChildren.length > commonLength) {
        newChildren.slice(commonLength).forEach(item => {
          mount(item, el);
        })
      }
    }
  }
}
























