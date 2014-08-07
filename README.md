# Cog Chrome App

Just a simple Chrome App to showcase `chrome.system.*` APIs available on [Desktop](https://chrome.google.com/webstore/detail/difcjdggkffcfgcfconafogflmmaadco) and [Android](https://play.google.com/store/apps/details?id=com.github.beaufortfrancois.cog_chrome_app).

## Getting the code

You can download the whole source code [as one archive](https://github.com/beaufortfrancois/cog-chrome-app/archive/master.zip), or get it from the repository using git:

    git clone git://github.com/beaufortfrancois/cog-chrome-app.git

## Running the development version

### Chrome Desktop

* Check `Developer Mode` in `chrome://extensions`
* Click "Load unpacked extension..." in `chrome://extensions` and select the `cog-chrome-app` folder.
* Run it.

### Chrome for Android

* Install the Chrome Apps for mobile toolchain [requirements](https://github.com/MobileChromeApps/mobile-chrome-apps/blob/master/docs/Installation.md).
* Create your project: `cca create cog-mobile-chrome-app --link-to=path/to/cog-chrome-app/manifest.json`
* Plug in your Android device. 
* Go to Settings->Developer Options and enable `USB debugging`.
* Run it: `cca run android`
