<?php
	if (isset( $_SERVER['HTTP_ACCEPT_LANGUAGE'])) 
	{
		//explode languages into array
		$languages = strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']);
		$languages = explode(',', $languages);

		foreach ($languages as $l)
		{
			$code = substr($l, 0, strcspn($l, ';-'));

      if ($code == 'cs')
      {
        header('Location: cz/Index.html');
        return;
      }      
      else if ($code == 'de')
      {
        header('Location: de/Index.html');
        return;
      }
    }
  }
  
  header('Location: cz/Index.html');
?>
  
<html>
  <head>
    <title>Věra Koubová</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" href="VeK.css" />
  </head>

  <body>
  
    <a href="cz/Index.html">Česky</a>
    <a href="de/Index.html">Deutsch</a>

  </body>
</html>
