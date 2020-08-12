import lowdb from 'lowdb';
import LodashId from 'lodash-id';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';
import fs from 'fs-extra';
import { app, remote } from 'electron';

const APP = process.type === 'renderer' ? remote.app : app;

const DB_PATH = APP.getPath('userData');

let _path = path.join(DB_PATH, '\\attachment');

if (!fs.pathExistsSync(_path)) {
  fs.mkdirpSync(_path);
}

// 返回db对象
var getDB = (filename, siteId) => {
  let dir = _path;
  if (!!siteId && siteId !== undefined) {
    dir = path.join(dir, `\\${siteId}`);
    if (!fs.pathExistsSync(dir)) {
      fs.mkdirpSync(dir);
    }
  }

  if (!!filename) {
    const adapter = new FileSync(path.join(dir, `/${filename}.json`));
    const db = lowdb(adapter);
    db._.mixin(LodashId);
    return db;
  }
};

var getPath = () => {
  return _path;
};

export default {
  getDB,
  getPath
};
