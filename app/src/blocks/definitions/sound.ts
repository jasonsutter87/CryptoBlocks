import type { BlockDefinition } from '../../types/block'

export const soundBlocks: BlockDefinition[] = [
  {
    name: 'play_drum',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play a synthesized drum sound (kick, snare, hi-hat, clap, tom, cymbal)',
    category: 'Sound',
    inputs: [
      { name: 'drum_type', type: 'string', description: 'Drum type', default: 'kick', choices: ['kick', 'snare', 'hi-hat', 'clap', 'tom', 'cymbal'] },
    ],
    outputs: [],
    implementations: {
      javascript: `function playDrum(drumType) {
  if (parent !== window) { parent.postMessage({ __cryptoblocks: true, type: 'cmd', target: 'audio', action: 'playDrum', args: [drumType] }, '*'); return; }
  var ctx = window.__audio = window.__audio || new (window.AudioContext || window.webkitAudioContext)();
  var t = ctx.currentTime;
  if (drumType === "kick") {
    var osc = ctx.createOscillator(); var gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, t); osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    gain.gain.setValueAtTime(1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.3);
  } else if (drumType === "snare") {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var filt = ctx.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 3000;
    var gain = ctx.createGain(); gain.gain.setValueAtTime(0.8, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start(t);
  } else if (drumType === "hi-hat") {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var filt = ctx.createBiquadFilter(); filt.type = "highpass"; filt.frequency.value = 7000;
    var gain = ctx.createGain(); gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start(t);
  } else if (drumType === "clap") {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var filt = ctx.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 2000;
    var gain = ctx.createGain(); gain.gain.setValueAtTime(0.7, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start(t);
  } else if (drumType === "tom") {
    var osc = ctx.createOscillator(); var gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, t); osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    gain.gain.setValueAtTime(0.8, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.3);
  } else if (drumType === "cymbal") {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var filt = ctx.createBiquadFilter(); filt.type = "highpass"; filt.frequency.value = 5000;
    var gain = ctx.createGain(); gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start(t);
  }
}`,
      python: `def play_drum(drum_type):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { drum_type: 'kick' }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'play_note',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play a musical note (e.g. C4, D#5) for a duration in ms',
    category: 'Sound',
    inputs: [
      { name: 'note', type: 'string', description: 'Note name (e.g. C4, D#5, Bb3)', default: 'C4' },
      { name: 'duration', type: 'number', description: 'Duration in milliseconds', default: 500 },
    ],
    outputs: [],
    implementations: {
      javascript: `function playNote(note, duration) {
  var notes = {"C":261.63,"C#":277.18,"Db":277.18,"D":293.66,"D#":311.13,"Eb":311.13,"E":329.63,"F":349.23,"F#":369.99,"Gb":369.99,"G":392,"G#":415.3,"Ab":415.3,"A":440,"A#":466.16,"Bb":466.16,"B":493.88};
  var m = String(note).match(/^([A-Ga-g][#b]?)(\\d)$/);
  if (!m) return;
  var name = m[1].charAt(0).toUpperCase() + m[1].slice(1);
  var octave = parseInt(m[2]);
  var base = notes[name];
  if (!base) return;
  var freq = base * Math.pow(2, octave - 4);
  var ctx = window.__audio = window.__audio || new (window.AudioContext || window.webkitAudioContext)();
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = window.__instrument || "sine";
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration / 1000);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t); osc.stop(t + duration / 1000);
}`,
      python: `def play_note(note, duration):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { note: 'C4', duration: 500 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'play_tone',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play a raw frequency in Hz for a duration in ms',
    category: 'Sound',
    inputs: [
      { name: 'frequency', type: 'number', description: 'Frequency in Hz', default: 440 },
      { name: 'duration', type: 'number', description: 'Duration in milliseconds', default: 500 },
    ],
    outputs: [],
    implementations: {
      javascript: `function playTone(frequency, duration) {
  var ctx = window.__audio = window.__audio || new (window.AudioContext || window.webkitAudioContext)();
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = window.__instrument || "sine";
  osc.frequency.setValueAtTime(frequency, t);
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration / 1000);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t); osc.stop(t + duration / 1000);
}`,
      python: `def play_tone(frequency, duration):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { frequency: 440, duration: 500 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'set_tempo',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the tempo in BPM for beat patterns',
    category: 'Sound',
    inputs: [
      { name: 'bpm', type: 'number', description: 'Beats per minute', default: 120 },
    ],
    outputs: [],
    implementations: {
      javascript: `function setTempo(bpm) {
  window.__tempo = Number(bpm) || 120;
}`,
      python: `def set_tempo(bpm):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { bpm: 120 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'set_instrument',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the oscillator waveform (sine, square, sawtooth, triangle)',
    category: 'Sound',
    inputs: [
      { name: 'waveform', type: 'string', description: 'Waveform type', default: 'sine', choices: ['sine', 'square', 'sawtooth', 'triangle'] },
    ],
    outputs: [],
    implementations: {
      javascript: `function setInstrument(waveform) {
  var valid = ["sine", "square", "sawtooth", "triangle"];
  window.__instrument = valid.indexOf(waveform) >= 0 ? waveform : "sine";
}`,
      python: `def set_instrument(waveform):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { waveform: 'square' }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'play_chord',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play multiple comma-separated notes simultaneously',
    category: 'Sound',
    inputs: [
      { name: 'notes', type: 'string', description: 'Comma-separated notes (e.g. C4,E4,G4)', default: 'C4,E4,G4' },
      { name: 'duration', type: 'number', description: 'Duration in milliseconds', default: 500 },
    ],
    outputs: [],
    implementations: {
      javascript: `function playChord(notes, duration) {
  var noteMap = {"C":261.63,"C#":277.18,"Db":277.18,"D":293.66,"D#":311.13,"Eb":311.13,"E":329.63,"F":349.23,"F#":369.99,"Gb":369.99,"G":392,"G#":415.3,"Ab":415.3,"A":440,"A#":466.16,"Bb":466.16,"B":493.88};
  var ctx = window.__audio = window.__audio || new (window.AudioContext || window.webkitAudioContext)();
  var t = ctx.currentTime;
  String(notes).split(",").forEach(function(n) {
    n = n.trim();
    var m = n.match(/^([A-Ga-g][#b]?)(\\d)$/);
    if (!m) return;
    var name = m[1].charAt(0).toUpperCase() + m[1].slice(1);
    var octave = parseInt(m[2]);
    var base = noteMap[name];
    if (!base) return;
    var freq = base * Math.pow(2, octave - 4);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = window.__instrument || "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration / 1000);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + duration / 1000);
  });
}`,
      python: `def play_chord(notes, duration):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { notes: 'C4,E4,G4', duration: 500 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'create_pattern',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create an empty beat pattern with N beats',
    category: 'Sound',
    inputs: [
      { name: 'name', type: 'string', description: 'Pattern name' },
      { name: 'beats', type: 'number', description: 'Number of beats', default: 8 },
    ],
    outputs: [],
    implementations: {
      javascript: `function createPattern(name, beats) {
  window.__patterns = window.__patterns || {};
  var b = [];
  for (var i = 0; i < beats; i++) b.push([]);
  window.__patterns[name] = b;
}`,
      python: `def create_pattern(name, beats):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'beat1', beats: 8 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'add_beat',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add a drum or note sound at a beat position in a pattern',
    category: 'Sound',
    inputs: [
      { name: 'pattern', type: 'string', description: 'Pattern name' },
      { name: 'position', type: 'number', description: 'Beat position (1-based)', default: 1 },
      { name: 'sound', type: 'string', description: 'Sound: kick, snare, hi-hat, clap, tom, cymbal, or a note like C4', default: 'kick' },
    ],
    outputs: [],
    implementations: {
      javascript: `function addBeat(pattern, position, sound) {
  window.__patterns = window.__patterns || {};
  if (!window.__patterns[pattern]) { console.log("Error: Pattern '" + pattern + "' does not exist"); return; }
  var idx = Math.max(0, Math.min(Number(position) - 1, window.__patterns[pattern].length - 1));
  window.__patterns[pattern][idx].push(sound);
}`,
      python: `def add_beat(pattern, position, sound):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { pattern: 'beat1', position: 1, sound: 'kick' }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'play_pattern',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play a beat pattern once at the current tempo',
    category: 'Sound',
    inputs: [
      { name: 'name', type: 'string', description: 'Pattern name' },
    ],
    outputs: [],
    implementations: {
      javascript: `async function playPattern(name) {
  window.__patterns = window.__patterns || {};
  if (!window.__patterns[name]) { console.log("Error: Pattern '" + name + "' does not exist"); return; }
  var pat = window.__patterns[name];
  var bpm = window.__tempo || 120;
  var beatMs = 60000 / bpm;
  for (var i = 0; i < pat.length; i++) {
    for (var j = 0; j < pat[i].length; j++) {
      var s = pat[i][j];
      if (["kick","snare","hi-hat","clap","tom","cymbal"].indexOf(s) >= 0) {
        playDrum(s);
      } else {
        playNote(s, beatMs * 0.8);
      }
    }
    await new Promise(function(r) { setTimeout(r, beatMs); });
  }
}`,
      python: `def play_pattern(name):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'beat1' }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'rest',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Wait/rest for a duration in milliseconds',
    category: 'Sound',
    inputs: [
      { name: 'duration', type: 'number', description: 'Duration in milliseconds', default: 500 },
    ],
    outputs: [],
    implementations: {
      javascript: `async function rest(duration) {
  await new Promise(function(r) { setTimeout(r, duration); });
}`,
      python: `def rest(duration):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { duration: 500 }, expected: {} },
    ],
    color: '#DB2777',
  },
  // ── Multi-Track System ──────────────────────────────────────
  {
    name: 'create_track',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create a named track with an instrument and number of beats',
    category: 'Sound',
    inputs: [
      { name: 'name', type: 'string', description: 'Track name (e.g. drums, melody, bass)', default: 'melody' },
      { name: 'instrument', type: 'string', description: 'Waveform or "drums"', default: 'sine', choices: ['sine', 'square', 'sawtooth', 'triangle', 'drums'] },
      { name: 'beats', type: 'number', description: 'Number of beats', default: 8 },
    ],
    outputs: [],
    implementations: {
      javascript: `function createTrack(name, instrument, beats) {
  window.__tracks = window.__tracks || {};
  var b = [];
  for (var i = 0; i < beats; i++) b.push([]);
  window.__tracks[name] = { instrument: instrument, beats: b, volume: 0.5 };
}`,
      python: `def create_track(name, instrument, beats):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { name: 'melody', instrument: 'sine', beats: 8 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'add_note_to_track',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Add a note or drum sound at a beat position on a track',
    category: 'Sound',
    inputs: [
      { name: 'track', type: 'string', description: 'Track name', default: 'melody' },
      { name: 'position', type: 'number', description: 'Beat position (1-based)', default: 1 },
      { name: 'sound', type: 'string', description: 'Note (C4, D#5) or drum (kick, snare, hi-hat)', default: 'C4' },
    ],
    outputs: [],
    implementations: {
      javascript: `function addNoteToTrack(track, position, sound) {
  window.__tracks = window.__tracks || {};
  if (!window.__tracks[track]) { console.log("Error: Track '" + track + "' does not exist"); return; }
  var t = window.__tracks[track];
  var idx = Math.max(0, Math.min(Number(position) - 1, t.beats.length - 1));
  t.beats[idx].push(String(sound));
}`,
      python: `def add_note_to_track(track, position, sound):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { track: 'melody', position: 1, sound: 'C4' }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'set_track_volume',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Set the volume of a track (0.0 to 1.0)',
    category: 'Sound',
    inputs: [
      { name: 'track', type: 'string', description: 'Track name', default: 'melody' },
      { name: 'volume', type: 'number', description: 'Volume (0.0 = silent, 1.0 = max)', default: 0.5 },
    ],
    outputs: [],
    implementations: {
      javascript: `function setTrackVolume(track, volume) {
  window.__tracks = window.__tracks || {};
  if (!window.__tracks[track]) { console.log("Error: Track '" + track + "' does not exist"); return; }
  window.__tracks[track].volume = Math.max(0, Math.min(1, Number(volume)));
}`,
      python: `def set_track_volume(track, volume):
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: { track: 'melody', volume: 0.8 }, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'play_all_tracks',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Play all tracks simultaneously, synced to the current tempo',
    category: 'Sound',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `async function playAllTracks() {
  window.__tracks = window.__tracks || {};
  var noteMap = {"C":261.63,"C#":277.18,"Db":277.18,"D":293.66,"D#":311.13,"Eb":311.13,"E":329.63,"F":349.23,"F#":369.99,"Gb":369.99,"G":392,"G#":415.3,"Ab":415.3,"A":440,"A#":466.16,"Bb":466.16,"B":493.88};
  var drums = ["kick","snare","hi-hat","clap","tom","cymbal"];
  var ctx = window.__audio = window.__audio || new (window.AudioContext || window.webkitAudioContext)();
  var bpm = window.__tempo || 120;
  var beatDur = 60 / bpm;
  var t0 = ctx.currentTime + 0.05;
  var maxBeats = 0;
  var trackNames = Object.keys(window.__tracks);
  for (var ti = 0; ti < trackNames.length; ti++) {
    var tr = window.__tracks[trackNames[ti]];
    if (tr.beats.length > maxBeats) maxBeats = tr.beats.length;
    var vol = tr.volume != null ? tr.volume : 0.5;
    var inst = tr.instrument || "sine";
    for (var i = 0; i < tr.beats.length; i++) {
      var bt = t0 + i * beatDur;
      for (var j = 0; j < tr.beats[i].length; j++) {
        var s = tr.beats[i][j];
        if (drums.indexOf(s) >= 0) {
          if (s === "kick") {
            var o = ctx.createOscillator(); var g = ctx.createGain();
            o.frequency.setValueAtTime(150, bt); o.frequency.exponentialRampToValueAtTime(50, bt + 0.1);
            g.gain.setValueAtTime(vol, bt); g.gain.exponentialRampToValueAtTime(0.01, bt + 0.3);
            o.connect(g); g.connect(ctx.destination); o.start(bt); o.stop(bt + 0.3);
          } else if (s === "snare" || s === "clap") {
            var dur = s === "snare" ? 0.2 : 0.15;
            var freq = s === "snare" ? 3000 : 2000;
            var buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
            var d = buf.getChannelData(0); for (var k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
            var src = ctx.createBufferSource(); src.buffer = buf;
            var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq;
            var g = ctx.createGain(); g.gain.setValueAtTime(vol, bt); g.gain.exponentialRampToValueAtTime(0.01, bt + dur);
            src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(bt);
          } else if (s === "hi-hat") {
            var buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
            var d = buf.getChannelData(0); for (var k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
            var src = ctx.createBufferSource(); src.buffer = buf;
            var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
            var g = ctx.createGain(); g.gain.setValueAtTime(vol * 0.6, bt); g.gain.exponentialRampToValueAtTime(0.01, bt + 0.05);
            src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(bt);
          } else if (s === "tom") {
            var o = ctx.createOscillator(); var g = ctx.createGain();
            o.frequency.setValueAtTime(200, bt); o.frequency.exponentialRampToValueAtTime(80, bt + 0.2);
            g.gain.setValueAtTime(vol, bt); g.gain.exponentialRampToValueAtTime(0.01, bt + 0.3);
            o.connect(g); g.connect(ctx.destination); o.start(bt); o.stop(bt + 0.3);
          } else if (s === "cymbal") {
            var buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
            var d = buf.getChannelData(0); for (var k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
            var src = ctx.createBufferSource(); src.buffer = buf;
            var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 5000;
            var g = ctx.createGain(); g.gain.setValueAtTime(vol * 0.6, bt); g.gain.exponentialRampToValueAtTime(0.01, bt + 0.5);
            src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(bt);
          }
        } else {
          var m = String(s).match(/^([A-Ga-g][#b]?)(\\d)$/);
          if (m) {
            var nn = m[1].charAt(0).toUpperCase() + m[1].slice(1);
            var oct = parseInt(m[2]);
            var base = noteMap[nn];
            if (base) {
              var freq = base * Math.pow(2, oct - 4);
              var o = ctx.createOscillator(); var g = ctx.createGain();
              o.type = inst;
              o.frequency.setValueAtTime(freq, bt);
              g.gain.setValueAtTime(vol, bt);
              g.gain.exponentialRampToValueAtTime(0.01, bt + beatDur * 0.8);
              o.connect(g); g.connect(ctx.destination);
              o.start(bt); o.stop(bt + beatDur * 0.8);
            }
          }
        }
      }
    }
  }
  await new Promise(function(r) { setTimeout(r, maxBeats * beatDur * 1000); });
}`,
      python: `def play_all_tracks():
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#DB2777',
  },
  {
    name: 'clear_tracks',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove all tracks (reset the multi-track mixer)',
    category: 'Sound',
    inputs: [],
    outputs: [],
    implementations: {
      javascript: `function clearTracks() {
  window.__tracks = {};
}`,
      python: `def clear_tracks():
    print("[Sound is only available in JavaScript mode]")`,
    },
    tests: [
      { input: {}, expected: {} },
    ],
    color: '#DB2777',
  },
]
