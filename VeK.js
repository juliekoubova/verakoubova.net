function gotoReturnUrl()
{
  var from = getFieldValue('from');
  
  if (from)
  {
    var urls = from.split(';')
    
    if (urls && urls.length > 0)
    {
      var returnUrl = urls.shift()
      var returnFrom = urls.join(';')

      if (returnFrom.length > 0)
      {
        returnUrl += '?from=' + returnFrom;
      }

      window.location = returnUrl;
      return false;
    }
  }
  
  return true;
}

function getFieldValue(name)
{
    var match = (new RegExp('[?&]' + name + '=([^&#]*)')).exec(location.search);
    return match ? unescape(match[1]) : "";
}

function getReturnLink()
{
  if (!document.getElementById)
  {
    return false;
  }

  var zurueck = document.getElementById("zurueck");
  
  if (zurueck)
  {
    return zurueck;
  }

  var zpet = document.getElementById("zpet");
    
  if (zpet)
  {
    return zpet;
  }

  var returnLink = document.getElementById("returnLink");
  
  if (returnLink)
  {
    return returnLink;
  }
  
  return false;
}

function isReturnLink(anchor)
{
  if (anchor.id == "zurueck")
  {
    return true;
  }

  if (anchor.id == "zpet")
  {
    return true;
  }

  if (anchor.id == "returnLink")
  {
    return true;
  }
  
  return false;
}

function getInternalLinks()
{
  if (!document.getElementsByTagName)
  {
    return false;
  }

  var anchors = document.getElementsByTagName('a');
  var localAnchors = []
  
  var isThumbnail = /thumbnail-link/
  var isLocal = new RegExp('^' + location.protocol + '//' + location.host + '/');

  for (var i = 0; i < anchors.length; i++)
  {
    if (isLocal.exec(anchors[i].href) && !isThumbnail.exec(anchors[i].className))
    {
      localAnchors.push(anchors[i])
    }
  }

  return localAnchors;
}

function attachReturnLink()
{
  var returnLink = getReturnLink();
  
  if (returnLink)
  {
    returnLink.onclick = gotoReturnUrl;
  }
}

function shouldAddToFrom()
{
  return document.body.className.match(/add-to-from/);
}

function attachInternalLinks()
{
  var internalLinks = getInternalLinks();
  
  if (internalLinks)
  {
    var from = getFieldValue('from');  
    
    if (shouldAddToFrom())
    {
      from = location.pathname + ';' + from;
    }
    
    var str = '';
    
    if (from)
    {
      for(var i = 0; i < internalLinks.length; i++)
      {
        if (!isReturnLink(internalLinks[i]))
        {
          var hash = '';
          var href = internalLinks[i].href;
          var hashIndex = href.indexOf('#');
          
          if (hashIndex > -1)
          {
            hash = href.substring(hashIndex);
            href = href.substring(0, hashIndex);
          }
  
          internalLinks[i].href = href + '?from=' + from + hash;
          str += internalLinks[i].href + "\r\n"
        }
      }
    }
    
    //alert(str);
  }
}

function init() 
{
  if (arguments.callee.done) 
  {
    return;
  }
  arguments.callee.done = true;
  
  attachReturnLink();
  attachInternalLinks();

  if (typeof initPage == 'function')
  {
    initPage();
  }
};

/* for Mozilla */
if (document.addEventListener) 
{
   document.addEventListener("DOMContentLoaded", init, false);
}

/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
   document.write("<script defer src='/ie_onload.js'><"+"/script>");
/*@end @*/

/* for other browsers */
window.onload = init;
