const createApp = (rootComponent) => {
  return {
    mount(selector){
      let isMounted = false;
      let oldVNode = null;

      watchEffect(function (){
        if(!isMounted) {
          oldVNode = rootComponent.render();
          mount(oldVNode, selector);
          isMounted = true;
        } else {
          const newVNode = rootComponent.render();
          patch(oldVNode,newVNode);
          oldVNode = newVNode
        }
      })
    }
  }
}
