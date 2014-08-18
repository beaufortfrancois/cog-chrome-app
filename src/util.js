function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' Bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MB';
  else return (bytes / 1073741824).toFixed(3) + ' GB';
}

function formatSeconds(seconds) {
  if (seconds < 60) return seconds + ' s';
  else if (seconds < 3600) {
    var minutes = Math.floor(seconds / 60).toFixed(0);
    return '00:' + ((minutes > 9) ? minutes : '0' + minutes);
  } else {
    var hours = Math.floor(seconds / 3600).toFixed(0);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60).toFixed(0);
    return hours + ':' + ((minutes > 9) ? minutes : '0' + minutes);
  }
};
