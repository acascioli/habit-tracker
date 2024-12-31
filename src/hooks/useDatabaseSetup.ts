import { useEffect } from "react";
import Database from "@tauri-apps/plugin-sql";
import { ask } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, create } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import useDBStore from "@/store/db";
import useSettingsStore from "@/store/settingsPath";

export function useDatabaseSetup() {
  const db = useDBStore((state) => state.db);
  const settingsDB = useDBStore((state) => state.settingsDB);
  const setDB = useDBStore((state) => state.setDB);
  const setSettingsDB = useDBStore((state) => state.setSettingsDB);
  const settingsPath = useSettingsStore((state) => state.settingsPath)

  useEffect(() => {
    if (!settingsPath) return;

    async function initializeDatabase() {
      const testPath = await path.join(settingsPath!, "db");
      const dbPath = await path.join(testPath, "my.db");
      const settingsDBPath = await path.join(testPath, "metrics.db");
      const folderExists = await exists(testPath);
      const dbExists = await exists(dbPath);
      const settingsDBExists = await exists(settingsDBPath);

      if (dbExists) {
        // await message("DB exists!", { title: "Config Folder" });
      } else {
        const createDB = await ask("DB does not exist. Create it?", {
          title: "Config Folder",
          kind: "warning",
        });

        if (createDB) {
          if (!folderExists) {
            await mkdir(testPath);
          }
          await create(dbPath);

          const db = await Database.load(`sqlite:${dbPath}`);
          await db.execute(`
            CREATE TABLE IF NOT EXISTS weights (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              weight REAL NOT NULL,
              date DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS kilometers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              km REAL NOT NULL,
              date DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS invoices (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              amount REAL NOT NULL,
              description TEXT,
              date DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          setDB(db);
        }
      }
      if (settingsDBExists) {
        // await message("DB exists!", { title: "Config Folder" });
      } else {
        const createDB = await ask("Settings DB does not exist. Create it?", {
          title: "Config Folder",
          kind: "warning",
        });

        if (createDB) {
          if (!folderExists) {
            await mkdir(testPath);
          }
          await create(settingsDBPath);

          const sDB = await Database.load(`sqlite:${settingsDBPath}`);
          await sDB.execute(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    kpi REAL NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

          setSettingsDB(sDB);
        }
      }
    }
    if (db == null || settingsDB == null) {
      initializeDatabase();
    }
  }, [settingsPath]);
}

