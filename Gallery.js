/*
 *
 * * * * DOM * * * * 
 * 
 */
 
function getThumbnailLinks()
{
    var thumbs = document.getElementById('thumbnails');
    
    if(!thumbs)
    {
      return false;
    }
    
    return thumbs.getElementsByTagName('a');
}

function getViewbox()
{
    return document.getElementById('viewbox');
}

function getViewboxImage()
{
  return document.getElementById('image');
}
   

function getPhotoInfo(url)
{
  var photoId = url;
  var matches = (new RegExp('.*/(.*)$')).exec(url)
  
  if (matches)
  {
    photoId = matches[1];
  }

  var dimensions = PhotoDimensions[photoId];
  
  if (!dimensions)
  {
    return false;
  }
  
  return { 
    'href': url, 
    'dimensions': dimensions,
    
     'toString': function() {
        return "Href: "   + this.href         + "\r\n" +  
               "Width: "  + this.dimensions.w + "\r\n" +
               "Height: " + this.dimensions.h;
     }
  };
}

function get_y(obj){
	var ypos = 0;
	if (obj.offsetParent){
		while (obj.offsetParent){
			ypos += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}
	else if (obj.y) ypos += obj.y;
	return ypos;
}

function getViewboxSize()
{
  var w = window.viewportWidth
  var h = (window.viewportHeight - get_y(viewbox))

  if(typeof image.photoInfo != "undefined")
  {
    if (w > image.photoInfo.width)
    {
      w = image.photoInfo.width
    }
  
    if (h > image.photoInfo.height)
    {
      h = image.photoInfo.height
    }
  }
  
  //alert("h=" + h + "\r\nw=" + w.toString())

  return { 
    'width'  : w, 
    'height' : h,
    
    'toString' : function() {
      return 'Width = ' + this.width + '; Height = ' + this.height
    }
  };
}

function udpateViewbox(scroll)
{
  var viewboxSize = getViewboxSize();
  
  viewbox.style.width = viewboxSize.width;
  viewbox.style.height = viewboxSize.height;
  viewbox.style.overflow = scroll? 'scroll' : 'hidden';      
}

function switchPhoto()
{
  viewbox.style.background = 'white';
  window.image.style.display = 'inline';
  
  window.image.src = this.href;
  window.image.photoInfo = this.photoInfo;
  
  if (!image.scrolling || this.photoInfo.disableZoom)
  {
    setNoScroll(this.photoInfo.dimensions);
  }
  else
  {
    setScroll(this.photoInfo.dimensions);
  }
  return false;
}

function setNoScroll(dimensions)
{
  if (dimensions.h < dimensions.w)
  {
    image.style.height = getViewboxSize().height + ImageHeightDelta;
    image.style.width = '';
  }
  else
  {
    image.style.height = '';
    image.style.width = getViewboxSize().width;
  }

  image.scrolling = false;
  udpateViewbox(false);
  updateCursor();
}

function setScroll(dimensions)
{
  if (dimensions.disableZoom)
  {
    return;
  }
  
  image.style.width = dimensions.w;
  image.style.height = dimensions.h;
  image.scrolling = true;

  udpateViewbox(true);
  updateCursor();
}

function toggleZoom()
{
  if (this.scrolling)
  {
    setNoScroll(this.photoInfo.dimensions);
  }
  else
  {
    setScroll(this.photoInfo.dimensions);
  }
}

function updateCursor()
{
  return;
  if (image.scrolling)
  {
    image.style.cursor = "/ZoomOut.cur";
  }
  else
  {
    image.style.cursor = "/ZoomIn.cur";
  }
}

function initPage()
{
    if (!document.getElementById)
    {
      return false;
    }

    window.thumbs = getThumbnailLinks();
    window.image = getViewboxImage();
    window.viewbox = getViewbox();
    
    if (!thumbs || !image || !viewbox)
    {
      return false;
    }
    
    for(var i = 0; i < thumbs.length; i++)
    {
      thumbs[i].photoInfo = getPhotoInfo(thumbs[i].href);            
      thumbs[i].onclick = switchPhoto;
    }
    
    image.onclick = toggleZoom;
    image.onmousemove = updateCursor;
    
    window.onresize = function()
    {
      updateViewportSize();
      udpateViewbox(image.scrolling);          
    }
    
    udpateViewbox(false);
    /*
    if (FirstImage)
    {
      ({ 
        'href': FirstImage, 
        'switchTo': switchPhoto,
        'photoInfo': getPhotoInfo(FirstImage)
      }).switchTo();
    }*/
}
