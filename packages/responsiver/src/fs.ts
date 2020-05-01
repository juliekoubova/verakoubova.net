import { promises as fsp } from 'fs';
export async function fileExists(path: string): Promise<number> {
  try {
    const stat = await fsp.stat(path);
    return stat.size
  } catch (e) {
    if (e.code === 'ENOENT') {
      return 0;
    } else {
      throw e;
    }
  }
}
