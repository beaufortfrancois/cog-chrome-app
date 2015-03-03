var timeoutId;
var previousCpuInfo;

function initLabels() {

  function setLabel(elementId, messageId) {
    var label = document.querySelector('label[for=' + elementId + ']');
    label.textContent = chrome.i18n.getMessage(messageId);
  }

  setLabel('operating-system', 'operatingSystemLabel');
  setLabel('platform', 'platformLabel');
  setLabel('chrome-version', 'chromeVersionLabel');

  setLabel('cpu-name', 'cpuNameLabel');
  setLabel('cpu-arch', 'cpuArchLabel');
  setLabel('cpu-features', 'cpuFeaturesLabel');
  setLabel('cpu-usage', 'cpuUsageLabel');

  setLabel('internal-storage-units', 'internalStorageUnitsLabel');
  setLabel('external-storage-units', 'externalStorageUnitsLabel');

  setLabel('memory-capacity', 'memoryCapacityLabel');
  setLabel('memory-usage', 'memoryUsageLabel');

  setLabel('internet-state', 'internetStateLabel');
  setLabel('local-adapters', 'localAdaptersLabel');

  setLabel('battery-status', 'batteryStatusLabel');
  setLabel('battery-time', 'batteryTimeLabel');
  setLabel('battery-level', 'batteryLevelLabel');

  setLabel('primary-display', 'primaryDisplayLabel');
  setLabel('other-displays', 'otherDisplaysLabel');

  setLabel('language', 'languageLabel');
  setLabel('accept-languages', 'acceptLanguagesLabel');

  setLabel('plugins-list', 'pluginsListLabel');
}

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

  var platform = document.querySelector('#platform');
  platform.textContent = navigator.platform.replace(/_/g, '-');

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
  document.querySelector('#battery').classList.remove('hidden');

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
    if (batteryManager.charging) {
      batteryStatus.textContent = chrome.i18n.getMessage('batteryChargingState');
    } else {
      batteryStatus.textContent = chrome.i18n.getMessage('batteryDischargingState');
    }

    var batteryTime = document.querySelector('#battery-time');
    if (batteryManager.charging) {
      batteryTime.textContent = (batteryManager.chargingTime !== Infinity) ?
          formatSeconds(batteryManager.chargingTime) +
          chrome.i18n.getMessage('untilFullText') : '-';
    } else {
      batteryTime.textContent = (batteryManager.dischargingTime !== Infinity) ?
          formatSeconds(batteryManager.dischargingTime) +
          chrome.i18n.getMessage('leftText') : '-';
    }

    var batteryLevel = document.querySelector('#battery-level');
    var batteryUsed = batteryManager.level.toFixed(2) * 100;
    batteryLevel.querySelector('.used').style.width = batteryUsed + '%';
}

function initPlugins() {
  if (!navigator.plugins.length) {
    return;
  }

  document.querySelector('#plugins').classList.remove('hidden');

  var pluginList = document.querySelector('#plugins-list');
  for (var i = 0; i < navigator.plugins.length; i++) {
    pluginList.innerHTML += '<div>' + navigator.plugins[i].name + '</div>';
  }
}

function updateStorage() {
  chrome.system.storage.getInfo(function(storageInfo) {
    if (storageInfo.length === 0) {
      document.querySelector('#storage').classList.add('hidden');
      return;
    }

    document.querySelector('#storage').classList.remove('hidden');

    var internalStorageUnits = document.querySelector('#internal-storage-units');
    var externalStorageUnits = document.querySelector('#external-storage-units');
    internalStorageUnits.innerHTML = '';
    externalStorageUnits.innerHTML = '';
    for (var i = 0; i < storageInfo.length; i++) {
      var storageUnitHtml = '<div>' + storageInfo[i].name +
          (storageInfo[i].capacity ? ' - ' + formatBytes(storageInfo[i].capacity) : '') + '</div>';
      if (storageInfo[i].type === 'removable') {
        externalStorageUnits.innerHTML += storageUnitHtml;
      } else {
        internalStorageUnits.innerHTML += storageUnitHtml;
      }
    }

    var internalStorage = document.querySelector('#internal-storage');
    if (internalStorageUnits.textContent === '') {
      internalStorage.classList.add('hidden');
    } else {
      internalStorage.classList.remove('hidden');
    }
    var externalStorage = document.querySelector('#external-storage');
    if (externalStorageUnits.textContent === '') {
      externalStorage.classList.add('hidden');
    } else {
      externalStorage.classList.remove('hidden');
    }
  });
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
    var width = parseInt(window.getComputedStyle(cpuUsage).width.replace(/px/g, ''));
    for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
      var bar = document.createElement('div');
      bar.classList.add('bar');
      var usedSection = document.createElement('span');
      usedSection.classList.add('bar-section', 'used');
      usedSection.style.transform = 'translate(-' + width + 'px, 0px)';
      bar.appendChild(usedSection);
      cpuUsage.appendChild(bar);
    }
  });
}

function updateCpuUsage() {
  chrome.system.cpu.getInfo(function(cpuInfo) {

    var cpuUsage = document.querySelector('#cpu-usage');
    var width = parseInt(window.getComputedStyle(cpuUsage).width.replace(/px/g, ''));
    for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
        var usage = cpuInfo.processors[i].usage;
        var usedSectionWidth = 0;
      if (previousCpuInfo) {
        var oldUsage = previousCpuInfo.processors[i].usage;
        usedSectionWidth = Math.floor((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) / (usage.total - oldUsage.total) * 100);
      } else {
        usedSectionWidth = Math.floor((usage.kernel + usage.user) / usage.total * 100);
      }
      var bar = cpuUsage.querySelector('.bar:nth-child(' + (i + 1) + ')');
      bar.querySelector('.used').style.transform = 'translate(' + parseInt(usedSectionWidth * width / 100 - width) + 'px, 0px)';
    }
    previousCpuInfo = cpuInfo;
  });
}

function initMemory() {
  chrome.system.memory.getInfo(function(memoryInfo) {

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
    if (navigator.onLine) {
      internetState.textContent = chrome.i18n.getMessage('onlineState');
    } else {
      internetState.textContent = chrome.i18n.getMessage('offlineState');
    }
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
  updateStorage();

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
  topBar.innerHTML += ' ' + chrome.runtime.getManifest().version_name;

  initLabels();

  initInfo();
  initBattery();
  initCpu();
  initMemory();
  initPlugins();
  updateAll();
});
