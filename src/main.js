var timeoutId;
var previousCpuInfo;

function initInfo() {
  var operatingSystem = document.querySelector('#operating-system');
  if (/CrOS/.test(navigator.userAgent)) {
    operatingSystem.textContent = 'Chrome OS';
  } else if (/Mac/.test(navigator.platform)) {
    operatingSystem.textContent = 'Mac OS';
  } else if (/Win/.test(navigator.platform)) {
    operatingSystem.textContent = 'Windows';
  } else if (/Android/.test(navigator.userAgent)) {
    operatingSystem.textContent = 'Android';
  } else if (/Linux/.test(navigator.userAgent)) {
    operatingSystem.textContent = 'Linux';
  } else {
    operatingSystem.textContent = '-';
  }

  var chromeVersion = document.querySelector('#chrome-version');
  chromeVersion.textContent = navigator.userAgent.match('Chrome/([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)')[1];

  var platformName = document.querySelector('#platform-name');
  platformName.textContent = navigator.platform.replace(/_/g, '-');

  var language = document.querySelector('#language');
  language.textContent = navigator.language;

  var acceptLanguages = document.querySelector('#accept-languages');
  chrome.i18n.getAcceptLanguages(function(languages) {
    acceptLanguages.textContent = languages.join(', ');
  });
}

function initBattery() {
  if (!navigator.getBattery) {
    return;
  }
  document.querySelector('#battery').style.display = 'block';

  navigator.getBattery().then(function(batteryManager) {
    updateBattery(batteryManager);
    function update(event) {
      updateBattery(event.target);
    }

    batteryManager.onchargingchange = update;
    batteryManager.ondischargingtimechange = update;
    batteryManager.onchargingtimechange = update;
    batteryManager.onlevelchange = update;
  });
}

function updateBattery(batteryManager) {
    var batteryStatus = document.querySelector('#battery-status');
    batteryStatus.textContent = batteryManager.charging ? 'Charging' : 'Discharging';

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

    var batteryTime = document.querySelector('#battery-time');
    if (batteryManager.charging) {
      batteryTime.textContent = (batteryManager.chargingTime !== Infinity) ?
          formatSeconds(batteryManager.chargingTime) + ' until full' : '-';
    } else {
      batteryTime.textContent = (batteryManager.dischargingTime !== Infinity) ?
          formatSeconds(batteryManager.dischargingTime) + ' left' : '-';
    }

    var batteryLevel = document.querySelector('#battery-level');
    var batteryUsed = batteryManager.level.toFixed(2) * 100;
    batteryLevel.querySelector('.used').style.width = batteryUsed + '%';
}

function initPlugins() {
  var pluginList = document.querySelector('#plugin-list');
  var plugins = navigator.plugins;

  pluginList.innerHTML = (plugins.length) ? '' : '-';
  for (var i = 0; i < plugins.length; i++) {
    pluginList.innerHTML += '<div>' + plugins[i].name + '</div>';
  }
}

function initCpu() {
  chrome.system.cpu.getInfo(function(cpuInfo) {

    var cpuName = cpuInfo.modelName.replace(/\(R\)/g, '®').replace(/\(TM\)/, '™');
    document.querySelector('#cpu-name').textContent = cpuName;

    var cpuArch = cpuInfo.archName.replace(/_/g, '-');
    document.querySelector('#cpu-arch').textContent = cpuArch;

    var cpuFeatures = cpuInfo.features.join(', ').toUpperCase().replace(/_/g, '.') || '-';
    document.querySelector('#cpu-features').textContent = cpuFeatures;

    var cpuUsage = document.querySelector('#cpu-usage');
    for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
      var bar = document.createElement('div');
      bar.classList.add('bar');
      var userSection = document.createElement('span');
      userSection.classList.add('bar-section', 'user');
      var kernelSection = document.createElement('span');
      kernelSection.classList.add('bar-section', 'kernel');
      bar.appendChild(userSection);
      bar.appendChild(kernelSection);
      cpuUsage.appendChild(bar);
    }
  });
}

function updateCpuUsage() {
  chrome.system.cpu.getInfo(function(cpuInfo) {

    var cpuUsage = document.querySelector('#cpu-usage');
    for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
      var usage = cpuInfo.processors[i].usage;
      if (previousCpuInfo) {
        var oldUsage = previousCpuInfo.processors[i].usage;
        var userSectionWidth = Math.floor((oldUsage.user - usage.user) / (oldUsage.total - usage.total) * 100);
        var kernelSectionWidth = Math.floor((oldUsage.kernel - usage.kernel) / (oldUsage.total - usage.total) * 100);
      } else {
        var userSectionWidth = Math.floor(usage.user / usage.total * 100);
        var kernelSectionWidth = Math.floor(usage.kernel / usage.total * 100);
      }
      var bar = cpuUsage.querySelector('.bar:nth-child(' + (i + 1) + ')');
      bar.querySelector('.user').style.width = userSectionWidth + '%';
      bar.querySelector('.kernel').style.width = kernelSectionWidth + '%';
    }
    previousCpuInfo = cpuInfo;
  });
}

function initMemory() {
  chrome.system.memory.getInfo(function(memoryInfo) {

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' Bytes';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MB';
      else return (bytes / 1073741824).toFixed(3) + ' GB';
    }

    document.querySelector('#memory-capacity').textContent = formatBytes(memoryInfo.capacity);

    var memoryUsage = document.querySelector('#memory-usage');
    var bar = document.createElement('div');
    bar.classList.add('bar');
    var usedSection = document.createElement('span');
    usedSection.classList.add('bar-section', 'used');
    bar.appendChild(usedSection);
    memoryUsage.appendChild(bar);
  });
}

function updateMemoryUsage() {
  chrome.system.memory.getInfo(function(memoryInfo) {

    var memoryUsage = document.querySelector('#memory-usage');
    var usedMemory = 100 - Math.round(memoryInfo.availableCapacity / memoryInfo.capacity * 100);
    memoryUsage.querySelector('.used').style.width = usedMemory + '%';
  });
};

function updateNetwork() {
  chrome.system.network.getNetworkInterfaces(function(networkInterfaces) {

    var internetState = document.querySelector('#internet-state');
    internetState.textContent = (navigator.onLine) ? 'Online' : 'Offline';
    if (navigator.connection && navigator.connection.type !== 'none') {
      internetState.textContent += ' - ' + navigator.connection.type;
    }

    var localAdapters = document.querySelector('#local-adapters');
    localAdapters.innerHTML = '';
    networkInterfaces.sort(function(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      if (a.address.length < b.address.length) return -1;
      if (a.address.length > b.address.length) return 1;
      return 0;
    });
    for (var i = 0; i < networkInterfaces.length; i++) {
      localAdapters.innerHTML += '<div>' + networkInterfaces[i].name + ' - ' +
          networkInterfaces[i].address.toUpperCase().replace(/(:|\.)/g, '<span class="dim">$1</span>') + '</div>';
    }
    if (localAdapters.textContent === '') { localAdapters.textContent = '-' };
  });
}

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
  });
}

function updateAll() {
  updateCpuUsage();
  updateDisplays();
  updateMemoryUsage();
  updateNetwork();

  timeoutId = setTimeout(updateAll, 500);
}

chrome.runtime.onSuspend.addListener(function() {
  clearTimeout(timeoutId);
});

chrome.runtime.onSuspendCanceled.addListener(function() {
  updateAll();
});

document.addEventListener('DOMContentLoaded', function() {
  var topBar = document.querySelector('.topbar');
  topBar.innerHTML += ' ' + chrome.runtime.getManifest().version;

  initInfo();
  initBattery();
  initCpu();
  initMemory();
  initPlugins();
  updateAll();
});
