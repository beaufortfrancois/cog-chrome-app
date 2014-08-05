function updateAppVersion() {
  var topBar = document.querySelector('.topbar');
  topBar.innerHTML += ' ' + chrome.runtime.getManifest().version;
}

updateAppVersion();

function updatePlugins() {
  var pluginList = document.querySelector('#plugin-list');
  var plugins = navigator.plugins;

  pluginList.innerHTML = (plugins.length) ? '' : '-';
  for (var i = 0; i < plugins.length; i++) {
    pluginList.innerHTML += '<div>' + plugins[i].name + '</div>';
  }
}

updatePlugins();

chrome.system.cpu.getInfo(function(cpuInfo){
  document.querySelector('#cpu-name').textContent = cpuInfo.modelName.replace(/\(R\)/g, '®').replace(/\(TM\)/, '™');
  document.querySelector('#cpu-arch').textContent = cpuInfo.archName.replace(/_/g, '-');
  document.querySelector('#cpu-features').textContent = cpuInfo.features.join(', ').toUpperCase().replace(/_/g, '.') || '-';
  
  var cpuUsage = document.querySelector('#cpu-usage');
  for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
    var bar = document.createElement('div');
    bar.classList.add('bar');
    var userSection = document.createElement('span');
    userSection.classList.add('bar-section', 'user');
    var kernelSection = document.createElement('span');
    kernelSection.classList.add('bar-section', 'kernel');
    var idleSection = document.createElement('span');
    idleSection.classList.add('bar-section', 'idle');
    bar.appendChild(userSection);
    bar.appendChild(kernelSection);  
    bar.appendChild(idleSection);
    cpuUsage.appendChild(bar);
  }
  updateCpuUsage();
});

function updateCpuUsage() {
  chrome.system.cpu.getInfo(function(cpuInfo) {
      
    var cpuUsage = document.querySelector('#cpu-usage');
    for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
      var bar = cpuUsage.querySelector('.bar:nth-child('+(i+1)+')');
      var usage = cpuInfo.processors[i].usage;
      var userSectionWidth = Math.floor(usage.user / usage.total * 100);
      var kernelSectionWidth = Math.floor(usage.kernel / usage.total * 100);
      var idleSectionWidth = 100 - userSectionWidth - kernelSectionWidth;
      bar.querySelector('.user').style.width = userSectionWidth + '%';
      bar.querySelector('.kernel').style.width = kernelSectionWidth + '%';
      bar.querySelector('.idle').style.width = idleSectionWidth + '%';
    }
    setTimeout(updateCpuUsage, 1000);
    // TODO: Pause when the App goes into pause.
  });
}

chrome.system.memory.getInfo(function(memoryInfo) {
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' Bytes';
    else if (bytes < 1048576) return(bytes / 1024).toFixed(3) + ' KB';
    else if (bytes < 1073741824) return(bytes / 1048576).toFixed(3) + ' MB';
    else return (bytes / 1073741824).toFixed(3) + ' GB';
  };
  document.querySelector('#memory-capacity').textContent = formatBytes(memoryInfo.capacity);
  
  var memoryUsage = document.querySelector('#memory-usage');
  var bar = document.createElement('div');
  bar.classList.add('bar');
  var usedSection = document.createElement('span');
  usedSection.classList.add('bar-section', 'used');
  var freeSection = document.createElement('span');
  freeSection.classList.add('bar-section', 'free');
  bar.appendChild(usedSection);
  bar.appendChild(freeSection);
  memoryUsage.appendChild(bar);
  
  updateMemoryUsage();
});

function updateMemoryUsage() {
  chrome.system.memory.getInfo(function(memoryInfo) {
  
    var memoryUsage = document.querySelector('#memory-usage'); 
    var freeMemory = Math.round(memoryInfo.availableCapacity / memoryInfo.capacity * 100);
    var usedMemory = 100 - freeMemory;
    memoryUsage.querySelector('.free').style.width = freeMemory + '%';
    memoryUsage.querySelector('.used').style.width = usedMemory + '%';
    
    setTimeout(updateMemoryUsage, 500);
    // TODO: Pause when the App goes into pause.
  });
};

function updateNetwork() {
  chrome.system.network.getNetworkInterfaces(function(networkInterfaces) {
    
    var internetState = document.querySelector('#internet-state');
    var localAdapters = document.querySelector('#local-adapters');
    internetState.innerHTML = (navigator.onLine) ? 'Online' : 'Offline';
    localAdapters.innerHTML = '';
    for (var i = 0; i < networkInterfaces.length; i++) {
      var interfaceAddress = networkInterfaces[i].address.toUpperCase().replace(/(:|\.)/g, '<span class="dim">$1</span>');
      var localAdapter = '<div>' + interfaceAddress + '  -  ' + networkInterfaces[i].name + '</div>';
      localAdapters.innerHTML += localAdapter;
    }
    if (localAdapters.textContent === '') { localAdapters.textContent = '-' };
    
    setTimeout(updateNetwork, 500);
    // TODO: Pause when the App goes into pause.
  });
}

updateNetwork();

function updateDisplays() {
  chrome.system.display.getInfo(function(displayInfo) {
    
    var primaryDisplay = document.querySelector('#primary-display');
    var otherDisplays = document.querySelector('#other-displays');
    primaryDisplay.innerHTML = '';
    otherDisplays.innerHTML = '';
    for (var i = 0; i < displayInfo.length; i++) {
      var name = (displayInfo[i].name) ? displayInfo[i].name + ' - ' : '';
      var dpi = (displayInfo[i].dpiX) ? ' @ ' + displayInfo[i].dpiX + 'dpi' : '';
      var display = '<div>' + name + displayInfo[i].bounds.width + 'x' +
                    displayInfo[i].bounds.height + dpi + '</div>';
      if (displayInfo[i].isPrimary) {
        primaryDisplay.innerHTML += display;
      } else {
        otherDisplays.innerHTML += display;
      }
    }
    if (primaryDisplay.textContent === '') { primaryDisplay.textContent = '-' };
    if (otherDisplays.textContent === '') { otherDisplays.textContent = '-' };
    
    setTimeout(updateDisplays, 500);
    // TODO: Pause when the App goes into pause.
  });
}

updateDisplays();
