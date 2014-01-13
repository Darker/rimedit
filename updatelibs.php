<?php
/*PHP script*/
if(!defined("included"))
  header("Content-Type: text/plain; charset=utf-8");
$paths = array(
  //"Language.class.php","../classes/language/","inc/other",
  //"Language.class.js", "../classes/language/","js/",
  "domboost.js","../classes/",".",
  //"User.class.php","../classes/page_user/","inc/other",
  //"Mailer.class.php","../classes/","inc/other",
  //"Timer.class.php", "../classes/", "inc/other",          //tooltip.class.js
  //"Captcha.class.php","../classes/captcha/","inc/other",
  "tooltip.class.js","../classes/tooltip/",".",
  "domboost.js","../classes/",".",
  "domboost.js","../classes/",".",
);
if(!defined("included"))
  $updates = 0;
for($i=0; $i<count($paths); $i+=3) {
 $here = $paths[$i+2].'/'.$paths[$i];
 $there = $paths[$i+1].'/'.$paths[$i];
 if(file_exists($there)&&(!file_exists($here)||filemtime($here)<filemtime($there))) {
   copy($there, $here);
   if(!defined("included")) {
      echo "Copyed {$paths[$i]}\n";
      $updates++;
   } 
 }
}
if(!defined("included")) {
  if($updates==0)
    echo "\nNo files were copyed.\n";
  elseif($updates==1)
    echo "\nOne update performed.\n";
  else
    echo "\n$updates files copyed in total.\n";
}
?>