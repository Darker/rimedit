<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="generator" content="PSPad editor, www.pspad.com">
  <meta name="author" content="Jakub Mareda">
  <title>Rim XML docs</title>
  <?php
     $TILES = array(
        array(28, "Rough Stone"),
        array(29, "Unknown"),
        array(39, "Green Carpet"),
        array(40, "Red Carpet"),
        array(30, "Smooth Stone"),
        array(51, "Dessert"),
        array(50, "Dirt"),
        array(27, "Concrete"),
        array(37, "Metal tile"),
        array(49, "Gravel"),
        array(29, "Unknown"),

     );
     $ROOFS = array(
        array(21, "Metal roof"),
        array(22, "Thin rock roof"),
        array(23, "Thick rock roof"),

     );
     $ROCK = array(
        array(53, "Rock"),
        array(54, "Minerals"),
        array(55, "Haul debris"),
        array(56, "Slag debris"),
     );
  ?>
  
  </head>
  <body>
    <h1>Tiles (TerrainMap)</h1>
    <table>
      <tr><th>ID</th><th>Type</th></tr>
      <?php
      foreach($TILES as $tile) {
        echo "<tr><td>{$tile[0]}</td><td>{$tile[1]}</td></tr>\n";
      }
      ?>
    </table>    
    <h1>Roofs (Roofs)</h1>
    <table>
      <tr><th>ID</th><th>Type</th></tr>
      <?php
      foreach($ROOFS as $tile) {
        echo "<tr><td>{$tile[0]}</td><td>{$tile[1]}</td></tr>\n";
      }
      ?>
    </table>
  </body>
</html>
