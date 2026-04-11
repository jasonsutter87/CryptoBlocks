import type { BlockDefinition } from '../../types/block'

export const aiBlocks: BlockDefinition[] = [
  {
    name: 'create_classifier',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create an empty text classifier',
    category: 'AI',
    inputs: [
      { name: 'name', type: 'string', description: 'Classifier name' },
    ],
    outputs: [],
    implementations: {
      javascript: `function createClassifier(name) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  window.__ai.classifiers[name] = { examples: [] };
}`,
      python: `def create_classifier(name):
    ai = globals().setdefault("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    ai["classifiers"][name] = {"examples": []}`,
    },
    tests: [
      { input: { name: 'mood' }, expected: {} },
    ],
    color: '#7C3AED',
  },
  {
    name: 'add_example',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add a labeled training example to a classifier',
    category: 'AI',
    inputs: [
      { name: 'classifier', type: 'string', description: 'Classifier name' },
      { name: 'text', type: 'string', description: 'Example text' },
      { name: 'label', type: 'string', description: 'Category label' },
    ],
    outputs: [],
    implementations: {
      javascript: `function addExample(classifier, text, label) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.classifiers[classifier]) { console.log("Error: Classifier '" + classifier + "' does not exist"); return; }
  var words = {};
  String(text).toLowerCase().split(/\\s+/).forEach(function(w) { if (w) words[w] = (words[w] || 0) + 1; });
  window.__ai.classifiers[classifier].examples.push({ words: words, label: label });
}`,
      python: `def add_example(classifier, text, label):
    ai = globals().get("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if classifier not in ai["classifiers"]:
        print("Error: Classifier '" + classifier + "' does not exist")
        return
    words = {}
    for w in str(text).lower().split():
        if w:
            words[w] = words.get(w, 0) + 1
    ai["classifiers"][classifier]["examples"].append({"words": words, "label": label})`,
    },
    tests: [
      { input: { classifier: 'mood', text: 'I love this', label: 'happy' }, expected: {} },
    ],
    color: '#7C3AED',
  },
  {
    name: 'classify',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Classify text using a trained classifier (bag-of-words + cosine similarity)',
    category: 'AI',
    inputs: [
      { name: 'classifier', type: 'string', description: 'Classifier name' },
      { name: 'text', type: 'string', description: 'Text to classify' },
    ],
    outputs: [{ name: 'label', type: 'string' }],
    implementations: {
      javascript: `function classify(classifier, text) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.classifiers[classifier]) { return "unknown"; }
  var c = window.__ai.classifiers[classifier];
  if (c.examples.length === 0) return "unknown";
  var input = {};
  String(text).toLowerCase().split(/\\s+/).forEach(function(w) { if (w) input[w] = (input[w] || 0) + 1; });
  var best = "unknown"; var bestScore = -1;
  for (var i = 0; i < c.examples.length; i++) {
    var ex = c.examples[i];
    var dot = 0; var magA = 0; var magB = 0;
    var allKeys = {};
    for (var k in input) allKeys[k] = 1;
    for (var k in ex.words) allKeys[k] = 1;
    for (var k in allKeys) {
      var a = input[k] || 0; var b = ex.words[k] || 0;
      dot += a * b; magA += a * a; magB += b * b;
    }
    var score = (magA > 0 && magB > 0) ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
    if (score > bestScore) { bestScore = score; best = ex.label; }
  }
  return best;
}`,
      python: `def classify(classifier, text):
    ai = globals().get("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if classifier not in ai["classifiers"]:
        return "unknown"
    c = ai["classifiers"][classifier]
    if not c["examples"]:
        return "unknown"
    inp = {}
    for w in str(text).lower().split():
        if w:
            inp[w] = inp.get(w, 0) + 1
    best = "unknown"
    best_score = -1
    for ex in c["examples"]:
        all_keys = set(list(inp.keys()) + list(ex["words"].keys()))
        dot = sum((inp.get(k, 0) * ex["words"].get(k, 0)) for k in all_keys)
        mag_a = sum(v * v for v in inp.values()) ** 0.5
        mag_b = sum(v * v for v in ex["words"].values()) ** 0.5
        score = dot / (mag_a * mag_b) if mag_a > 0 and mag_b > 0 else 0
        if score > best_score:
            best_score = score
            best = ex["label"]
    return best`,
    },
    tests: [
      { input: { classifier: 'mood', text: 'I love this' }, expected: { label: 'string' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },
  {
    name: 'analyze_sentiment',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Score text sentiment from -1 (negative) to 1 (positive)',
    category: 'AI',
    inputs: [
      { name: 'text', type: 'string', description: 'Text to analyze' },
    ],
    outputs: [{ name: 'score', type: 'number' }],
    implementations: {
      javascript: `function analyzeSentiment(text) {
  var pos = ["good","great","love","happy","amazing","wonderful","excellent","fantastic","beautiful","awesome","nice","best","perfect","joy","brilliant","superb","enjoy","delightful","cheerful","pleased","glad","exciting","positive","friendly","kind","helpful","grateful","fortunate","magnificent","outstanding","impressive","remarkable","splendid","terrific","marvelous","elegant","graceful","pleasant","charming","lovely","adorable","cool","fun","sweet","fine","super","bravo","wow","yes","win"];
  var neg = ["bad","terrible","hate","sad","awful","horrible","worst","ugly","angry","stupid","boring","poor","fail","wrong","nasty","dreadful","disgusting","miserable","pathetic","lousy","annoying","painful","cruel","evil","toxic","hideous","vile","wretched","appalling","atrocious","abysmal","dismal","horrid","revolting","repulsive","ghastly","grim","dire","bleak","harsh","rude","mean","scary","dumb","lame","suck","no","loss","worse","broken"];
  var words = String(text).toLowerCase().split(/\\s+/);
  var score = 0; var count = 0;
  for (var i = 0; i < words.length; i++) {
    if (pos.indexOf(words[i]) >= 0) { score += 1; count++; }
    else if (neg.indexOf(words[i]) >= 0) { score -= 1; count++; }
  }
  return count > 0 ? Math.round((score / count) * 100) / 100 : 0;
}`,
      python: `def analyze_sentiment(text):
    pos = {"good","great","love","happy","amazing","wonderful","excellent","fantastic","beautiful","awesome","nice","best","perfect","joy","brilliant","superb","enjoy","delightful","cheerful","pleased","glad","exciting","positive","friendly","kind","helpful","grateful","fortunate","magnificent","outstanding","impressive","remarkable","splendid","terrific","marvelous","elegant","graceful","pleasant","charming","lovely","adorable","cool","fun","sweet","fine","super","bravo","wow","yes","win"}
    neg = {"bad","terrible","hate","sad","awful","horrible","worst","ugly","angry","stupid","boring","poor","fail","wrong","nasty","dreadful","disgusting","miserable","pathetic","lousy","annoying","painful","cruel","evil","toxic","hideous","vile","wretched","appalling","atrocious","abysmal","dismal","horrid","revolting","repulsive","ghastly","grim","dire","bleak","harsh","rude","mean","scary","dumb","lame","suck","no","loss","worse","broken"}
    words = str(text).lower().split()
    score = 0
    count = 0
    for w in words:
        if w in pos:
            score += 1
            count += 1
        elif w in neg:
            score -= 1
            count += 1
    return round(score / count, 2) if count > 0 else 0`,
    },
    tests: [
      { input: { text: 'I love this great day' }, expected: { score: 1 } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },
  {
    name: 'train_text_generator',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Feed text into a Markov chain for text generation',
    category: 'AI',
    inputs: [
      { name: 'name', type: 'string', description: 'Generator name' },
      { name: 'text', type: 'string', description: 'Training text' },
    ],
    outputs: [],
    implementations: {
      javascript: `function trainTextGenerator(name, text) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.generators[name]) window.__ai.generators[name] = { chains: {} };
  var words = String(text).split(/\\s+/).filter(function(w) { return w; });
  var chains = window.__ai.generators[name].chains;
  for (var i = 0; i < words.length - 1; i++) {
    var w = words[i].toLowerCase();
    if (!chains[w]) chains[w] = {};
    var next = words[i + 1].toLowerCase();
    chains[w][next] = (chains[w][next] || 0) + 1;
  }
}`,
      python: `def train_text_generator(name, text):
    ai = globals().setdefault("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if name not in ai["generators"]:
        ai["generators"][name] = {"chains": {}}
    words = str(text).split()
    chains = ai["generators"][name]["chains"]
    for i in range(len(words) - 1):
        w = words[i].lower()
        if w not in chains:
            chains[w] = {}
        nxt = words[i + 1].lower()
        chains[w][nxt] = chains[w].get(nxt, 0) + 1`,
    },
    tests: [
      { input: { name: 'story', text: 'the cat sat on the mat' }, expected: {} },
    ],
    color: '#7C3AED',
  },
  {
    name: 'generate_text',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Generate text from a trained Markov chain',
    category: 'AI',
    inputs: [
      { name: 'name', type: 'string', description: 'Generator name' },
      { name: 'length', type: 'number', description: 'Number of words to generate', default: 10 },
    ],
    outputs: [{ name: 'text', type: 'string' }],
    implementations: {
      javascript: `function generateText(name, length) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.generators[name]) return "";
  var chains = window.__ai.generators[name].chains;
  var keys = Object.keys(chains);
  if (keys.length === 0) return "";
  var current = keys[Math.floor(Math.random() * keys.length)];
  var result = [current];
  for (var i = 1; i < length; i++) {
    var next = chains[current];
    if (!next) { current = keys[Math.floor(Math.random() * keys.length)]; result.push(current); continue; }
    var entries = Object.keys(next);
    var total = 0;
    for (var j = 0; j < entries.length; j++) total += next[entries[j]];
    var r = Math.random() * total;
    var sum = 0;
    for (var j = 0; j < entries.length; j++) {
      sum += next[entries[j]];
      if (r <= sum) { current = entries[j]; break; }
    }
    result.push(current);
  }
  return result.join(" ");
}`,
      python: `def generate_text(name, length):
    import random
    ai = globals().get("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if name not in ai["generators"]:
        return ""
    chains = ai["generators"][name]["chains"]
    keys = list(chains.keys())
    if not keys:
        return ""
    current = random.choice(keys)
    result = [current]
    for _ in range(int(length) - 1):
        nxt = chains.get(current)
        if not nxt:
            current = random.choice(keys)
            result.append(current)
            continue
        entries = list(nxt.keys())
        weights = [nxt[e] for e in entries]
        current = random.choices(entries, weights=weights)[0]
        result.append(current)
    return " ".join(result)`,
    },
    tests: [
      { input: { name: 'story', length: 5 }, expected: { text: 'string' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },
  {
    name: 'find_similar',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Calculate cosine similarity (0-1) between two texts',
    category: 'AI',
    inputs: [
      { name: 'text_a', type: 'string', description: 'First text' },
      { name: 'text_b', type: 'string', description: 'Second text' },
    ],
    outputs: [{ name: 'similarity', type: 'number' }],
    implementations: {
      javascript: `function findSimilar(textA, textB) {
  var a = {}; var b = {};
  String(textA).toLowerCase().split(/\\s+/).forEach(function(w) { if (w) a[w] = (a[w] || 0) + 1; });
  String(textB).toLowerCase().split(/\\s+/).forEach(function(w) { if (w) b[w] = (b[w] || 0) + 1; });
  var allKeys = {};
  for (var k in a) allKeys[k] = 1;
  for (var k in b) allKeys[k] = 1;
  var dot = 0; var magA = 0; var magB = 0;
  for (var k in allKeys) {
    var va = a[k] || 0; var vb = b[k] || 0;
    dot += va * vb; magA += va * va; magB += vb * vb;
  }
  return (magA > 0 && magB > 0) ? Math.round(dot / (Math.sqrt(magA) * Math.sqrt(magB)) * 100) / 100 : 0;
}`,
      python: `def find_similar(text_a, text_b):
    a = {}
    for w in str(text_a).lower().split():
        if w:
            a[w] = a.get(w, 0) + 1
    b = {}
    for w in str(text_b).lower().split():
        if w:
            b[w] = b.get(w, 0) + 1
    all_keys = set(list(a.keys()) + list(b.keys()))
    dot = sum(a.get(k, 0) * b.get(k, 0) for k in all_keys)
    mag_a = sum(v * v for v in a.values()) ** 0.5
    mag_b = sum(v * v for v in b.values()) ** 0.5
    return round(dot / (mag_a * mag_b), 2) if mag_a > 0 and mag_b > 0 else 0`,
    },
    tests: [
      { input: { text_a: 'the cat', text_b: 'the dog' }, expected: { similarity: 'number' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },
  {
    name: 'add_data_point',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add an x,y data point to a named dataset',
    category: 'AI',
    inputs: [
      { name: 'dataset', type: 'string', description: 'Dataset name' },
      { name: 'x', type: 'number', description: 'X value' },
      { name: 'y', type: 'number', description: 'Y value' },
    ],
    outputs: [],
    implementations: {
      javascript: `function addDataPoint(dataset, x, y) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.datasets[dataset]) window.__ai.datasets[dataset] = { points: [] };
  window.__ai.datasets[dataset].points.push({ x: Number(x), y: Number(y) });
}`,
      python: `def add_data_point(dataset, x, y):
    ai = globals().setdefault("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if dataset not in ai["datasets"]:
        ai["datasets"][dataset] = {"points": []}
    ai["datasets"][dataset]["points"].append({"x": float(x), "y": float(y)})`,
    },
    tests: [
      { input: { dataset: 'prices', x: 1, y: 10 }, expected: {} },
    ],
    color: '#7C3AED',
  },
  {
    name: 'predict_number',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Predict y from x using linear regression on a dataset',
    category: 'AI',
    inputs: [
      { name: 'dataset', type: 'string', description: 'Dataset name' },
      { name: 'x', type: 'number', description: 'X value to predict for' },
    ],
    outputs: [{ name: 'prediction', type: 'number' }],
    implementations: {
      javascript: `function predictNumber(dataset, x) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.datasets[dataset]) return 0;
  var pts = window.__ai.datasets[dataset].points;
  if (pts.length < 2) return pts.length === 1 ? pts[0].y : 0;
  var n = pts.length;
  var sumX = 0; var sumY = 0; var sumXY = 0; var sumX2 = 0;
  for (var i = 0; i < n; i++) {
    sumX += pts[i].x; sumY += pts[i].y;
    sumXY += pts[i].x * pts[i].y; sumX2 += pts[i].x * pts[i].x;
  }
  var denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return sumY / n;
  var slope = (n * sumXY - sumX * sumY) / denom;
  var intercept = (sumY - slope * sumX) / n;
  return Math.round((slope * Number(x) + intercept) * 100) / 100;
}`,
      python: `def predict_number(dataset, x):
    ai = globals().get("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if dataset not in ai["datasets"]:
        return 0
    pts = ai["datasets"][dataset]["points"]
    if len(pts) < 2:
        return pts[0]["y"] if len(pts) == 1 else 0
    n = len(pts)
    sum_x = sum(p["x"] for p in pts)
    sum_y = sum(p["y"] for p in pts)
    sum_xy = sum(p["x"] * p["y"] for p in pts)
    sum_x2 = sum(p["x"] ** 2 for p in pts)
    denom = n * sum_x2 - sum_x * sum_x
    if denom == 0:
        return sum_y / n
    slope = (n * sum_xy - sum_x * sum_y) / denom
    intercept = (sum_y - slope * sum_x) / n
    return round(slope * float(x) + intercept, 2)`,
    },
    tests: [
      { input: { dataset: 'prices', x: 3 }, expected: { prediction: 'number' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },
  // ---------------------------------------------------------------------------
  // Speech + Audio Input — backed by window.__speech (Web Speech / Web Audio).
  // See src/speech/speech.ts.
  // ---------------------------------------------------------------------------

  {
    name: 'ai_say',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Make the computer say something out loud',
    category: 'AI',
    inputs: [
      { name: 'text', type: 'string', description: 'What to say', default: 'Hello!' },
    ],
    outputs: [],
    implementations: {
      javascript: `function ai_say(text) {
  if (typeof window === 'undefined' || !window.__speech) return;
  window.__speech.say(String(text));
}`,
      python: `def ai_say(text):
    print("[Speech only works in JavaScript mode]")`,
    },
    tests: [
      { input: { text: 'Hello!' }, expected: {} },
    ],
    color: '#7C3AED',
    shape: 'statement',
  },

  {
    name: 'ai_say_and_wait',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Say something and wait until speaking finishes',
    category: 'AI',
    inputs: [
      { name: 'text', type: 'string', description: 'What to say', default: 'Hello!' },
    ],
    outputs: [],
    implementations: {
      javascript: `async function ai_say_and_wait(text) {
  if (typeof window === 'undefined' || !window.__speech) return;
  await window.__speech.say(String(text), true);
}`,
      python: `def ai_say_and_wait(text):
    print("[Speech only works in JavaScript mode]")`,
    },
    tests: [
      { input: { text: 'Hello!' }, expected: {} },
    ],
    color: '#7C3AED',
    shape: 'statement',
  },

  {
    name: 'ai_stop_speaking',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Stop whatever is currently being said',
    category: 'AI',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function ai_stop_speaking() {
  if (typeof window === 'undefined' || !window.__speech) return;
  window.__speech.stopSpeaking();
}`,
      python: `def ai_stop_speaking():
    print("[Speech only works in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#7C3AED',
    shape: 'statement',
  },

  {
    name: 'ai_listen',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Listen for a single spoken phrase and return the text',
    category: 'AI',
    inputs: [],
    outputs: [{ name: 'text', type: 'string' }],
    implementations: {
      javascript: `async function ai_listen() {
  if (typeof window === 'undefined' || !window.__speech) return "";
  return await window.__speech.listen();
}`,
      python: `def ai_listen():
    return ""`,
    },
    tests: [
      { input: {}, expected: { text: 'string' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },

  {
    name: 'ai_start_microphone',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Turn on the microphone so volume can be read. Asks permission the first time.',
    category: 'AI',
    inputs: [],
    outputs: [{ name: 'ok', type: 'boolean' }],
    implementations: {
      javascript: `async function ai_start_microphone() {
  if (typeof window === 'undefined' || !window.__speech) return false;
  return await window.__speech.startMic();
}`,
      python: `def ai_start_microphone():
    return False`,
    },
    tests: [
      { input: {}, expected: { ok: 'boolean' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },

  {
    name: 'ai_microphone_volume',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Current microphone volume (0 = silent, 100 = very loud). Call start microphone first.',
    category: 'AI',
    inputs: [],
    outputs: [{ name: 'volume', type: 'number' }],
    implementations: {
      javascript: `function ai_microphone_volume() {
  if (typeof window === 'undefined' || !window.__speech) return 0;
  return window.__speech.getMicVolume();
}`,
      python: `def ai_microphone_volume():
    return 0`,
    },
    tests: [
      { input: {}, expected: { volume: 'number' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },

  {
    name: 'ai_summary',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get classifier stats (example count, labels) as a string',
    category: 'AI',
    inputs: [
      { name: 'classifier', type: 'string', description: 'Classifier name' },
    ],
    outputs: [{ name: 'summary', type: 'string' }],
    implementations: {
      javascript: `function aiSummary(classifier) {
  window.__ai = window.__ai || { classifiers: {}, generators: {}, datasets: {} };
  if (!window.__ai.classifiers[classifier]) return "Classifier '" + classifier + "' not found";
  var c = window.__ai.classifiers[classifier];
  var labels = {};
  for (var i = 0; i < c.examples.length; i++) {
    labels[c.examples[i].label] = (labels[c.examples[i].label] || 0) + 1;
  }
  var parts = [];
  for (var l in labels) parts.push(l + ": " + labels[l]);
  return "Classifier '" + classifier + "' — " + c.examples.length + " examples, labels: " + (parts.length > 0 ? parts.join(", ") : "none");
}`,
      python: `def ai_summary(classifier):
    ai = globals().get("__ai", {"classifiers": {}, "generators": {}, "datasets": {}})
    if classifier not in ai["classifiers"]:
        return "Classifier '" + classifier + "' not found"
    c = ai["classifiers"][classifier]
    labels = {}
    for ex in c["examples"]:
        labels[ex["label"]] = labels.get(ex["label"], 0) + 1
    parts = [l + ": " + str(n) for l, n in labels.items()]
    return "Classifier '" + classifier + "' — " + str(len(c["examples"])) + " examples, labels: " + (", ".join(parts) if parts else "none")`,
    },
    tests: [
      { input: { classifier: 'mood' }, expected: { summary: 'string' } },
    ],
    color: '#7C3AED',
    shape: 'value',
  },
]
