function updateViewportSize()
{
  if (typeof window.innerWidth != 'undefined')
  {
    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    window.viewportWidth = window.innerWidth,
    window.viewportHeight = window.innerHeight
  }
  else if (typeof document.documentElement != 'undefined' && 
           typeof document.documentElement.clientWidth != 'undefined' && 
                  document.documentElement.clientWidth != 0)
  {
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    window.viewportWidth = document.documentElement.clientWidth,
    window.viewportHeight = document.documentElement.clientHeight
  }
  else
  {
    // older versions of IE
    window.viewportWidth = document.getElementsByTagName('body')[0].clientWidth,
    window.viewportHeight = document.getElementsByTagName('body')[0].clientHeight
  }
}

updateViewportSize();
window.onresize = updateViewportSize;
