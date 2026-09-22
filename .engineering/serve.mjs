import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export async function serve(root) {
  root = path.resolve(root);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let target = path.resolve(root, '.' + pathname);
      if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
      try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); await stat(target); }
      catch {
        if (path.extname(pathname)) { response.writeHead(404).end(); return; }
        target = path.join(root, 'index.csr.html');
        try { await stat(target); } catch { target = path.join(root, 'index.html'); }
      }
      response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(await readFile(target));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
