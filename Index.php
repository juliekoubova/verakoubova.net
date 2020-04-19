<?php
  if (isset( $_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
    $languages = strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']);
    $languages = explode(',', $languages);

    foreach ($languages as $l) {
      $code = substr($l, 0, strcspn($l, ';-'));
      if ($code == 'cs') {
        header('Location: cs/');
        return;
      } else if ($code == 'de') {
        header('Location: de/');
        return;
      }
    }
  }

  header('Location: cs/');
  return;
?>