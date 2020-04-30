import { promises as fsp } from 'fs';
export async function fileExists(path: string) {
  try {
    await fsp.stat(path);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}
