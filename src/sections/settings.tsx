import { Button } from '@/components/ui/button';
import { ask, message, open } from '@tauri-apps/plugin-dialog';

import { load, Store } from '@tauri-apps/plugin-store';

import { useEffect, useState } from 'react';

import { create, exists, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import Database from '@tauri-apps/plugin-sql';

// Define the store keys and types
interface StoreSchema {
  'setting-path': string | null;
}

export default function SettingsPage() {

  const [store, setStore] = useState<Store | null>(null);
  const [settingPath, setSettingPath] = useState<string | null>(null);

  // Load the store and check for "setting-path"
  useEffect(() => {
    async function initializeStore() {
      const loadedStore = await load('store.json', { autoSave: false });
      setStore(loadedStore);

      const path = await loadedStore.get<StoreSchema['setting-path']>('setting-path');
      if (path) {
        setSettingPath(path);
      } else {
        await promptForSettingPath(loadedStore);
      }
    }

    initializeStore();
  }, []);

  // Prompt the user to select a folder and save it
  async function promptForSettingPath(loadedStore = store) {
    const selectedPath = await open({ directory: true });
    if (selectedPath && typeof selectedPath === 'string') {
      await loadedStore!.set('setting-path', selectedPath);
      await loadedStore!.save();
      setSettingPath(selectedPath);
    } else {
      console.warn('No folder selected.');
    }
  }

  // Handle manual change of setting path
  async function handleChangeSettingPath() {
    await promptForSettingPath();
  }

  async function handleFileClick() {
    if (settingPath) {
      const testPath = await path.join(settingPath, 'test')
      const dbPath = await path.join(testPath, 'my.db');
      const folderExists = await exists(testPath)
      const dbExists = await exists(dbPath)

      if (dbExists) {
        await message('DB exists!', {
          title: 'Config Folder'
        })
      }
      else {
        const answer = await ask('DB does not exist. Create it?', {
          title: 'Config Folder',
          kind: 'warning',
        });
        if (answer && folderExists) {
          const file = await create(dbPath)
        }
        else if (answer && !folderExists) {
          await mkdir(testPath)
          const file = await create(dbPath)
        }

        const db = await Database.load(`sqlite:${dbPath}`);
        // Create the tables if they don't exist
        await db.execute(`
      CREATE TABLE IF NOT EXISTS weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight REAL NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS kilometers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        km REAL NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
      }
    }
  }

  return (
    <div className="space-y-4 flex flex-col items-center justify-center">
      <div>
        <p className='font-semibold'>Current Path:</p>
        {settingPath ? settingPath : 'Loading...'}</div>
      <div className='space-x-4'>
        <Button onClick={
          handleFileClick
        } variant="outline">
          Test Config
        </Button>

        <Button onClick={handleChangeSettingPath} >
          Change Setting Path
        </Button>
      </div>
    </div>
  );
}
