# 🔐 Tài liệu Yêu cầu Tính năng Bảo mật - Quoc Nam Phase 1A

> **Ngày tạo:** 2025-12-26  
> **Model AI:** Claude Opus 4.5 (GitHub Copilot)  
> **Dự án:** M1 Portal Wireframe - Quoc Nam Phase 1A  
> **Mục đích:** Chống mất dữ liệu trên hình ảnh và file

---

## 📁 Mục Lục

1. [Tổng quan yêu cầu](#1-tổng-quan-yêu-cầu)
2. [Danh sách tính năng bảo mật](#2-danh-sách-tính-năng-bảo-mật)
3. [Chi tiết kỹ thuật](#3-chi-tiết-kỹ-thuật)
4. [Lộ trình triển khai](#4-lộ-trình-triển-khai)
5. [Lưu ý và hạn chế](#5-lưu-ý-và-hạn-chế)

---

## 1. Tổng quan yêu cầu

### 1.1 Mục tiêu
Bảo vệ dữ liệu nhạy cảm (hình ảnh, file) khỏi việc bị sao chép, chụp màn hình, hoặc đánh cắp thông tin bởi người dùng nội bộ hoặc bên ngoài.

### 1.2 Phạm vi áp dụng
- Tất cả hình ảnh hiển thị trong chat
- File đính kèm (PDF, Excel, Word)
- Nội dung nhạy cảm trong ứng dụng

### 1.3 Đối tượng bảo vệ
| Loại dữ liệu | Mức độ nhạy cảm | Biện pháp |
|--------------|-----------------|-----------|
| Hình ảnh chat | Cao | Watermark + Chống chụp |
| File PDF | Cao | Watermark + Chống tải |
| Nội dung chat | Trung bình | Chống copy |
| Thông tin hệ thống | Thấp | Chống DevTools |

---

## 2. Danh sách tính năng bảo mật

### 2.1 Tổng quan các tính năng

| # | Tính năng | Mô tả | Độ ưu tiên | Độ phức tạp |
|---|-----------|-------|------------|-------------|
| 1 | **Watermark động** | Hiển thị username + timestamp trên ảnh/file | 🔴 Cao | Trung bình |
| 2 | **Chống chụp màn hình** | Ngăn PrintScreen, screenshot tools | 🔴 Cao | Cao |
| 3 | **Chống sao chép (Copy)** | Disable right-click, Ctrl+C | 🟡 Trung bình | Thấp |
| 4 | **Chống xem DevTools** | Phát hiện và ngăn mở Console | 🟡 Trung bình | Trung bình |
| 5 | **Chống Network Sniffing** | Mã hóa request/response | 🟡 Trung bình | Cao |
| 6 | **Session Security** | Bảo vệ phiên đăng nhập | 🟢 Thấp | Trung bình |

---

## 3. Chi tiết kỹ thuật

### 3.1 🖼️ Watermark động (Dynamic Watermark)

#### Mô tả
Hiển thị watermark chứa thông tin định danh người dùng trên tất cả hình ảnh và file, giúp truy vết nguồn rò rỉ nếu xảy ra.

#### Thông tin Watermark
```
┌─────────────────────────────────────────────┐
│  Username: diem.chi@company.com             │
│  Timestamp: 2025-12-26 14:30:45             │
│  Session ID: abc123xyz                      │
│  IP Hash: 7f3a9b2c                          │
└─────────────────────────────────────────────┘
```

#### Kỹ thuật triển khai

**Phương án 1: CSS Overlay Watermark**
```typescript
// Ưu điểm: Đơn giản, nhẹ
// Nhược điểm: Có thể bypass bằng DevTools
interface WatermarkConfig {
  username: string;
  timestamp: string;
  opacity: number;      // 0.1 - 0.3
  rotation: number;     // -45 đến 45 độ
  density: 'low' | 'medium' | 'high';
}
```

**Phương án 2: Canvas Watermark (Recommended)**
```typescript
// Ưu điểm: Khó bypass hơn, tích hợp vào ảnh
// Nhược điểm: Tốn tài nguyên hơn
interface CanvasWatermarkConfig {
  text: string;
  fontSize: number;
  color: string;        // rgba với alpha thấp
  pattern: 'diagonal' | 'grid' | 'random';
  interval: number;     // khoảng cách giữa các watermark
}
```

**Phương án 3: SVG Pattern Watermark**
```typescript
// Ưu điểm: Scalable, performance tốt
// Nhược điểm: Phức tạp hơn
interface SVGWatermarkConfig {
  patternId: string;
  content: string;
  transform: string;
}
```

#### Files cần tạo/sửa
| File | Hành động | Mô tả |
|------|-----------|-------|
| `src/components/security/Watermark.tsx` | Tạo mới | Component watermark |
| `src/components/security/WatermarkProvider.tsx` | Tạo mới | Context provider |
| `src/hooks/useWatermark.ts` | Tạo mới | Custom hook |
| `src/features/portal/components/MessageBubble.tsx` | Sửa | Thêm watermark vào ảnh |
| `src/features/portal/components/FilePreviewModal.tsx` | Sửa | Thêm watermark vào preview |

#### Acceptance Criteria
- [ ] Watermark hiển thị trên tất cả ảnh trong chat
- [ ] Watermark hiển thị trong file preview modal
- [ ] Watermark chứa username hiện tại
- [ ] Watermark có timestamp realtime
- [ ] Watermark không che quá nhiều nội dung (opacity < 30%)
- [ ] Watermark responsive theo kích thước ảnh

---

### 3.2 📵 Chống chụp màn hình (Screenshot Protection)

#### Mô tả
Ngăn chặn hoặc cảnh báo khi người dùng cố gắng chụp màn hình ứng dụng.

#### Kỹ thuật triển khai

**3.2.1 Phát hiện PrintScreen**
```typescript
// Bắt sự kiện PrintScreen key
document.addEventListener('keyup', (e) => {
  if (e.key === 'PrintScreen') {
    // Clear clipboard
    navigator.clipboard.writeText('');
    // Show warning
    showSecurityWarning('Screenshot detected!');
    // Log incident
    logSecurityIncident('SCREENSHOT_ATTEMPT');
  }
});
```

**3.2.2 CSS Protection Layer**
```css
/* Áp dụng cho vùng nhạy cảm */
.protected-content {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; /* cho ảnh */
}

/* Blur khi mất focus (user alt-tab) */
.blur-on-leave:not(:focus-within) {
  filter: blur(10px);
  transition: filter 0.3s;
}
```

**3.2.3 Visibility API Detection**
```typescript
// Phát hiện khi user chuyển tab/app
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Blur sensitive content
    blurSensitiveContent();
    // Log potential screenshot
    logSecurityIncident('TAB_SWITCH');
  } else {
    // Restore content
    unblurSensitiveContent();
  }
});
```

**3.2.4 Screen Capture API Detection (Modern browsers)**
```typescript
// Phát hiện screen sharing/recording
if (navigator.mediaDevices) {
  navigator.mediaDevices.getDisplayMedia = new Proxy(
    navigator.mediaDevices.getDisplayMedia,
    {
      apply: (target, thisArg, args) => {
        logSecurityIncident('SCREEN_CAPTURE_ATTEMPT');
        showSecurityWarning('Screen capture is not allowed!');
        return Promise.reject(new Error('Screen capture blocked'));
      }
    }
  );
}
```

#### Files cần tạo/sửa
| File | Hành động | Mô tả |
|------|-----------|-------|
| `src/components/security/ScreenshotProtection.tsx` | Tạo mới | HOC bảo vệ |
| `src/hooks/useScreenshotProtection.ts` | Tạo mới | Detection hook |
| `src/utils/security.ts` | Tạo mới | Security utilities |
| `src/App.tsx` | Sửa | Wrap với protection |

#### Acceptance Criteria
- [ ] Phát hiện phím PrintScreen và xóa clipboard
- [ ] Hiển thị cảnh báo khi phát hiện chụp ảnh
- [ ] Blur nội dung khi user chuyển tab
- [ ] Chặn Screen Capture API
- [ ] Log tất cả security incidents

---

### 3.3 🚫 Chống sao chép (Copy Protection)

#### Mô tả
Ngăn chặn việc copy text, hình ảnh thông qua chuột phải, phím tắt.

#### Kỹ thuật triển khai

**3.3.1 Disable Context Menu**
```typescript
document.addEventListener('contextmenu', (e) => {
  if (isProtectedArea(e.target)) {
    e.preventDefault();
    showWarning('Right-click is disabled');
    return false;
  }
});
```

**3.3.2 Disable Keyboard Shortcuts**
```typescript
const blockedShortcuts = [
  { ctrl: true, key: 'c' },   // Copy
  { ctrl: true, key: 'x' },   // Cut
  { ctrl: true, key: 'a' },   // Select All
  { ctrl: true, key: 'p' },   // Print
  { ctrl: true, key: 's' },   // Save
  { ctrl: true, shift: true, key: 'i' },  // DevTools
  { key: 'F12' },             // DevTools
];

document.addEventListener('keydown', (e) => {
  if (isBlockedShortcut(e)) {
    e.preventDefault();
    logSecurityIncident('BLOCKED_SHORTCUT', { key: e.key });
  }
});
```

**3.3.3 Disable Text Selection**
```css
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Disable drag */
.no-drag {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
```

**3.3.4 Disable Image Drag & Save**
```typescript
// Prevent image save
document.querySelectorAll('img').forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', (e) => e.preventDefault());
});
```

#### Files cần tạo/sửa
| File | Hành động | Mô tả |
|------|-----------|-------|
| `src/components/security/CopyProtection.tsx` | Tạo mới | Copy protection wrapper |
| `src/hooks/useCopyProtection.ts` | Tạo mới | Hook disable copy |
| `src/styles/security.css` | Tạo mới | CSS protection styles |

#### Acceptance Criteria
- [ ] Disable right-click menu trên vùng nhạy cảm
- [ ] Block Ctrl+C, Ctrl+X, Ctrl+A
- [ ] Disable text selection trên nội dung nhạy cảm
- [ ] Prevent image drag & save as
- [ ] Vẫn cho phép copy ở vùng cho phép (input fields)

---

### 3.4 🔧 Chống xem DevTools

#### Mô tả
Phát hiện và ngăn chặn việc mở Developer Tools để inspect/modify ứng dụng.

#### Kỹ thuật triển khai

**3.4.1 Detect DevTools Opening**
```typescript
// Method 1: Size detection
const detectDevTools = () => {
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;
  
  if (widthThreshold || heightThreshold) {
    onDevToolsDetected();
  }
};

// Method 2: Console timing attack
const detectByConsole = () => {
  const start = performance.now();
  console.log('%c', 'font-size:0;');
  console.clear();
  const end = performance.now();
  
  if (end - start > 100) {
    onDevToolsDetected();
  }
};

// Method 3: debugger statement
const detectByDebugger = () => {
  const start = Date.now();
  debugger;
  const end = Date.now();
  
  if (end - start > 100) {
    onDevToolsDetected();
  }
};
```

**3.4.2 Actions when detected**
```typescript
const onDevToolsDetected = () => {
  // Option 1: Blur content
  document.body.classList.add('devtools-detected');
  
  // Option 2: Show warning overlay
  showSecurityOverlay('DevTools detected. Please close to continue.');
  
  // Option 3: Log incident
  logSecurityIncident('DEVTOOLS_OPENED');
  
  // Option 4: Clear sensitive data (extreme)
  // clearSensitiveData();
  
  // Option 5: Redirect
  // window.location.href = '/security-warning';
};
```

**3.4.3 Disable Console Functions**
```typescript
// Override console methods in production
if (process.env.NODE_ENV === 'production') {
  const noop = () => {};
  
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
  console.table = noop;
  console.dir = noop;
  
  // Optionally show warning
  console.log = () => {
    console.warn('Console is disabled for security reasons.');
  };
}
```

#### Files cần tạo/sửa
| File | Hành động | Mô tả |
|------|-----------|-------|
| `src/components/security/DevToolsProtection.tsx` | Tạo mới | DevTools detection |
| `src/hooks/useDevToolsDetection.ts` | Tạo mới | Detection hook |
| `src/utils/consoleProtection.ts` | Tạo mới | Console override |

#### Acceptance Criteria
- [ ] Phát hiện DevTools mở bằng 3 phương pháp
- [ ] Hiển thị overlay cảnh báo khi DevTools mở
- [ ] Blur nội dung nhạy cảm khi DevTools mở
- [ ] Disable console.log trong production
- [ ] Log security incidents

---

### 3.5 🌐 Chống Network Sniffing

#### Mô tả
Bảo vệ dữ liệu truyền tải giữa client và server khỏi bị đánh cắp.

#### Kỹ thuật triển khai

**3.5.1 Request/Response Encryption**
```typescript
// Mã hóa payload trước khi gửi
import CryptoJS from 'crypto-js';

const encryptPayload = (data: any, secretKey: string) => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
};

const decryptPayload = (encryptedData: string, secretKey: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Axios interceptor
axios.interceptors.request.use((config) => {
  if (config.data) {
    config.data = {
      encrypted: encryptPayload(config.data, SESSION_KEY)
    };
  }
  return config;
});
```

**3.5.2 Certificate Pinning (Cần backend support)**
```typescript
// Verify server certificate
const verifyCertificate = async () => {
  // Implement certificate pinning logic
  // Thường cần native app hoặc service worker
};
```

**3.5.3 Request Signing**
```typescript
// Ký request để verify integrity
const signRequest = (payload: any, timestamp: number) => {
  const message = `${JSON.stringify(payload)}:${timestamp}`;
  return CryptoJS.HmacSHA256(message, SECRET_KEY).toString();
};

// Add to headers
headers['X-Request-Timestamp'] = Date.now();
headers['X-Request-Signature'] = signRequest(payload, timestamp);
```

**3.5.4 Token Rotation**
```typescript
// Rotate access token frequently
const TOKEN_ROTATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

setInterval(async () => {
  const newToken = await refreshToken();
  updateAuthToken(newToken);
}, TOKEN_ROTATION_INTERVAL);
```

#### Files cần tạo/sửa
| File | Hành động | Mô tả |
|------|-----------|-------|
| `src/utils/encryption.ts` | Tạo mới | Encryption utilities |
| `src/api/secureClient.ts` | Tạo mới | Secure API client |
| `src/hooks/useSecureRequest.ts` | Tạo mới | Secure request hook |

#### Acceptance Criteria
- [ ] Mã hóa tất cả request payload
- [ ] Mã hóa response sensitive data
- [ ] Sign tất cả request với timestamp
- [ ] Implement token rotation
- [ ] Reject requests với signature không hợp lệ

---

### 3.6 🔑 Session Security

#### Mô tả
Bảo vệ phiên làm việc của người dùng.

#### Kỹ thuật triển khai

**3.6.1 Session Fingerprinting**
```typescript
interface SessionFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

const generateFingerprint = (): string => {
  const fp: SessionFingerprint = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
  };
  
  return CryptoJS.SHA256(JSON.stringify(fp)).toString();
};
```

**3.6.2 Activity Monitoring**
```typescript
// Auto logout on inactivity
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
};

['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
  document.addEventListener(event, resetInactivityTimer);
});
```

**3.6.3 Single Session Enforcement**
```typescript
// Chỉ cho phép 1 session tại 1 thời điểm
const enforcesSingleSession = () => {
  const sessionId = generateSessionId();
  
  // Send to server
  api.post('/session/register', { sessionId });
  
  // Listen for invalidation
  websocket.on('session:invalidated', () => {
    showWarning('Session ended. Logged in from another device.');
    logout();
  });
};
```

#### Acceptance Criteria
- [ ] Generate session fingerprint
- [ ] Auto logout sau 15 phút không hoạt động
- [ ] Enforce single session per user
- [ ] Invalidate session khi fingerprint thay đổi

---

## 4. Lộ trình triển khai

### 4.1 Phase 1: Basic Protection (Tuần 1-2)
| Tính năng | Effort | Người thực hiện |
|-----------|--------|-----------------|
| CSS Watermark | 2 ngày | FE Dev |
| Copy Protection | 1 ngày | FE Dev |
| Basic Screenshot Detection | 2 ngày | FE Dev |

### 4.2 Phase 2: Advanced Protection (Tuần 3-4)
| Tính năng | Effort | Người thực hiện |
|-----------|--------|-----------------|
| Canvas Watermark | 3 ngày | FE Dev |
| DevTools Detection | 2 ngày | FE Dev |
| Console Protection | 1 ngày | FE Dev |

### 4.3 Phase 3: Network Security (Tuần 5-6)
| Tính năng | Effort | Người thực hiện |
|-----------|--------|-----------------|
| Request Encryption | 3 ngày | FE + BE Dev |
| Request Signing | 2 ngày | FE + BE Dev |
| Token Rotation | 2 ngày | FE + BE Dev |

### 4.4 Phase 4: Session Security (Tuần 7)
| Tính năng | Effort | Người thực hiện |
|-----------|--------|-----------------|
| Session Fingerprint | 2 ngày | FE Dev |
| Inactivity Timeout | 1 ngày | FE Dev |
| Single Session | 2 ngày | FE + BE Dev |

---

## 5. Lưu ý và hạn chế

### 5.1 Hạn chế kỹ thuật

| Biện pháp | Hạn chế | Bypass có thể |
|-----------|---------|---------------|
| CSS Watermark | Có thể remove qua DevTools | Dễ bypass |
| Screenshot Detection | Không bắt được 3rd party tools | Camera điện thoại |
| Copy Protection | Không chặn được copy từ DevTools | View source |
| DevTools Detection | Không 100% chính xác | Một số browser extensions |
| Network Encryption | Cần HTTPS | Man-in-the-middle vẫn có thể với root cert |

### 5.2 Best Practices

1. **Defense in Depth**: Áp dụng nhiều lớp bảo vệ
2. **Log Everything**: Ghi log tất cả security incidents
3. **User Education**: Đào tạo người dùng về bảo mật
4. **Regular Audits**: Kiểm tra định kỳ các biện pháp bảo mật
5. **Backend Validation**: Luôn validate ở backend, FE chỉ là bổ sung

### 5.3 Legal Considerations

- Thông báo cho người dùng về các biện pháp bảo mật
- Tuân thủ GDPR/PDPA về thu thập dữ liệu
- Chính sách rõ ràng về logging và monitoring

---

## 📋 Checklist Implementation

```
Security Features Implementation Checklist
==========================================

□ Phase 1: Basic Protection
  □ Watermark Component
    □ CSS overlay watermark
    □ Username display
    □ Timestamp display
    □ Responsive sizing
  □ Copy Protection
    □ Disable right-click
    □ Block Ctrl+C/X/A
    □ Disable text selection
    □ Prevent image drag
  □ Screenshot Detection
    □ PrintScreen detection
    □ Clipboard clearing
    □ Warning display

□ Phase 2: Advanced Protection
  □ Canvas Watermark
    □ Image processing
    □ Pattern generation
    □ Performance optimization
  □ DevTools Detection
    □ Size detection
    □ Console timing
    □ Debugger detection
    □ Warning overlay
  □ Console Protection
    □ Disable console methods
    □ Production-only

□ Phase 3: Network Security
  □ Request Encryption
    □ AES encryption
    □ Key management
  □ Request Signing
    □ HMAC implementation
    □ Timestamp validation
  □ Token Rotation
    □ Auto refresh
    □ Secure storage

□ Phase 4: Session Security
  □ Fingerprinting
  □ Inactivity timeout
  □ Single session
```

---

## 📚 Tài liệu tham khảo

- [OWASP Frontend Security Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**© 2025 - Tạo bởi Claude Opus 4.5 (GitHub Copilot)**
