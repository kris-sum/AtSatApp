<?php
for ( $i = 0; $i < 5; $i ++) {
  $passNum = $i;
  $passTitle;
  if ($passNum<1){
    $passTitle = "NEXT PASS";
    } else {
      $passTitle = "PASS " . ($passNum+1);
    }
  
  ?>
<div id="pass-table-<?php echo $i; ?>">
  <table id="next-pass-location" class="nextPass stats">
    <tr>
      <th><?php echo $passTitle; ?>:</th>
    </tr>
  </table>
  <table id="next-pass-stats" class="stats">
    <tr >
      <td class="label"><div class="dateVal"><span class="loading">loading...</span></div></td>
      <td class="right" ><div class="duration">For <span class="durationVal"></span> </div>
      </td>
    </tr>
  </table>
  <table class="forecast stats">
    <tr class="four">
      <td class="label" >Ozone</td>
      <td class="ozoneVal" class="right" ><span class="loading">loading...</span></td>
      <td class="label" style="width: 35%;">Cloud cover</td>
      <td class="cloudVal" class="right" style="width: 15%;"><span class="loading">loading...</span></td>
    </tr>
  </table>
  <table class="forecast stats">
    <tr class="four">
      <td class="label">Visibility</td>
      <td class="visibilityVal" class="right"><span class="loading">loading...</span></td>
      <td class="skyTypeVal label"><span class="loading">loading...</span></td>
      <td class="skyTypeTimeVal" class="right"><span class="loading">loading...</span></td>
    </tr>
  </table>
</div>
<?php
}
?>
