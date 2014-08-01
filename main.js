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
  document.querySelector('#memory-capacity').textContent = Math.round(memoryInfo.capacity / 1024 / 1024 / 1024) + 'GB';
  
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
    var usedMemory = Math.round(memoryInfo.availableCapacity / memoryInfo.capacity * 100);
    var freeMemory = 100 - usedMemory;
    memoryUsage.querySelector('.free').style.width = freeMemory + '%';
    memoryUsage.querySelector('.used').style.width = usedMemory + '%';
    
    setTimeout(updateMemoryUsage, 500);
    // TODO: Pause when the App goes into pause.
  });
};

function updateNetworkInterfaces() {
  chrome.system.network.getNetworkInterfaces(function(networkInterfaces) {
    
    var ethAdapters = document.querySelector('#eth-adapters');
    var wlanAdapters = document.querySelector('#wlan-adapters');
    ethAdapters.innerHTML = '';
    wlanAdapters.innerHTML = '';
    for (var i = 0; i < networkInterfaces.length; i++) {
      var interfaceAddress = networkInterfaces[i].address.toUpperCase();
      if (networkInterfaces[i].name.substring(0, 4) === 'wlan') {
        wlanAdapters.innerHTML += interfaceAddress + '<br/>';
      } else {
        ethAdapters.innerHTML += interfaceAddress + '<br/>';
      }
    }
    if (ethAdapters.textContent === '') { ethAdapters.textContent = '-' };
    if (wlanAdapters.textContent === '') { wlanAdapters.textContent = '-' };
    
    setTimeout(updateNetworkInterfaces, 500);
    // TODO: Pause when the App goes into pause.
  });
}

updateNetworkInterfaces();