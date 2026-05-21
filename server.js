const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID, createHash } = require('crypto');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const storageDir = path.join(rootDir, 'storage', 'guest-uploads');
const manifestPath = path.join(dataDir, 'guest-manifest.json');
const usersPath = path.join(dataDir, 'users.json');
const sessionsPath = path.join(dataDir, 'sessions.json');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(storageDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function ensureJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
}

function ensureStores() {
  ensureJsonFile(manifestPath, {
    files: [],
    shares: [],
    activity: [],
    workspace: {
      _id: 'local-workspace',
      name: 'فضای کاری محلی',
      storageQuotaBytes: 15 * 1024 * 1024 * 1024,
      members: [],
    },
  });
  ensureJsonFile(usersPath, []);
  ensureJsonFile(sessionsPath, []);
}

function readJsonFile(filePath) {
  ensureStores();
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function readManifest() {
  return readJsonFile(manifestPath);
}

function writeManifest(value) {
  writeJsonFile(manifestPath, value);
}

function readUsers() {
  return readJsonFile(usersPath);
}

function writeUsers(value) {
  writeJsonFile(usersPath, value);
}

function readSessions() {
  return readJsonFile(sessionsPath);
}

function writeSessions(value) {
  writeJsonFile(sessionsPath, value);
}

function safeJoin(base, target) {
  const targetPath = path.resolve(base, `.${target}`);
  if (!targetPath.startsWith(base)) return null;
  return targetPath;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function sha(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function nowIso() {
  return new Date().toISOString();
}

function formatLabel() {
  return 'همین حالا';
}

function toUserPayload(user) {
  return {
    id: user.id,
    _id: user.id,
    name: user.name,
    email: user.email,
    publicProfile: user.publicProfile,
  };
}

function issueSession(user) {
  const accessToken = `local-access-${randomUUID()}`;
  const refreshToken = `local-refresh-${randomUUID()}`;
  const sessions = readSessions().filter((entry) => entry.userId !== user.id);
  sessions.push({ userId: user.id, accessToken, refreshToken, createdAt: nowIso() });
  writeSessions(sessions);
  return { accessToken, refreshToken, user: toUserPayload(user) };
}

function getSessionFromRequest(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  return readSessions().find((entry) => entry.accessToken === token) || null;
}

function getUserFromRequest(req) {
  const session = getSessionFromRequest(req);
  if (!session) return null;
  return readUsers().find((user) => user.id === session.userId) || null;
}

function requireUser(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    sendJson(res, 401, { message: 'نشست کاربر معتبر نیست.' });
    return null;
  }
  return user;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > 80 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const raw = await readBody(req);
  if (!raw.length) return {};
  return JSON.parse(raw.toString('utf8'));
}

function sanitizeFileName(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 120) || 'file';
}

function extFromMime(mimeType) {
  if (!mimeType) return '';
  if (mimeType.includes('png')) return '.png';
  if (mimeType.includes('jpeg')) return '.jpg';
  if (mimeType.includes('gif')) return '.gif';
  if (mimeType.includes('webp')) return '.webp';
  if (mimeType.includes('pdf')) return '.pdf';
  if (mimeType.includes('mp4')) return '.mp4';
  if (mimeType.includes('mpeg')) return '.mp3';
  if (mimeType.includes('wav')) return '.wav';
  if (mimeType.includes('plain')) return '.txt';
  return '';
}

function createStoredFileRecord({ ownerId = null, name, mimeType, base64, parent = null, note = '', visibility = 'public' }) {
  const id = randomUUID();
  const originalName = String(name || 'upload').trim() || 'upload';
  const safeMimeType = String(mimeType || 'application/octet-stream');
  const ext = path.extname(originalName) || extFromMime(safeMimeType);
  const diskName = `${id}-${sanitizeFileName(path.basename(originalName, path.extname(originalName)))}${ext}`;
  const diskPath = path.join(storageDir, diskName);
  const buffer = Buffer.from(String(base64 || ''), 'base64');
  fs.writeFileSync(diskPath, buffer);
  return {
    _id: id,
    name: originalName,
    type: 'file',
    mimeType: safeMimeType,
    size: buffer.length,
    parent: parent || null,
    visibility,
    note: String(note || ''),
    ownerId,
    updatedAt: nowIso(),
    updatedAtLabel: 'همین حالا',
    storagePath: diskPath,
    diskName,
  };
}

function publicFileView(file) {
  return {
    _id: file._id,
    id: file._id,
    name: file.name,
    type: file.type,
    mimeType: file.mimeType,
    size: file.size,
    parent: file.parent || null,
    updatedAt: file.updatedAt,
    updatedAtLabel: file.updatedAtLabel || 'به تازگی',
    note: file.note || '',
    visibility: file.visibility || 'public',
    ownerId: file.ownerId,
    previewUrl: file.type === 'file' ? `/api/files/${file._id}/preview-content` : null,
  };
}

function recordActivity(action, message, actorName = 'سیستم') {
  const manifest = readManifest();
  manifest.activity.unshift({
    _id: randomUUID(),
    action,
    message,
    actorName,
    createdAt: nowIso(),
  });
  manifest.activity = manifest.activity.slice(0, 40);
  writeManifest(manifest);
}

function findActiveFile(manifest, id) {
  return manifest.files.find((file) => file._id === id && !file.deletedAt);
}

function removeDiskFile(file) {
  if (file?.storagePath && fs.existsSync(file.storagePath)) fs.unlinkSync(file.storagePath);
}

async function handleAuth(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    try {
      const body = await readJsonBody(req);
      const users = readUsers();
      if (users.find((user) => user.email.toLowerCase() === String(body.email || '').toLowerCase())) {
        return sendJson(res, 409, { message: 'این ایمیل قبلا ثبت شده است.' });
      }
      const user = {
        id: randomUUID(),
        name: String(body.name || 'کاربر جدید').trim() || 'کاربر جدید',
        email: String(body.email || '').trim().toLowerCase(),
        passwordHash: sha(String(body.password || '').trim()),
        publicProfile: {
          username: String((body.name || 'guest').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'guest'),
          isPublic: true,
          bio: 'پروفایل عمومی شما بعد از اولین انتشار فایل اینجا نمایش داده می شود.',
        },
      };
      users.push(user);
      writeUsers(users);
      return sendJson(res, 201, issueSession(user));
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    try {
      const body = await readJsonBody(req);
      const user = readUsers().find((entry) => entry.email === String(body.email || '').trim().toLowerCase());
      const incomingPassword = String(body.password || '');
      const validPassword = user && (user.passwordHash === sha(incomingPassword) || user.passwordHash === sha(incomingPassword.trim()));
      if (!user || !validPassword) {
        return sendJson(res, 401, { message: 'ایمیل یا رمز عبور درست نیست.' });
      }
      return sendJson(res, 200, issueSession(user));
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/refresh') {
    try {
      const body = await readJsonBody(req);
      const sessions = readSessions();
      const session = sessions.find((entry) => entry.refreshToken === body.refreshToken);
      if (!session) return sendJson(res, 401, { message: 'نشست قابل بازیابی نبود.' });
      const user = readUsers().find((entry) => entry.id === session.userId);
      if (!user) return sendJson(res, 401, { message: 'کاربر پیدا نشد.' });
      return sendJson(res, 200, issueSession(user));
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  return false;
}

async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname.startsWith('/api/auth/')) return handleAuth(req, res, url);

  if (url.pathname === '/api/dashboard/summary' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return true;
    const manifest = readManifest();
    const files = manifest.files.filter((file) => !file.deletedAt && file.ownerId === user.id);
    const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
    return sendJson(res, 200, {
      storage: { fileCount: files.filter((file) => file.type === 'file').length, totalBytes },
      workspaces: [manifest.workspace],
      recentFiles: files.slice(0, 6).map(publicFileView),
      recentActivity: manifest.activity.slice(0, 6),
    });
  }

  if (url.pathname === '/api/workspaces' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return true;
    const manifest = readManifest();
    const workspace = {
      ...manifest.workspace,
      members: [
        { user: user.id, role: 'owner' },
        ...(manifest.workspace.members || []).filter((entry) => entry.user !== user.id),
      ],
    };
    return sendJson(res, 200, { items: [workspace] });
  }

  if (url.pathname === '/api/workspaces' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    manifest.workspace.name = String(body.name || manifest.workspace.name).trim() || manifest.workspace.name;
    writeManifest(manifest);
    recordActivity('workspace', `فضای کاری «${manifest.workspace.name}» به روز شد.`, user.name);
    return sendJson(res, 201, manifest.workspace);
  }

  const activityMatch = url.pathname.match(/^\/api\/workspaces\/([^/]+)\/activity$/);
  if (activityMatch && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return true;
    return sendJson(res, 200, { items: readManifest().activity });
  }

  const inviteMatch = url.pathname.match(/^\/api\/workspaces\/([^/]+)\/invites$/);
  if (inviteMatch && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    manifest.workspace.members.push({ user: body.userId || randomUUID(), role: body.role || 'viewer', invitedBy: user.id });
    writeManifest(manifest);
    recordActivity('invite', `دعوت جدید برای نقش ${body.role || 'viewer'} ارسال شد.`, user.name);
    return sendJson(res, 200, manifest.workspace);
  }

  if (url.pathname === '/api/files' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return true;
    const parent = url.searchParams.get('parent');
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
    const manifest = readManifest();
    const items = manifest.files
      .filter((file) => !file.deletedAt && file.ownerId === user.id)
      .filter((file) => (q ? [file.name, file.mimeType, file.note || ''].join(' ').toLowerCase().includes(q) : String(file.parent || '') === String(parent || '')))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(publicFileView);
    return sendJson(res, 200, { items, nextCursor: null });
  }

  if (url.pathname === '/api/files/folders' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    const folder = {
      _id: randomUUID(),
      name: String(body.name || 'پوشه جدید').trim() || 'پوشه جدید',
      type: 'folder',
      mimeType: 'folder',
      size: 0,
      parent: body.parent || null,
      visibility: 'public',
      note: '',
      ownerId: user.id,
      updatedAt: nowIso(),
      updatedAtLabel: 'همین حالا',
    };
    manifest.files.unshift(folder);
    writeManifest(manifest);
    recordActivity('folder', `پوشه «${folder.name}» ساخته شد.`, user.name);
    return sendJson(res, 201, folder);
  }

  if (url.pathname === '/api/files/upload' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    if (!body.base64) return sendJson(res, 400, { message: 'محتوای فایل برای آپلود ارسال نشده است.' });
    const manifest = readManifest();
    const file = createStoredFileRecord({
      ownerId: user.id,
      name: body.name,
      mimeType: body.mimeType,
      base64: body.base64,
      parent: body.parent || null,
      note: body.note || '',
      visibility: body.visibility || 'public',
    });
    manifest.files.unshift(file);
    writeManifest(manifest);
    recordActivity('upload', `فایل «${file.name}» آپلود شد.`, user.name);
    return sendJson(res, 201, { item: publicFileView(file) });
  }

  const renameMatch = url.pathname.match(/^\/api\/files\/([^/]+)\/rename$/);
  if (renameMatch && req.method === 'PATCH') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    const file = findActiveFile(manifest, renameMatch[1]);
    if (!file || file.ownerId !== user.id) return sendJson(res, 404, { message: 'File not found.' });
    file.name = String(body.name || file.name).trim() || file.name;
    file.updatedAt = nowIso();
    file.updatedAtLabel = formatLabel();
    writeManifest(manifest);
    recordActivity('rename', `نام «${file.name}» به روز شد.`, user.name);
    return sendJson(res, 200, publicFileView(file));
  }

  const moveMatch = url.pathname.match(/^\/api\/files\/([^/]+)\/move$/);
  if (moveMatch && req.method === 'PATCH') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    const file = findActiveFile(manifest, moveMatch[1]);
    if (!file || file.ownerId !== user.id) return sendJson(res, 404, { message: 'File not found.' });
    file.parent = body.parent || null;
    file.updatedAt = nowIso();
    file.updatedAtLabel = formatLabel();
    writeManifest(manifest);
    recordActivity('move', `فایل «${file.name}» جابجا شد.`, user.name);
    return sendJson(res, 200, publicFileView(file));
  }

  const previewMatch = url.pathname.match(/^\/api\/files\/([^/]+)\/preview$/);
  if (previewMatch && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return true;
    const manifest = readManifest();
    const file = findActiveFile(manifest, previewMatch[1]);
    if (!file || file.ownerId !== user.id) return sendJson(res, 404, { message: 'File not found.' });
    return sendJson(res, 200, { url: `/api/files/${file._id}/preview-content`, mimeType: file.mimeType, name: file.name });
  }

  const previewContentMatch = url.pathname.match(/^\/api\/files\/([^/]+)\/preview-content$/);
  if (previewContentMatch && req.method === 'GET') {
    const manifest = readManifest();
    const file = findActiveFile(manifest, previewContentMatch[1]);
    if (!file || file.type !== 'file' || !file.storagePath || !fs.existsSync(file.storagePath)) return sendJson(res, 404, { message: 'File not found.' });
    res.writeHead(200, { 'Content-Type': file.mimeType || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file.storagePath).pipe(res);
    return true;
  }

  const fileDeleteMatch = url.pathname.match(/^\/api\/files\/([^/]+)$/);
  if (fileDeleteMatch && req.method === 'DELETE') {
    const user = requireUser(req, res);
    if (!user) return true;
    const manifest = readManifest();
    const file = findActiveFile(manifest, fileDeleteMatch[1]);
    if (!file || file.ownerId !== user.id) return sendJson(res, 404, { message: 'File not found.' });
    file.deletedAt = nowIso();
    removeDiskFile(file);
    writeManifest(manifest);
    recordActivity('delete', `فایل «${file.name}» حذف شد.`, user.name);
    return sendJson(res, 200, { ok: true });
  }

  const shareCreateMatch = url.pathname.match(/^\/api\/files\/([^/]+)\/share$/);
  if (shareCreateMatch && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return true;
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    const file = findActiveFile(manifest, shareCreateMatch[1]);
    if (!file || file.ownerId !== user.id) return sendJson(res, 404, { message: 'File not found.' });
    const token = randomUUID().slice(0, 10);
    const share = {
      token,
      fileId: file._id,
      password: body.password || '',
      downloadLimit: Number.isFinite(body.downloadLimit) ? body.downloadLimit : 25,
      expiresAt: body.expiresAt || null,
      createdAt: nowIso(),
      downloads: 0,
    };
    manifest.shares.unshift(share);
    writeManifest(manifest);
    recordActivity('share', `لینک اشتراک برای «${file.name}» ساخته شد.`, user.name);
    return sendJson(res, 201, {
      url: `/share/demo/?token=${token}&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.mimeType || 'application/octet-stream')}&size=${file.size}`,
      token,
      qrCodeDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="32" fill="white"/><rect x="28" y="28" width="56" height="56" fill="black"/><rect x="156" y="28" width="56" height="56" fill="black"/><rect x="28" y="156" width="56" height="56" fill="black"/><rect x="108" y="108" width="24" height="24" fill="black"/><rect x="136" y="108" width="24" height="24" fill="black"/><rect x="108" y="136" width="24" height="24" fill="black"/><rect x="164" y="108" width="20" height="20" fill="black"/><rect x="136" y="164" width="48" height="20" fill="black"/></svg>',
      expiresAt: share.expiresAt,
    });
  }

  const shareResolveMatch = url.pathname.match(/^\/api\/share\/([^/]+)\/resolve$/);
  if (shareResolveMatch && req.method === 'POST') {
    const body = await readJsonBody(req).catch((error) => ({ __error: error.message }));
    if (body.__error) return sendJson(res, 400, { message: body.__error });
    const manifest = readManifest();
    const share = manifest.shares.find((entry) => entry.token === shareResolveMatch[1]);
    if (!share) return sendJson(res, 404, { message: 'Share link not found.' });
    if (share.password && share.password !== String(body.password || '')) return sendJson(res, 401, { message: 'Password is incorrect.' });
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) return sendJson(res, 410, { message: 'Share link expired.' });
    if (share.downloadLimit && share.downloads >= share.downloadLimit) return sendJson(res, 429, { message: 'Download limit reached.' });
    const file = findActiveFile(manifest, share.fileId);
    if (!file) return sendJson(res, 404, { message: 'File not found.' });
    share.downloads += 1;
    writeManifest(manifest);
    return sendJson(res, 200, {
      file: publicFileView(file),
      previewUrl: `/api/files/${file._id}/preview-content`,
      qrCodeDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="32" fill="white"/><rect x="28" y="28" width="56" height="56" fill="black"/><rect x="156" y="28" width="56" height="56" fill="black"/><rect x="28" y="156" width="56" height="56" fill="black"/><rect x="108" y="108" width="24" height="24" fill="black"/><rect x="136" y="108" width="24" height="24" fill="black"/><rect x="108" y="136" width="24" height="24" fill="black"/><rect x="164" y="108" width="20" height="20" fill="black"/><rect x="136" y="164" width="48" height="20" fill="black"/></svg>',
    });
  }

  const profileMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)$/);
  if (profileMatch && req.method === 'GET') {
    const username = profileMatch[1];
    const user = readUsers().find((entry) => entry.publicProfile?.username === username);
    if (!user) return sendJson(res, 404, { message: 'Public profile not found.' });
    const files = readManifest().files.filter((file) => !file.deletedAt && file.ownerId === user.id && (file.visibility || 'public') === 'public').map(publicFileView);
    return sendJson(res, 200, { user: toUserPayload(user), files });
  }

  return false;
}

function handleGuestApi(req, res, url) {
  const pathname = url.pathname;

  if (pathname === '/vanilla-api/health' && req.method === 'GET') return sendJson(res, 200, { ok: true, app: 'fvplace-vanilla-guest-api' });

  if (pathname === '/vanilla-api/profile/guest' && req.method === 'GET') {
    const manifest = readManifest();
    const files = manifest.files.filter((file) => file.type === 'file' && !file.deletedAt && (file.visibility || 'public') === 'public' && !file.ownerId).map(publicFileView);
    return sendJson(res, 200, {
      profile: {
        username: 'guest',
        name: 'مهمان',
        bio: 'هر فایلی که در حالت مهمان آپلود می کنید، روی فضای ذخیره سازی محلی همین سرور نگهداری می شود.',
        isPublic: true,
      },
      files,
    });
  }

  if (pathname === '/vanilla-api/files' && req.method === 'GET') {
    const parent = url.searchParams.get('parent');
    const items = readManifest().files.filter((file) => !file.deletedAt && !file.ownerId && (parent ? String(file.parent || '') === String(parent) : true)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(publicFileView);
    return sendJson(res, 200, { items });
  }

  if (pathname === '/vanilla-api/files/folders' && req.method === 'POST') {
    return readJsonBody(req).then((body) => {
      const manifest = readManifest();
      const folder = {
        _id: randomUUID(),
        name: String(body.name || 'پوشه جدید').trim() || 'پوشه جدید',
        type: 'folder',
        mimeType: 'folder',
        size: 0,
        parent: body.parent || null,
        visibility: 'public',
        note: '',
        updatedAt: nowIso(),
        updatedAtLabel: 'همین حالا',
      };
      manifest.files.unshift(folder);
      writeManifest(manifest);
      recordActivity('folder', `پوشه «${folder.name}» در حالت مهمان ساخته شد.`);
      sendJson(res, 201, folder);
    }).catch((error) => sendJson(res, 400, { message: error.message }));
  }

  if (pathname === '/vanilla-api/upload' && req.method === 'POST') {
    return readJsonBody(req).then((body) => {
      const manifest = readManifest();
      const file = createStoredFileRecord({
        name: body.name,
        mimeType: body.mimeType,
        base64: body.base64,
        parent: body.parent || null,
        note: body.note || '',
        visibility: 'public',
      });
      manifest.files.unshift(file);
      writeManifest(manifest);
      recordActivity('upload', `فایل «${file.name}» در حالت مهمان آپلود شد.`);
      sendJson(res, 201, { item: publicFileView(file) });
    }).catch((error) => sendJson(res, 400, { message: error.message }));
  }

  const renameMatch = pathname.match(/^\/vanilla-api\/files\/([^/]+)\/rename$/);
  if (renameMatch && req.method === 'PATCH') {
    return readJsonBody(req).then((body) => {
      const manifest = readManifest();
      const file = findActiveFile(manifest, renameMatch[1]);
      if (!file || file.ownerId) return sendJson(res, 404, { message: 'File not found.' });
      file.name = String(body.name || file.name).trim() || file.name;
      file.updatedAt = nowIso();
      file.updatedAtLabel = formatLabel();
      writeManifest(manifest);
      sendJson(res, 200, publicFileView(file));
    }).catch((error) => sendJson(res, 400, { message: error.message }));
  }

  const moveMatch = pathname.match(/^\/vanilla-api\/files\/([^/]+)\/move$/);
  if (moveMatch && req.method === 'PATCH') {
    return readJsonBody(req).then((body) => {
      const manifest = readManifest();
      const file = findActiveFile(manifest, moveMatch[1]);
      if (!file || file.ownerId) return sendJson(res, 404, { message: 'File not found.' });
      file.parent = body.parent || null;
      file.updatedAt = nowIso();
      file.updatedAtLabel = formatLabel();
      writeManifest(manifest);
      sendJson(res, 200, publicFileView(file));
    }).catch((error) => sendJson(res, 400, { message: error.message }));
  }

  const contentMatch = pathname.match(/^\/vanilla-api\/files\/([^/]+)\/content$/);
  if (contentMatch && req.method === 'GET') {
    const file = findActiveFile(readManifest(), contentMatch[1]);
    if (!file || file.type !== 'file' || !file.storagePath || !fs.existsSync(file.storagePath)) return sendJson(res, 404, { message: 'File not found.' });
    res.writeHead(200, { 'Content-Type': file.mimeType || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file.storagePath).pipe(res);
    return true;
  }

  const deleteMatch = pathname.match(/^\/vanilla-api\/files\/([^/]+)$/);
  if (deleteMatch && req.method === 'DELETE') {
    const manifest = readManifest();
    const file = findActiveFile(manifest, deleteMatch[1]);
    if (!file || file.ownerId) return sendJson(res, 404, { message: 'File not found.' });
    file.deletedAt = nowIso();
    removeDiskFile(file);
    writeManifest(manifest);
    return sendJson(res, 200, { ok: true });
  }

  const guestShareCreateMatch = pathname.match(/^\/vanilla-api\/files\/([^/]+)\/share$/);
  if (guestShareCreateMatch && req.method === 'POST') {
    return readJsonBody(req).then((body) => {
      const manifest = readManifest();
      const file = findActiveFile(manifest, guestShareCreateMatch[1]);
      if (!file || file.ownerId) return sendJson(res, 404, { message: 'File not found.' });
      const token = randomUUID().slice(0, 10);
      const share = {
        token,
        fileId: file._id,
        password: body.password || '',
        downloadLimit: Number.isFinite(body.downloadLimit) ? body.downloadLimit : 25,
        expiresAt: body.expiresAt || null,
        createdAt: nowIso(),
        downloads: 0,
      };
      manifest.shares.unshift(share);
      writeManifest(manifest);
      recordActivity('share', `لینک اشتراک برای «${file.name}» در حالت مهمان ساخته شد.`);
      return sendJson(res, 201, {
        url: `/share/demo/?token=${token}`,
        token,
        qrCodeDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="32" fill="white"/><rect x="28" y="28" width="56" height="56" fill="black"/><rect x="156" y="28" width="56" height="56" fill="black"/><rect x="28" y="156" width="56" height="56" fill="black"/><rect x="108" y="108" width="24" height="24" fill="black"/><rect x="136" y="108" width="24" height="24" fill="black"/><rect x="108" y="136" width="24" height="24" fill="black"/><rect x="164" y="108" width="20" height="20" fill="black"/><rect x="136" y="164" width="48" height="20" fill="black"/></svg>',
        expiresAt: share.expiresAt,
      });
    }).catch((error) => sendJson(res, 400, { message: error.message }));
  }

  return sendJson(res, 404, { message: 'Guest API route not found.' });
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.createReadStream(filePath)
    .on('error', () => sendText(res, 500, 'Internal Server Error'))
    .once('open', () => {
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
    })
    .pipe(res);
}

function resolveRequestPath(urlPath) {
  const normalizedPath = decodeURIComponent(urlPath.split('?')[0]);
  const requested = safeJoin(rootDir, normalizedPath);
  if (!requested) return null;
  const candidates = [requested];
  if (normalizedPath.endsWith('/')) candidates.push(path.join(requested, 'index.html'));
  else if (!path.extname(requested)) candidates.push(`${requested}.html`, path.join(requested, 'index.html'));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return sendJson(res, 200, { ok: true, app: 'fvplace-vanilla' });
  if (url.pathname.startsWith('/vanilla-api/')) return handleGuestApi(req, res, url);
  if (url.pathname.startsWith('/api/')) {
    const handled = await handleApi(req, res, url);
    if (handled !== false) return;
  }
  const filePath = resolveRequestPath(req.url || '/');
  if (!filePath) {
    const fallback = path.join(rootDir, 'index.html');
    if (fs.existsSync(fallback)) return sendFile(fallback, res);
    return sendText(res, 404, 'Not Found');
  }
  sendFile(filePath, res);
});

server.listen(port, host, () => {
  console.log(`FVPlace Vanilla running at http://${host}:${port}`);
});
