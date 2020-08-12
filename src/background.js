'use strict'

import { app, protocol, ipcMain, BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import db from './db';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let win
let mainWindow;
let loginWindow;
let extraWindow;
let printWindow;
let printData;
let isMaximized = false;
const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

const loginURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/#/login`
    : `file://${__dirname}/index.html#/login`;
const extraURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/#/extra`
    : `file://${__dirname}/index.html#/extra`;
const printURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/#/print`
    : `file://${__dirname}/index.html#/print`;

//打开程序默认在线使用
db.set('useType', 1).write();


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// function createWindow() {
//   // Create the browser window.
//   win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       // Use pluginOptions.nodeIntegration, leave this alone
//       // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
//       nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
//     }
//   })

//   if (process.env.WEBPACK_DEV_SERVER_URL) {
//     // Load the url of the dev server if in development mode
//     win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
//     if (!process.env.IS_TEST) win.webContents.openDevTools()
//   } else {
//     createProtocol('app')
//     // Load the index.html when not in development
//     win.loadURL('app://./index.html')
//   }

//   win.on('closed', () => {
//     win = null
//   })
// }

function createMainWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 1000,
    frame: false,
    resizable: false,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webviewTag: true
    }
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
}

function createLoginWindow() {
  /**
   * Initial window options
   */
  loginWindow = new BrowserWindow({
    height: 434,
    useContentSize: true,
    width: 756,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webviewTag: true
    }
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    loginWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) loginWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    loginWindow.loadURL('app://./index.html')
  }
  // loginWindow.loadURL(loginURL);
}

function createExtraWindow() {
  extraWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    //autoHideMenuBar: true,
    parent: mainWindow, //win是主窗口
    useContentSize: true,
    resizable: true, // 是否可以改变窗口大小
    movable: true,
    title: '拓展屏',
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    extraWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) extraWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    extraWindow.loadURL('app://./index.html')
  }
}

function createPrintWindow(width, height, data) {
  printWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: false,
    useContentSize: false,
    resizable: false, // 是否可以改变窗口大小
    movable: false,
    show: false,
    title: '打印',
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    printWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) printWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    printWindow.loadURL('app://./index.html')
  }
  printData = data;
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (win === null) {
  //   createWindow()
  // }
  if (mainWindow === null) {
    const token = db.has('token').value();
    if (token) {
      console.log('is login');
      createMainWindow();
    } else {
      createLoginWindow();
      console.log('not login');
    }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  // createWindow()
  const ret = globalShortcut.register('CmdOrCtrl+Shift+L', () => {
    console.log('active shortcut');
    mainWindow.webContents.openDevTools();
    if (extraWindow) {
      extraWindow.webContents.openDevTools();
    }
  });
  if (!ret) {
    console.log('shortcut faild');
  } else {
    console.log('shortcut success');
  }
  const token = db.has('token').value();
  if (token) {
    console.log('is login');
    createMainWindow();
  } else {
    createLoginWindow();
    console.log('not login');
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 进程监听
ipcMain.on('window', (event, data) => {
  console.log('TCL: event', event);
  if (mainWindow) {
    switch (data) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (!isMaximized) {
          isMaximized = true;
          mainWindow.maximize();

          mainWindow.webContents.send(
            'set-app-bound',
            mainWindow.getContentBounds()
          );
        } else {
          isMaximized = false;
          mainWindow.unmaximize();
          mainWindow.webContents.send(
            'set-app-bound',
            mainWindow.getContentBounds()
          );
          if (mainWindow) {
            mainWindow.webContents.send('resize-window', '最大化');
          }
          if (mainWindow) {
            mainWindow.webContents.send('resize-window', '取消最大化');
          }
        }

        break;
      case 'close':
        // 点击关闭时退出应用
        mainWindow.close();
        mainWindow = null;
        app.quit();
        break;
      default:
        break;
    }
    event.returnValue = 'ok';
  } else if (loginWindow) {
    switch (data) {
      case 'close':
        loginWindow.close();
        loginWindow = null;
        app.quit();
        break;
      default:
        break;
    }
  }
});

// 进程监听：登录成功事件
ipcMain.on('login', async (event, token) => {
  console.log('TCL: event', event);
  // 保存token
  await db.set('token', token).write();
  // 创建主窗口
  createMainWindow();
  // 关闭登录窗口
  loginWindow.close();
  loginWindow = null;
  event.returnValue = 'ok';
});

// 进程监听： 注销登录事件
ipcMain.on('logout', async (event) => {
  console.log('TCL: event', event);
  // 清理token
  await db.unset('token').write();
  // 创建登录窗口
  createLoginWindow();
  // 关闭主窗口
  mainWindow.close();
  mainWindow = null;
  event.returnValue = 'ok';
});

/**
 * 开启拓展屏窗口
 */
ipcMain.on('createExtraScreen', (event) => {
  if (!extraWindow) {
    createExtraWindow();
    extraWindow.on('closed', () => {
      extraWindow = null;
    });
    ipcMain.once('init-extra-screen-complete', (event, res) => {
      if (res === 'ok') {
        mainWindow.webContents.send('init-extra-screen-complete', 'ok');
      }
    });
  } else {
    console.log('had open the extra screen');
  }
});

ipcMain.on('close-extra', () => {
  if (extraWindow) {
    extraWindow.close();
    extraWindow = null;
  }
});

/**
 * 开启打印窗口
 */
ipcMain.on('createPrintWindow', (event, width, height, data) => {
  mainWindow.webContents.send('show-loading');
  if (printWindow) {
    printWindow.close();
    printWindow = null;
  }
  createPrintWindow(width, height, data);
});

/**
 * 接受子进程传过来的消息
 */
ipcMain.on('transfer', (event, data, type) => {
  if (extraWindow) {
    extraWindow.webContents.send('extra-data', data, type);
  } else {
    console.log('extraWindow had be destory ...');
  }
});

/**
 * 设置拓展屏大小
 */
ipcMain.on('setExtraWindow', (event, opt) => {
  console.log(opt);
  if (extraWindow) {
    switch (opt) {
      case 'minimize':
        extraWindow.minimize();
        break;
      case 'maximize':
        extraWindow.setFullScreen(!extraWindow.isFullScreen());
        break;
      case 'close':
        extraWindow.close();
        extraWindow = null;
        break;
      default:
        break;
    }
  }
});

ipcMain.on('init-print-complete', (event, res) => {
  console.log('is init complete? ', res);
  if (res === 'ok' && printWindow && printData) {
    printWindow.webContents.send('print-data', printData);
  }
});

ipcMain.on('complete', (event, res) => {
  console.log('is loading data complete? ', res);
  if (res === 'ok' && printWindow) {
    const printers = mainWindow.webContents.getPrinters();
    const defaultPrinter = printers.find((printer) => printer.isDefault);
    if (defaultPrinter) {
      console.log(defaultPrinter);
      printWindow.webContents.print(
        { silent: true, printBackground: true, deviceName: defaultPrinter },

        (data) => {
          console.log('静默回调', data);
          mainWindow.webContents.send('hide-loading');
        }
      );
    } else {
      printWindow.webContents.print({ printBackground: true }, (data) => {
        console.log('回调', data);
        mainWindow.webContents.send('hide-loading');
      });
    }
  }
});