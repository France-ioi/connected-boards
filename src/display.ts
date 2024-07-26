export function showasConnecting(context) {
  $('#piconnectprogress').show();
  $('#piinstallcheck').hide();
  $('#piinstallprogresss').hide();

  if(context.sensorStateListener) {
    context.sensorStateListener('disconnected');
  }
}
