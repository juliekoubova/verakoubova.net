(function () {
  if (typeof window.CustomEvent === "function") {
    return
  }

  function CustomEvent(event: string, params: CustomEventInit) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      event,
      params.bubbles ?? false,
      params.cancelable ?? false,
      params.detail
    );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  (window as any).CustomEvent = CustomEvent;
})()