export function showasConnecting(context) {
  $('#piconnectprogress').show();
  $('#piinstallcheck').hide();
  $('#piinstallprogresss').hide();

  $("#piconnectprogressicon").show();
  $("#piconnectwifiicon").hide();

  if(context.sensorStateListener) {
    context.sensorStateListener('disconnected');
  }
}
