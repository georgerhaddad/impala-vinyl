"""Times every sung word of the lyrics against your own audio, so the video's words land when they are sung.

    npm run align                                  # every track in records/index.json
    npm run align -- currents/01-let-it-happen     # just these

LRCLIB (the lyrics the page shows) only gives a start time per line, written by hand for some release of the song.
This listens to the audio in records/ with Whisper (faster-whisper, on the GPU if there is one), one window around
each line, prompted with that line's words; then lines Whisper's words up against the lyric's words (a fuzzy
sequence alignment) and takes their times. Words it could not hear are spread between the ones it did.

What it writes, assets/lyrics/<stem>.json, holds TIMES ONLY: no lyric text is stored in the repository. Each line
carries a hash of its text, so the page only uses the times when the lyrics it fetched are the same ones.
Setup (once): python -m venv tools/.venv, then with its pip (tools/.venv/Scripts/pip on Windows, tools/.venv/bin/pip
elsewhere) install faster-whisper, plus nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*" if there is an NVIDIA GPU.
"""
import json, os, re, subprocess, sys, time, unicodedata, urllib.parse, urllib.request
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RECORDS, OUT = ROOT / 'records', ROOT / 'assets' / 'lyrics'
SR = 16000
# the CUDA libraries come from pip packages (nvidia-cublas-cu12, nvidia-cudnn-cu12): on Windows, let it find their DLLs
for pkg in ('cublas', 'cudnn') if os.name == 'nt' else ():
    d = Path(sys.prefix) / 'Lib' / 'site-packages' / 'nvidia' / pkg / 'bin'
    if d.is_dir():
        os.add_dll_directory(str(d)); os.environ['PATH'] = str(d) + os.pathsep + os.environ['PATH']

import numpy as np  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

def norm_words(s):
    s = unicodedata.normalize('NFKD', s).lower().replace('’', "'")
    return [w for w in re.sub(r"[^a-z0-9' ]+", ' ', s).replace("'", '').split() if w]

def line_hash(text):
    """FNV-1a (32-bit) of the line's words, lower case, single-spaced. src/stage/lyrics.js computes the same."""
    h = 0x811c9dc5
    for b in ' '.join(norm_words(text)).encode('utf-8'):
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return h

def parse_lrc(text, dur):
    """The same lines src/stage/lyrics.js keeps: timed, not empty, not just a music note."""
    raw = []
    for ln in (text or '').splitlines():
        m = re.match(r'^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$', ln)
        if m: raw.append((int(m.group(1)) * 60 + float(m.group(2)), m.group(3).strip()))
    raw.sort(key=lambda x: x[0])
    out = []
    for i, (t, txt) in enumerate(raw):
        nxt = raw[i + 1][0] if i + 1 < len(raw) else (dur or t + 6)
        if not txt or re.fullmatch(r'[♪♫\s]*', txt): continue
        out.append({'t': t, 'next': nxt, 'text': txt, 'words': txt.split()})
    return out

def lrclib(title, dur):
    """The query the page makes (src/stage/lyrics.js): with the duration, then without."""
    ua = {'User-Agent': 'impala-vinyl lyric aligner (https://github.com/rauchg/vinyl fork)'}
    for q in ({'artist_name': 'Tame Impala', 'track_name': title, 'duration': str(round(dur))}, {'artist_name': 'Tame Impala', 'track_name': title}):
        try:
            with urllib.request.urlopen(urllib.request.Request('https://lrclib.net/api/get?' + urllib.parse.urlencode(q), headers=ua), timeout=20) as r:
                j = json.load(r)
                if j.get('syncedLyrics'): return j['syncedLyrics']
        except Exception:
            pass
    return None

def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), 'pipe:1'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)

def align(lw, ww):
    """Needleman-Wunsch between the lyric's words and Whisper's. Returns {lyric index: whisper index}."""
    a, b = [norm_words(w) for w in lw], [norm_words(w['w']) for w in ww]
    a = [x[0] if x else '' for x in a]; b = [x[0] if x else '' for x in b]
    n, m, G = len(a), len(b), -0.4
    S = [[0.0] * (m + 1) for _ in range(n + 1)]; T = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): S[i][0] = i * G; T[i][0] = 1
    for j in range(1, m + 1): S[0][j] = j * G; T[0][j] = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            r = 1.0 if a[i - 1] == b[j - 1] else SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
            sim = 2.0 if r == 1.0 else (1.0 if r >= 0.6 else -1.0)
            best = max((S[i - 1][j - 1] + sim, 0), (S[i - 1][j] + G, 1), (S[i][j - 1] + G, 2))
            S[i][j], T[i][j] = best
    i, j, pairs = n, m, {}
    while i > 0 or j > 0:
        t = T[i][j]
        if t == 0:
            r = 1.0 if a[i - 1] == b[j - 1] else SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
            if r >= 0.6: pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif t == 1: i -= 1
        else: j -= 1
    return pairs

def time_line(model, audio, line, nxt_t, prev_end):
    """Whisper on a window round one line; the line's words get times (None where nothing matched)."""
    t0 = max(prev_end - 0.1, line['t'] - 0.8, 0.0)
    t1 = min(len(audio) / SR, max(nxt_t, line['t'] + 2.0) + 0.6)
    clip = audio[int(t0 * SR):int(t1 * SR)]
    if len(clip) < SR * 0.5: return [None] * len(line['words']), None
    segs, _ = model.transcribe(clip, language='en', word_timestamps=True, beam_size=5, vad_filter=False,
                               condition_on_previous_text=False, initial_prompt=line['text'], temperature=0.0)
    ww = [{'w': w.word, 's': t0 + w.start, 'e': t0 + w.end, 'p': w.probability} for s in segs for w in (s.words or [])]
    # Whisper pins a clip's first word to the start of the clip when music comes first, and sometimes stacks
    # several words on one instant: neither is a real time
    for k, w in enumerate(ww):
        w['bad'] = w['s'] < t0 + 0.2 or (k and abs(w['s'] - ww[k - 1]['s']) < 0.02) or w['e'] - w['s'] < 0.02
    pairs = align(line['words'], ww)
    times = [None] * len(line['words']); end = None
    for li, wi in pairs.items():
        if ww[wi]['bad']: continue
        times[li] = ww[wi]['s']
        end = max(end or 0, ww[wi]['e'])
    # a line that landed far from where LRCLIB has it caught a different repeat of the same words: don't trust it
    w = [1 + len(re.sub(r'[^a-z0-9]', '', x.lower())) for x in line['words']]
    for k, x in enumerate(times):
        if x is not None and abs(x - (line['t'] + 0.075 * sum(w[:k]))) > 1.2 + 0.05 * k:
            return [None] * len(line['words']), None
    # keep them in order: a match that runs backwards is dropped
    last = -1
    for k, x in enumerate(times):
        if x is not None:
            if x < last: times[k] = None
            else: last = x
    return times, end

def fill(times, words, t_start, t_end):
    """Words Whisper did not catch: between two it did, spread by length; before the first or after the last,
    at about 13 letters a second."""
    n = len(times); w = [1 + len(re.sub(r'[^a-z0-9]', '', x.lower())) for x in words]
    known = [k for k, x in enumerate(times) if x is not None]
    if not known: return None
    out = list(times)
    k0 = known[0]
    if k0:                                   # the words before the first one heard: from LRCLIB's start up to it
        a = min(t_start, times[k0] - 0.12 * k0); span, acc = sum(w[:k0]) or 1, 0
        for k in range(k0): out[k] = a + (times[k0] - a) * acc / span; acc += w[k]
    for ka, kb in zip(known, known[1:]):
        span, acc = sum(w[ka:kb]), w[ka]
        for k in range(ka + 1, kb): out[k] = times[ka] + (times[kb] - times[ka]) * acc / span; acc += w[k]
    t = times[known[-1]]
    for k in range(known[-1] + 1, n): t += 0.075 * w[k - 1]; out[k] = min(t, t_end)
    return out

def run(stem, path, title, model):
    audio = decode(path); dur = len(audio) / SR
    lrc = lrclib(title, dur)
    if not lrc: return {'stem': stem, 'skip': 'no synced lyrics on LRCLIB'}
    lines = parse_lrc(lrc, dur)
    if not lines: return {'stem': stem, 'skip': 'instrumental'}
    out, offs, heard, total, prev_end = [], [], 0, 0, 0.0
    for i, ln in enumerate(lines):
        times, end = time_line(model, audio, ln, ln['next'], prev_end)
        got = sum(x is not None for x in times); heard += got; total += len(times)
        filled = fill(times, ln['words'], ln['t'], ln['next']) if got else None
        if filled is None:   # nothing heard: keep the line where LRCLIB put it, moved by the track's usual error so far
            off = float(np.median(offs)) if offs else 0.0
            filled = None; start = ln['t'] + off
        else:
            start = filled[0]; offs.append(start - ln['t']); prev_end = end or filled[-1]
        out.append({'h': line_hash(ln['text']), 'n': len(ln['words']), 's': round(start, 3),
                    't': [round(x, 3) for x in filled] if filled else None, 'e': round(end, 3) if end else None, 'q': round(got / max(1, len(times)), 2)})
    res = {'version': 1, 'source': 'lrclib+whisper', 'heard': round(heard / max(1, total), 3),
           'offset': round(float(np.median(offs)), 3) if offs else 0.0, 'lines': out}
    dst = OUT / (stem + '.json'); dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(res, separators=(',', ':')))
    return {'stem': stem, 'title': title, 'lines': len(out), 'heard': res['heard'], 'offset': res['offset'],
            'spread': round(float(np.percentile(offs, 90) - np.percentile(offs, 10)), 2) if len(offs) > 2 else None}

def main():
    index = json.loads((RECORDS / 'index.json').read_text())
    cat = json.loads(subprocess.run(['node', '-e', "import('./src/catalog.js').then(m=>console.log(JSON.stringify(m.ALL_TRACKS.map(t=>({title:t.title,file:t.file})))))"],
                                    cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    titles = {t['file']: t['title'] for t in cat}
    want = sys.argv[1:] or list(index)
    dev = 'cuda'
    try: model = WhisperModel(os.environ.get('WHISPER_MODEL', 'large-v3'), device=dev, compute_type='float16', download_root=str(ROOT / 'tools' / '.models'))
    except Exception as e:
        print('no GPU (' + str(e).splitlines()[0] + '), using the CPU: slow'); model = WhisperModel(os.environ.get('WHISPER_MODEL', 'medium'), device='cpu', compute_type='int8', download_root=str(ROOT / 'tools' / '.models'))
    for stem in want:
        if stem not in index: print(f'{stem}: not in records/index.json'); continue
        t0 = time.time()
        r = run(stem, RECORDS / index[stem], titles.get(stem, stem), model)
        r['s'] = round(time.time() - t0, 1)
        print(json.dumps(r), flush=True)

if __name__ == '__main__':
    main()
