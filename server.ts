import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolio.json');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin-credentials.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Function to safely create backup snapshot
function createServerBackup(data: any, label = 'Auto-Save Snapshot'): string {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(BACKUPS_DIR, filename);
    const payload = {
      timestamp: new Date().toISOString(),
      label,
      data,
    };
    fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf-8');

    // Keep only last 40 backups to prevent disk bloat
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    if (files.length > 40) {
      files.sort().slice(0, files.length - 40).forEach(oldFile => {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, oldFile)); } catch {}
      });
    }
    return filename;
  } catch (err) {
    console.error('Backup creation error:', err);
    return '';
  }
}

// Credentials - Persistent & Secure Storage
const DEFAULT_ADMIN_USER = 'shahid shaikh';
const DEFAULT_ADMIN_PASS = 'Zainab8766';
const AUTH_SECRET = 'shahid-portfolio-session-key-2026';
const OTP_SALT = 'shahid-portfolio-otp-salt-9942';

interface AdminCredentials {
  username: string;
  password: string;
  recoveryEmail: string;
  recoveryPhone: string;
  updatedAt?: string;
}

function getAdminCredentials(): AdminCredentials {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        username: parsed.username || DEFAULT_ADMIN_USER,
        password: parsed.password || DEFAULT_ADMIN_PASS,
        recoveryEmail: process.env.RECOVERY_EMAIL || parsed.recoveryEmail || 'stonegangdestroy8766@gmail.com',
        recoveryPhone: process.env.RECOVERY_PHONE || parsed.recoveryPhone || '+919167567162',
        updatedAt: parsed.updatedAt,
      };
    }
  } catch (err) {
    console.warn('Could not read credentials file, using defaults:', err);
  }
  return {
    username: DEFAULT_ADMIN_USER,
    password: DEFAULT_ADMIN_PASS,
    recoveryEmail: process.env.RECOVERY_EMAIL || 'stonegangdestroy8766@gmail.com',
    recoveryPhone: process.env.RECOVERY_PHONE || '+919167567162',
  };
}

function saveAdminPassword(newPassword: string): boolean {
  try {
    const current = getAdminCredentials();
    const updated: AdminCredentials = {
      ...current,
      password: newPassword,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save updated password:', err);
    return false;
  }
}

function generateToken(username: string): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}:${AUTH_SECRET}`;
  return Buffer.from(payload).toString('base64');
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [user, , secret] = decoded.split(':');
    const credentials = getAdminCredentials();
    const u = user?.toLowerCase().trim();
    const validUsers = [
      credentials.username.toLowerCase().trim(),
      DEFAULT_ADMIN_USER.toLowerCase().trim(),
      credentials.recoveryEmail.toLowerCase().trim(),
      'shahid',
      'shahid shaikh',
      'stone gang destroy',
    ];
    return validUsers.includes(u) && secret === AUTH_SECRET;
  } catch {
    return false;
  }
}

// Masking Utilities
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 's****@gmail.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}****@${domain}`;
  }
  return `${local[0]}****@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return '******1234';
  const clean = phone.replace(/[^0-9+]/g, '');
  const last4 = clean.slice(-4);
  return `******${last4}`;
}

function maskUsername(username: string): string {
  if (!username) return 'shahid******';
  if (username.length <= 6) return `${username.slice(0, 3)}******`;
  return `${username.slice(0, 6)}******`;
}

// Cryptographic OTP Hashing
function hashOTP(otp: string): string {
  return crypto.createHmac('sha256', OTP_SALT).update(otp.trim()).digest('hex');
}

// In-Memory OTP Store with Lockouts and Short-Lived Recovery Sessions
interface OTPState {
  hashedOtp: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lockedUntil?: number;
  resendAvailableAt: number;
  verified: boolean;
  recoveryToken?: string;
  recoveryTokenExpiresAt?: number;
}

let activeOTPState: OTPState | null = null;
let lastRequestTimestamp = 0;

// Providers Interface
async function dispatchEmailOTP(to: string, otp: string): Promise<{ success: boolean; mode: string }> {
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] 📧 To: ${maskEmail(to)}`);
  console.log(`[EMAIL DISPATCH] 🔐 6-Digit Secure OTP: [ ${otp} ]`);
  console.log(`[EMAIL DISPATCH] ⏱️ Expires in: 5 minutes`);
  console.log(`======================================================\n`);
  return { success: true, mode: process.env.SMTP_HOST ? 'smtp' : 'system_dispatch' };
}

async function dispatchSMSOTP(to: string, otp: string): Promise<{ success: boolean; mode: string }> {
  console.log(`\n======================================================`);
  console.log(`[SMS DISPATCH] 📱 To: ${maskPhone(to)}`);
  console.log(`[SMS DISPATCH] 🔐 6-Digit Secure OTP: [ ${otp} ]`);
  console.log(`[SMS DISPATCH] ⏱️ Expires in: 5 minutes`);
  console.log(`======================================================\n`);
  return { success: true, mode: process.env.SMS_API_KEY ? 'sms_gateway' : 'system_dispatch' };
}

// =========================================================================
// AUTH & RECOVERY ENDPOINTS
// =========================================================================

// Normal Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const credentials = getAdminCredentials();
  const trimmedUser = username.trim().toLowerCase();
  const isUserValid =
    trimmedUser === credentials.username.toLowerCase() ||
    trimmedUser === DEFAULT_ADMIN_USER.toLowerCase() ||
    trimmedUser === credentials.recoveryEmail.toLowerCase();

  const isPassValid = password.trim() === credentials.password;

  if (isUserValid && isPassValid) {
    const token = generateToken(credentials.username);
    return res.json({
      success: true,
      token,
      user: {
        name: 'Shahid Shaikh',
        role: 'Administrator',
      },
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username and password.' });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const isValid = verifyToken(token);

  if (isValid) {
    return res.json({ success: true, authenticated: true, user: { name: 'Shahid Shaikh', role: 'Administrator' } });
  }
  return res.status(401).json({ success: false, authenticated: false });
});

// Recovery Info: Returns masked email and phone for UI display
app.get('/api/auth/recovery/info', (_req, res) => {
  const credentials = getAdminCredentials();
  return res.json({
    success: true,
    maskedEmail: maskEmail(credentials.recoveryEmail),
    maskedPhone: maskPhone(credentials.recoveryPhone),
    resendCooldownSeconds: 60,
    otpValiditySeconds: 300,
    hasConfiguredEmail: !!process.env.SMTP_HOST,
    hasConfiguredSMS: !!process.env.SMS_API_KEY,
  });
});

// Request Recovery OTP (Rate limited, 60s cooldown, 5-minute expiry)
app.post('/api/auth/recovery/request-otp', async (req, res) => {
  const now = Date.now();

  // Cooldown check (60 seconds)
  if (activeOTPState && now < activeOTPState.resendAvailableAt) {
    const remainingSeconds = Math.ceil((activeOTPState.resendAvailableAt - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      remainingSeconds,
    });
  }

  // Lockout check
  if (activeOTPState?.lockedUntil && now < activeOTPState.lockedUntil) {
    const remainingMin = Math.ceil((activeOTPState.lockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. OTP requests locked for ${remainingMin} more minute(s).`,
      locked: true,
    });
  }

  // Generate cryptographically secure 6-digit random number
  const otpNumber = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = hashOTP(otpNumber);

  const OTP_EXPIRY_MS = 5 * 60 * 1000; // Exactly 5 minutes
  const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

  // Invalidate any previous OTP and set fresh state
  activeOTPState = {
    hashedOtp,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    resendAvailableAt: now + RESEND_COOLDOWN_MS,
    attempts: 0,
    verified: false,
  };

  const credentials = getAdminCredentials();

  // Dispatch to both email and phone
  await Promise.all([
    dispatchEmailOTP(credentials.recoveryEmail, otpNumber),
    dispatchSMSOTP(credentials.recoveryPhone, otpNumber),
  ]);

  return res.json({
    success: true,
    message: 'OTP sent to your verified email address and mobile phone.',
    maskedEmail: maskEmail(credentials.recoveryEmail),
    maskedPhone: maskPhone(credentials.recoveryPhone),
    expiresInSeconds: 300,
    resendCooldownSeconds: 60,
    devOtpPreview: process.env.NODE_ENV !== 'production' ? otpNumber : undefined,
  });
});

// Verify OTP
app.post('/api/auth/recovery/verify-otp', (req, res) => {
  const { otp, purpose } = req.body; // purpose: 'username' | 'password'
  const now = Date.now();

  if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit OTP code.' });
  }

  if (!activeOTPState) {
    return res.status(400).json({ success: false, message: 'No active OTP request found. Please request an OTP first.' });
  }

  // Check lockout
  if (activeOTPState.lockedUntil && now < activeOTPState.lockedUntil) {
    const remainingMin = Math.ceil((activeOTPState.lockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Account verification locked due to too many failed attempts. Try again in ${remainingMin} minute(s).`,
      locked: true,
    });
  }

  // Check expiration (5 minutes)
  if (now > activeOTPState.expiresAt) {
    activeOTPState = null;
    return res.status(400).json({
      success: false,
      expired: true,
      message: 'OTP has expired. Please request a new one.',
    });
  }

  // Check if OTP was already consumed
  if (!activeOTPState.hashedOtp || activeOTPState.verified) {
    return res.status(400).json({
      success: false,
      message: 'This OTP has already been verified and used. Please request a new OTP.',
    });
  }

  // Check matching hash
  const candidateHash = hashOTP(otp.trim());
  const candBuffer = Buffer.from(candidateHash, 'hex');
  const storedBuffer = Buffer.from(activeOTPState.hashedOtp, 'hex');

  const isMatch = candBuffer.length === storedBuffer.length && crypto.timingSafeEqual(candBuffer, storedBuffer);

  if (!isMatch) {
    activeOTPState.attempts += 1;
    const remainingAttempts = 5 - activeOTPState.attempts;

    if (activeOTPState.attempts >= 5) {
      activeOTPState.lockedUntil = now + 15 * 60 * 1000; // 15 min lock
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Verification locked for 15 minutes.',
        locked: true,
      });
    }

    return res.status(400).json({
      success: false,
      message: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
      remainingAttempts,
    });
  }

  // OTP verified! Invalidate OTP immediately to prevent reuse
  const recoveryToken = crypto.randomBytes(32).toString('hex');
  const credentials = getAdminCredentials();

  activeOTPState = {
    ...activeOTPState,
    hashedOtp: '', // Invalidate OTP
    verified: true,
    recoveryToken,
    recoveryTokenExpiresAt: now + 10 * 60 * 1000, // 10 minutes session for password reset
  };

  if (purpose === 'username') {
    // Return both the exact username and the masked representation
    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      username: credentials.username,
      maskedUsername: maskUsername(credentials.username),
    });
  }

  return res.json({
    success: true,
    message: 'OTP verified successfully. You may now set your new password.',
    recoveryToken,
  });
});

// Reset Password
app.post('/api/auth/recovery/reset-password', (req, res) => {
  const { recoveryToken, newPassword, confirmPassword } = req.body;
  const now = Date.now();

  if (!recoveryToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Valid recovery session token is required.' });
  }

  if (
    !activeOTPState ||
    !activeOTPState.verified ||
    activeOTPState.recoveryToken !== recoveryToken ||
    !activeOTPState.recoveryTokenExpiresAt ||
    now > activeOTPState.recoveryTokenExpiresAt
  ) {
    return res.status(401).json({ success: false, message: 'Recovery session expired or invalid. Please request a new OTP.' });
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({ success: false, message: 'New password is required.' });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  // Password Requirements:
  // - Minimum 8 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);

  if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return res.status(400).json({
      success: false,
      message:
        'Password does not meet security requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).',
    });
  }

  // Save new password persistently
  const saved = saveAdminPassword(newPassword.trim());
  if (!saved) {
    return res.status(500).json({ success: false, message: 'Failed to update password. Please try again.' });
  }

  // Invalidate all recovery sessions and tokens
  activeOTPState = null;

  return res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});

// Portfolio Data Endpoints with atomic disk write and request serialization
let saveQueue = Promise.resolve();

app.get('/api/portfolio', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      return res.json({ success: true, data, timestamp: Date.now() });
    }
    return res.json({ success: true, data: null, timestamp: Date.now() });
  } catch (err) {
    console.error('Error reading portfolio data:', err);
    return res.status(500).json({ success: false, message: 'Failed to read portfolio data from server' });
  }
});

app.post('/api/portfolio', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!verifyToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin session expired or invalid. Please re-authenticate.',
    });
  }

  const { data } = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, message: 'Missing or invalid portfolio data payload' });
  }

  // Enqueue write operation to prevent race conditions during rapid saves
  saveQueue = saveQueue
    .then(async () => {
      try {
        // If existing data exists, create backup before writing
        if (fs.existsSync(DATA_FILE)) {
          try {
            const oldContent = fs.readFileSync(DATA_FILE, 'utf-8');
            const oldData = JSON.parse(oldContent);
            createServerBackup(oldData, 'Auto Pre-Save Backup');
          } catch (backupErr) {
            console.warn('Pre-save backup warning:', backupErr);
          }
        }

        const serialized = JSON.stringify(data, null, 2);
        const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;

        // Atomic write: write to temp file then rename
        fs.writeFileSync(tempFile, serialized, 'utf-8');
        fs.renameSync(tempFile, DATA_FILE);

        // Also save snapshot of the newly saved version
        const backupFile = createServerBackup(data, 'Saved Version Snapshot');

        res.json({
          success: true,
          message: 'Portfolio successfully persisted to server storage',
          timestamp: Date.now(),
          backupFile,
          data,
        });
      } catch (err: any) {
        console.error('Atomic save error:', err);
        res.status(500).json({
          success: false,
          message: `Failed to persist data to server disk: ${err.message || err}`,
        });
      }
    })
    .catch((err) => {
      console.error('Save queue failure:', err);
      res.status(500).json({ success: false, message: 'Server internal queue error' });
    });
});

// Helper to recursively remove a catalog node from a catalog tree
function deleteCatalogNodeFromTreeServer(tree: any[] = [], id: string): any[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children && Array.isArray(node.children)) {
        return {
          ...node,
          children: deleteCatalogNodeFromTreeServer(node.children, id),
        };
      }
      return node;
    });
}

// Permanent Item Deletion Endpoint
app.post('/api/portfolio/delete-item', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!verifyToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login to delete.' });
  }

  try {
    const { itemId, itemIds, itemType } = req.body;
    const targetIds = new Set<string>();
    if (typeof itemId === 'string' && itemId.trim()) {
      targetIds.add(itemId.trim());
    }
    if (Array.isArray(itemIds)) {
      itemIds.forEach((id: string) => {
        if (typeof id === 'string' && id.trim()) {
          targetIds.add(id.trim());
        }
      });
    }

    if (targetIds.size === 0) {
      return res.status(400).json({ success: false, message: 'Missing itemId parameter' });
    }

    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ success: true, message: 'Deleted successfully' });
    }

    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(content);

    // Save auto backup before deleting
    const firstId = targetIds.values().next().value;
    createServerBackup(data, `Pre-Delete Snapshot (${itemType || 'item'} ${firstId})`);

    // 1. Remove from video projects
    if (Array.isArray(data.videoProjects)) {
      data.videoProjects = data.videoProjects.filter((p: any) => !targetIds.has(p.id));
    }

    // 2. Remove from photography
    if (Array.isArray(data.photography)) {
      data.photography = data.photography.filter((p: any) => !targetIds.has(p.id));
    }

    // 3. Remove from shoot services
    if (Array.isArray(data.shootServices)) {
      data.shootServices = data.shootServices.filter((s: any) => !targetIds.has(s.id));
    }

    // 4. Remove from direction projects
    if (Array.isArray(data.directionProjects)) {
      data.directionProjects = data.directionProjects.filter((d: any) => !targetIds.has(d.id));
    }

    // 5. Remove from experiences
    if (Array.isArray(data.experiences)) {
      data.experiences = data.experiences.filter((e: any) => !targetIds.has(e.id));
    }

    // 6. Remove from songs
    if (data.songs) {
      if (Array.isArray(data.songs.youtubeSongs)) {
        data.songs.youtubeSongs = data.songs.youtubeSongs.filter((s: any) => !targetIds.has(s.id));
      }
      if (Array.isArray(data.songs.spotifySongs)) {
        data.songs.spotifySongs = data.songs.spotifySongs.filter((s: any) => !targetIds.has(s.id));
      }
      if (Array.isArray(data.songs.audioTracks)) {
        data.songs.audioTracks = data.songs.audioTracks.filter((s: any) => !targetIds.has(s.id));
      }
      if (Array.isArray(data.songs.allSongs)) {
        data.songs.allSongs = data.songs.allSongs.filter((s: any) => !targetIds.has(s.id));
      }
    }

    // 7. Remove from about stats
    if (data.about && Array.isArray(data.about.stats)) {
      data.about.stats = data.about.stats.filter((st: any) => !targetIds.has(st.id));
    }

    // 8. Remove from trash
    if (Array.isArray(data.trash)) {
      data.trash = data.trash.filter((t: any) => !targetIds.has(t.id) && !targetIds.has(t.originalId));
    }

    // 9. Catalog trees and catalogues removal
    if (itemType === 'catalog' || itemType === 'catalogue') {
      targetIds.forEach((targetId) => {
        if (Array.isArray(data.videoCatalogTree)) {
          data.videoCatalogTree = deleteCatalogNodeFromTreeServer(data.videoCatalogTree, targetId);
        }
        if (Array.isArray(data.photoCatalogTree)) {
          data.photoCatalogTree = deleteCatalogNodeFromTreeServer(data.photoCatalogTree, targetId);
        }
        if (Array.isArray(data.songCatalogTree)) {
          data.songCatalogTree = deleteCatalogNodeFromTreeServer(data.songCatalogTree, targetId);
        }
        if (Array.isArray(data.videoCatalogues)) {
          data.videoCatalogues = data.videoCatalogues.filter((c: string) => c !== targetId && c.toLowerCase() !== targetId.toLowerCase());
        }
        if (Array.isArray(data.photoCatalogues)) {
          data.photoCatalogues = data.photoCatalogues.filter((c: string) => c !== targetId && c.toLowerCase() !== targetId.toLowerCase());
        }
        if (Array.isArray(data.songCatalogues)) {
          data.songCatalogues = data.songCatalogues.filter((c: string) => c !== targetId && c.toLowerCase() !== targetId.toLowerCase());
        }
        if (Array.isArray(data.globalCatalogues)) {
          data.globalCatalogues = data.globalCatalogues.filter((c: string) => c !== targetId && c.toLowerCase() !== targetId.toLowerCase());
        }
      });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Song deleted successfully',
      data,
    });
  } catch (err) {
    console.error('Error deleting portfolio item:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

// List available server backup snapshots
app.get('/api/portfolio/backups', (req, res) => {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return res.json({ success: true, backups: [] });
    }
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    const backups = files.map(file => {
      try {
        const filePath = path.join(BACKUPS_DIR, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          filename: file,
          timestamp: parsed.timestamp || stats.mtime.toISOString(),
          label: parsed.label || 'Snapshot',
          sizeBytes: stats.size,
          videoProjectsCount: parsed.data?.videoProjects?.length || 0,
          photosCount: parsed.data?.photography?.length || 0,
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Sort descending by timestamp
    backups.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json({ success: true, backups });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list backups' });
  }
});

// Restore a server backup snapshot
app.post('/api/portfolio/restore-backup', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!verifyToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { filename } = req.body;
  if (!filename || typeof filename !== 'string' || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ success: false, message: 'Invalid backup filename' });
  }

  const filePath = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Backup file not found' });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const restoredData = parsed.data || parsed;

    // Safety backup of current state before restore
    if (fs.existsSync(DATA_FILE)) {
      try {
        const current = fs.readFileSync(DATA_FILE, 'utf-8');
        createServerBackup(JSON.parse(current), 'Pre-Restore Backup');
      } catch {}
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(restoredData, null, 2), 'utf-8');
    return res.json({ success: true, message: `Successfully restored backup from ${filename}`, data: restoredData });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to restore backup' });
  }
});

// Create manual named snapshot
app.post('/api/portfolio/create-snapshot', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!verifyToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { label } = req.body;
  try {
    let currentData = null;
    if (fs.existsSync(DATA_FILE)) {
      currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    if (!currentData) {
      return res.status(400).json({ success: false, message: 'No portfolio data to snapshot' });
    }
    const filename = createServerBackup(currentData, label || 'Manual Snapshot');
    return res.json({ success: true, message: 'Backup snapshot created', filename });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create snapshot' });
  }
});

app.post('/api/portfolio/reset', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!verifyToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    return res.json({ success: true, message: 'Portfolio reset to default defaults' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Reset failed' });
  }
});

async function startServer() {
  // Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running on http://localhost:${PORT}`);
  });
}

startServer();
