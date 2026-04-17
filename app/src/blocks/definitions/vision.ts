import type { BlockDefinition } from '../../types/block'

export const visionBlocks: BlockDefinition[] = [
  {
    name: 'start_camera',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Request camera access and create a hidden video element',
    category: 'Vision',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `async function startCamera() {\n  if (window.__cbCamera) return;\n  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {\n    console.error('Camera API not available in this context');\n    return;\n  }\n  try {\n    console.log('Requesting camera...');\n    var stream = await navigator.mediaDevices.getUserMedia({ video: true });\n    console.log('Camera stream acquired');\n    var video = document.createElement('video');\n    video.srcObject = stream;\n    video.autoplay = true;\n    video.playsInline = true;\n    video.muted = true;\n    video.style.display = 'none';\n    document.body.appendChild(video);\n    await new Promise(function(r) { video.addEventListener('loadedmetadata', r); });\n    await video.play().catch(function(){});\n    window.__cbCamera = video;\n    console.log('Camera ready: ' + video.videoWidth + 'x' + video.videoHeight);\n  } catch (e) {\n    console.error('Camera failed: ' + e.message);\n  }\n}`,
      python: `def start_camera():\n    raise NotImplementedError("Camera is only supported in JavaScript")`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'statement',
  },
  {
    name: 'camera_width',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the camera video width',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'width', type: 'number' }],
    implementations: {
      javascript: `function cameraWidth() {\n  return window.__cbCamera ? window.__cbCamera.videoWidth : 0;\n}`,
      python: `def camera_width():\n    return 0`,
    },
    tests: [],
    color: '#06B6D4',
  },
  {
    name: 'camera_height',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the camera video height',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'height', type: 'number' }],
    implementations: {
      javascript: `function cameraHeight() {\n  return window.__cbCamera ? window.__cbCamera.videoHeight : 0;\n}`,
      python: `def camera_height():\n    return 0`,
    },
    tests: [],
    color: '#06B6D4',
  },
  {
    name: 'capture_frame',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Capture the current camera frame for pixel reading',
    category: 'Vision',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function captureFrame() {\n  if (!window.__cbCamera) return;\n  var v = window.__cbCamera;\n  if (v.readyState < 2 || v.videoWidth === 0) return;\n  if (!window.__cbSampler) {\n    window.__cbSampler = document.createElement('canvas');\n    window.__cbSamplerCtx = window.__cbSampler.getContext('2d', { willReadFrequently: true });\n  }\n  var ctx = window.__cbSamplerCtx;\n  if (window.__cbSampler.width !== v.videoWidth || window.__cbSampler.height !== v.videoHeight) {\n    window.__cbSampler.width = v.videoWidth;\n    window.__cbSampler.height = v.videoHeight;\n  }\n  ctx.save();\n  ctx.translate(v.videoWidth, 0);\n  ctx.scale(-1, 1);\n  ctx.drawImage(v, 0, 0, v.videoWidth, v.videoHeight);\n  ctx.restore();\n  window.__cbFrameData = ctx.getImageData(0, 0, v.videoWidth, v.videoHeight);\n  if (!window.__cbFrameLogged) {\n    window.__cbFrameLogged = true;\n    var sample = window.__cbFrameData.data;\n    console.log('First frame captured. Sample pixel: r=' + sample[0] + ' g=' + sample[1] + ' b=' + sample[2]);\n  }\n}`,
      python: `def capture_frame():\n    raise NotImplementedError("Camera is only supported in JavaScript")`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'statement',
  },
  {
    name: 'get_pixel_brightness',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the brightness (0–255) of the pixel at x, y from the last captured frame',
    category: 'Vision',
    inputs: [
      { name: 'x', type: 'number', description: 'X coordinate', default: 0 },
      { name: 'y', type: 'number', description: 'Y coordinate', default: 0 },
    ],
    outputs: [{ name: 'brightness', type: 'number' }],
    implementations: {
      javascript: `function getPixelBrightness(x, y) {\n  if (!window.__cbFrameData) return 0;\n  var d = window.__cbFrameData;\n  var px = Math.floor(x), py = Math.floor(y);\n  if (px < 0 || py < 0 || px >= d.width || py >= d.height) return 0;\n  var i = (py * d.width + px) * 4;\n  return Math.round((d.data[i] + d.data[i+1] + d.data[i+2]) / 3);\n}`,
      python: `def get_pixel_brightness(x, y):\n    return 0`,
    },
    tests: [],
    color: '#06B6D4',
  },
  {
    name: 'get_pixel_color',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get the hex color string of the pixel at x, y from the last captured frame',
    category: 'Vision',
    inputs: [
      { name: 'x', type: 'number', description: 'X coordinate', default: 0 },
      { name: 'y', type: 'number', description: 'Y coordinate', default: 0 },
    ],
    outputs: [{ name: 'color', type: 'string' }],
    implementations: {
      javascript: `function getPixelColor(x, y) {\n  if (!window.__cbFrameData) return '#000000';\n  var d = window.__cbFrameData;\n  var px = Math.floor(x), py = Math.floor(y);\n  if (px < 0 || py < 0 || px >= d.width || py >= d.height) return '#000000';\n  var i = (py * d.width + px) * 4;\n  var r = (d.data[i] || 0).toString(16).padStart(2, '0');\n  var g = (d.data[i+1] || 0).toString(16).padStart(2, '0');\n  var b = (d.data[i+2] || 0).toString(16).padStart(2, '0');\n  return '#' + r + g + b;\n}`,
      python: `def get_pixel_color(x, y):\n    return '#000000'`,
    },
    tests: [],
    color: '#06B6D4',
  },

  // ---------------------------------------------------------------------------
  // Image Classifier (MobileNet, lazy-loaded from CDN)
  // ---------------------------------------------------------------------------

  {
    name: 'classify_camera',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Use AI to guess what is in the camera view. Call "start camera" first.',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'label', type: 'string' }],
    implementations: {
      javascript: `async function classify_camera() {
  if (typeof window === 'undefined' || !window.__vision) return '';
  const result = await window.__vision.classifyCamera();
  return result.label;
}`,
      python: `def classify_camera():
    return ''`,
    },
    tests: [
      { input: {}, expected: { label: 'string' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'classify_image',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Use AI to guess what is in a picture at the given URL',
    category: 'Vision',
    inputs: [
      { name: 'url', type: 'string', description: 'Image URL', default: '' },
    ],
    outputs: [{ name: 'label', type: 'string' }],
    implementations: {
      javascript: `async function classify_image(url) {
  if (typeof window === 'undefined' || !window.__vision) return '';
  const result = await window.__vision.classifyUrl(String(url));
  return result.label;
}`,
      python: `def classify_image(url):
    return ''`,
    },
    tests: [
      { input: { url: '' }, expected: { label: 'string' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'classify_confidence',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'How sure the classifier was about its last answer (0 to 1)',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'confidence', type: 'number' }],
    implementations: {
      javascript: `function classify_confidence() {
  if (typeof window === 'undefined' || !window.__vision) return 0;
  return window.__vision.getLatestClassification().confidence;
}`,
      python: `def classify_confidence():
    return 0`,
    },
    tests: [
      { input: {}, expected: { confidence: 'number' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  // ---------------------------------------------------------------------------
  // Hand Tracking (MediaPipe Hands via TF.js hand-pose-detection)
  // ---------------------------------------------------------------------------

  {
    name: 'start_hand_tracking',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Start tracking hands from the camera. Call "start camera" first.',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'ok', type: 'boolean' }],
    implementations: {
      javascript: `async function start_hand_tracking() {
  if (typeof window === 'undefined' || !window.__vision) return false;
  return await window.__vision.startHandTracking();
}`,
      python: `def start_hand_tracking():
    return False`,
    },
    tests: [
      { input: {}, expected: { ok: 'boolean' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'hand_count',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'How many hands the camera currently sees (0, 1, or 2)',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'count', type: 'number' }],
    implementations: {
      javascript: `function hand_count() {
  if (typeof window === 'undefined' || !window.__vision) return 0;
  return window.__vision.getHandState().handCount;
}`,
      python: `def hand_count():
    return 0`,
    },
    tests: [
      { input: {}, expected: { count: 'number' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'index_finger_x',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Index finger X position (0 = left, 1 = right). Call "start hand tracking" first.',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'x', type: 'number' }],
    implementations: {
      javascript: `function index_finger_x() {
  if (typeof window === 'undefined' || !window.__vision) return 0;
  return window.__vision.getHandState().indexX;
}`,
      python: `def index_finger_x():
    return 0`,
    },
    tests: [
      { input: {}, expected: { x: 'number' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'index_finger_y',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Index finger Y position (0 = top, 1 = bottom). Call "start hand tracking" first.',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'y', type: 'number' }],
    implementations: {
      javascript: `function index_finger_y() {
  if (typeof window === 'undefined' || !window.__vision) return 0;
  return window.__vision.getHandState().indexY;
}`,
      python: `def index_finger_y():
    return 0`,
    },
    tests: [
      { input: {}, expected: { y: 'number' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'is_pinching',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Is the thumb and index finger tip close together? (good for grabbing things)',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'pinching', type: 'boolean' }],
    implementations: {
      javascript: `function is_pinching() {
  if (typeof window === 'undefined' || !window.__vision) return false;
  return window.__vision.getHandState().isPinching;
}`,
      python: `def is_pinching():
    return False`,
    },
    tests: [
      { input: {}, expected: { pinching: 'boolean' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  {
    name: 'fingers_up',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'How many fingers are pointing up (0 to 5). Great for counting and gesture games.',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'count', type: 'number' }],
    implementations: {
      javascript: `function fingers_up() {
  if (typeof window === 'undefined' || !window.__vision) return 0;
  return window.__vision.getHandState().fingersUp;
}`,
      python: `def fingers_up():
    return 0`,
    },
    tests: [
      { input: {}, expected: { count: 'number' } },
    ],
    color: '#06B6D4',
    shape: 'value',
  },

  // ─── Body Pose Tracking ───────────────────────────────────────────

  {
    name: 'start_pose_tracking',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Start body pose tracking — detects jump, duck, idle. Call "start camera" first.',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'success', type: 'boolean' }],
    implementations: {
      javascript: `async function start_pose_tracking() {
  if (typeof window === 'undefined' || !window.__vision) return false;
  return await window.__vision.startPoseTracking();
}`,
      python: `async def start_pose_tracking():\n    return False`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'value',
  },
  {
    name: 'body_pose',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Current body pose: "idle", "jumping", or "ducking"',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'pose', type: 'string' }],
    implementations: {
      javascript: `function body_pose() {
  if (typeof window === 'undefined' || !window.__vision) return "idle";
  return window.__vision.getPoseState().pose;
}`,
      python: `def body_pose():\n    return "idle"`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'value',
  },
  {
    name: 'is_jumping',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'True when the user is jumping (shoulders rise above baseline)',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'jumping', type: 'boolean' }],
    implementations: {
      javascript: `function is_jumping() {
  if (typeof window === 'undefined' || !window.__vision) return false;
  return window.__vision.getPoseState().pose === "jumping";
}`,
      python: `def is_jumping():\n    return False`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'value',
  },
  {
    name: 'is_ducking',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'True when the user is ducking (shoulders drop below baseline)',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'ducking', type: 'boolean' }],
    implementations: {
      javascript: `function is_ducking() {
  if (typeof window === 'undefined' || !window.__vision) return false;
  return window.__vision.getPoseState().pose === "ducking";
}`,
      python: `def is_ducking():\n    return False`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'value',
  },
  {
    name: 'person_visible',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'True when the camera can see a person',
    category: 'Vision',
    inputs: [],
    outputs: [{ name: 'visible', type: 'boolean' }],
    implementations: {
      javascript: `function person_visible() {
  if (typeof window === 'undefined' || !window.__vision) return false;
  return window.__vision.getPoseState().personVisible;
}`,
      python: `def person_visible():\n    return False`,
    },
    tests: [],
    color: '#06B6D4',
    shape: 'value',
  },
]
