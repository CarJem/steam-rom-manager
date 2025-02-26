import { VDF_ShortcutsItem } from "../models";
import { VDF_Error } from './vdf-error';
import { APP } from '../variables';
import * as steam from './helpers/steam';
import * as json from './helpers/json';
import * as file from './helpers/file';
import * as _ from "lodash";
import * as fs from 'fs-extra';
import * as path from 'path';

const shortcutsParser = require('steam-shortcut-editor');

export class VDF_ShortcutsFile {
  private fileData: any = undefined;
  private indexMap: { [appId: string]: number } = undefined;
  private extraneousAppIds: string[] = [];


  constructor(private filepath: string) { }

  private get lang() {
    return APP.lang.vdfFile;
  }

  get data(): VDF_ShortcutsItem[] {
    if (this.fileData === undefined)
      return undefined;
    else
      return this.fileData['shortcuts'];
  }

  set data(value: VDF_ShortcutsItem[]) {
    if (this.fileData === undefined)
      return;
    else
      this.fileData['shortcuts'] = value;
  }
  set extraneous(value: string[]) {
    this.extraneousAppIds = value;
  }
  get extraneous() {
    return this.extraneousAppIds;
  }

  get valid() {
    return this.fileData !== undefined;
  }

  get invalid() {
    return !this.valid;
  }

  read(skipIndexing: boolean = false) {
    return fs.readFile(this.filepath).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw new VDF_Error(APP.lang.vdfFile.error.readingVdf__i.interpolate({
          filePath: this.filepath,
          error: error
        }));
      }
    }).then((data) => {
      if (data)
        this.fileData = shortcutsParser.parseBuffer(data);
      else
        this.fileData = {};

      if (this.fileData['shortcuts'] === undefined)
        this.fileData['shortcuts'] = [];

      let shortcutsData = this.data;
      this.indexMap = {};

      if (!skipIndexing) {
        for (let i = 0; i < shortcutsData.length; i++) {
          let shortcut = shortcutsData[i];
          let exe = json.caseInsensitiveTraverse(shortcut, [['exe']]);
          let appname = json.caseInsensitiveTraverse(shortcut, [['appname']]);
          this.indexMap[steam.generateAppId(exe,appname)] = i;
        }
      }

      return this.data;
    }).catch((error) => {
      throw new VDF_Error(this.lang.error.corruptedVdf__i.interpolate({
        filePath: this.filepath,
        error
      }));
    });
  }

  write() {
    return Promise.resolve().then(() => {
      for(let j=0; j<this.extraneous.length; j++) {
        let exAppId = this.extraneous[j]
        if (this.indexMap[exAppId] !== undefined) {
          this.fileData['shortcuts'][this.indexMap[exAppId]] = undefined;
          this.indexMap[exAppId] = undefined;
        }
      }
      this.fileData['shortcuts'] = (this.fileData['shortcuts'] as VDF_ShortcutsItem[]).filter(item => item !== undefined);
      let data = shortcutsParser.writeBuffer(this.fileData);
      return fs.outputFile(this.filepath, data);
    }).catch((error) => {
      throw new VDF_Error(this.lang.error.writingVdf__i.interpolate({
        filePath: this.filepath,
        error: error
      }));
    });
  }

  backup(ext: string, overwrite: boolean = false) {
    return file.backup(this.filepath, ext, overwrite).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw new VDF_Error(this.lang.error.creatingBackup__i.interpolate({
          filePath: this.filepath,
          error: error
        }));
      }
    });
  }

  getItem(appId: string) {
    if (this.indexMap[appId] !== undefined)
      return this.fileData['shortcuts'][this.indexMap[appId]];
    else
      return undefined;
  }

  removeItem(appId: string) {
    if (this.indexMap[appId] !== undefined) {
      this.fileData['shortcuts'][this.indexMap[appId]] = undefined;
      this.indexMap[appId] = undefined;
    }
  }

  addItem(appId: string, value: VDF_ShortcutsItem) {
    if (this.indexMap[appId] === undefined) {
      this.fileData['shortcuts'].push(value);
      this.indexMap[appId] = this.fileData['shortcuts'].length - 1;
    }
  }

  getAppIds() {
    return Object.keys(this.indexMap);
  }
}
