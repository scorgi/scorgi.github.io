"""Render the Scorgi product video in three formats.

    python3 scripts/build-marketing-video.py            # wide, square, vertical
    python3 scripts/build-marketing-video.py wide       # just 16:9

Story: brand open → the problem → six product walkthroughs (real screens, with
step markers and a cursor that clicks through them) → proof → call to action.

Outputs videos/scorgi-overview-{wide,square,vertical}.mp4, a poster frame for
each, and WebVTT captions. Requires Pillow and ffmpeg. Fonts (Outfit, DM Sans;
OFL) download once into ~/.cache/scorgi-fonts.

Every screen is a real capture (see images/SCREENSHOTS.md for how each was
redacted). Click targets for the walkthroughs live in images/video/targets.json.
"""
import json
import math
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FPS = 30
STEP = 4.0          # seconds each walkthrough screen is held
XFADE = 0.5         # crossfade between segments
SLIDE = 0.55        # still screens slide in when the step changes

GREEN = (68, 202, 129)
GREEN_DEEP = (20, 84, 52)
GREEN_DARK = (27, 95, 58)
GREEN_SOFT = (226, 246, 235)
ORANGE = (249, 142, 82)
INK = (22, 28, 25)
MUTED = (92, 102, 97)
FAINT = (156, 164, 160)
BG = (248, 250, 248)
WHITE = (255, 255, 255)

V = "images/video/"
A = "images/scorgi-app/"
F = "images/foley-prep/"

# Each step: source, step label, caption, mode, view.
#   source "clip:<name>" plays images/video/clips/<name>.mp4 between mode = (start, end) seconds;
#   any other source is a still screenshot (mode None) framed on view = (x0, y0, x1, y1) fractions.
CHAPTERS = [
    {"rail": "Tests", "eyebrow": "DIGITAL PRACTICE TESTS", "head": ("Give students a real ", "test-day experience."),
     "steps": [
         ("clip:tests", "Annotate", "Highlight the passage and keep notes beside it", ("clip", "Annotate", "Eliminate", 0.4, 8.6), None),
         ("clip:tests", "Eliminate", "Cross out wrong answers, just like the real exam", ("clip", "Eliminate", "Review", 0.2, 5.4), None),
         ("clip:tests", "Review", "Pick an answer, flag it, and review before submitting", ("clip", "Review", None, 0.0, 6.6), None),
     ]},
    {"rail": "Insights", "eyebrow": "INSIGHTS & PROGRESS", "head": ("Show every family ", "where the points are."),
     "steps": [
         ("clip:insights", "Progress", "Scores, trends, and gains since the last test, in one view", ("clip", "Progress", "Topic board", 0.3, 8.0), None),
         ("clip:insights", "Topic board", "Every topic from Beginner to Mastery, with the detail behind it", ("clip", "Topic board", "Worksheet", 0.6, 9.4), None),
         ("clip:insights", "Worksheet", "One click turns focus topics into a practice worksheet", ("clip", "Worksheet", None, 0.0, 6.8), None),
     ]},
    {"rail": "Colleges", "eyebrow": "SCHOOL TRACKER", "head": ("Guide every family ", "through college admissions."),
     "steps": [
         ("clip:schools", "My Schools", "Every school with its fit, deadline, and application checklist", ("clip", "My Schools", "Map", 0.0, 10.5), None),
         ("clip:schools", "Map", "Every school on the map, one click for the details", ("clip", "Map", None, 0.4, 12.0), None),
     ]},
    {"rail": "Booking", "eyebrow": "ONLINE BOOKING", "head": ("Families book ", "without a phone call."),
     "steps": [
         ("clip:booking", "Location", "Families pick the location that suits them", ("clip", "Location", "Service", 0.0, 4.6), None),
         ("clip:booking", "Service", "Then the service: consultations, classes, mock exams, tutoring", ("clip", "Service", "Time", 0.0, 6.4), None),
         ("clip:booking", "Time", "Live availability, with the tutors families already know", ("clip", "Time", None, 0.0, 5.4), None),
     ]},
    {"rail": "Schedule", "eyebrow": "STAFF SCHEDULING", "head": ("Your whole team's week, ", "in one view."),
     "steps": [
         ("clip:schedule", "Day", "Every tutor, class, and mock exam for the day", ("clip", "Day", "Week", 0.0, 5.6), None),
         ("clip:schedule", "Week", "The full week across your team", ("clip", "Week", "Class", 0.0, 7.2), None),
         ("clip:schedule", "Class", "Open any class to see the roster and who has paid", ("clip", "Class", None, 0.3, 6.2), None),
     ]},
    {"rail": "Front desk", "eyebrow": "KIOSK & TIME CLOCK", "head": ("Kiosk check-in ", "and time clock."),
     "steps": [
         ("clip:kiosk", "Kiosk", "Students tap their session and their name on the lobby kiosk", ("clip", "Check in", "Checked in", 0.0, 9.9), None),
         ("clip:kiosk", "Checked in", "Checked in, and the session's count updates for staff", ("clip", "Checked in", None, 0.0, 3.6), None),
         ("clip:clock", "Clock in", "Staff clock in from the portal with a quick photo", ("clip", "Clock in", None, 11.7, 6.0), None),
         ("clip:clock", "Clock out", "Clocked in, then clock out the same way at the end of the shift", ("clip", "Clock in", None, 27.9, 8.8), None),
     ]},
    {"rail": "Operations", "eyebrow": "OPERATIONS", "head": ("Run every location ", "from one screen."),
     "steps": [
         (A + "management-overview-2026-10.webp", "Today", "What needs attention, every morning", None, (0.0, 0.0, 1.0, 1.0)),
         (A + "communications-thread.webp", "Inbox", "Calls and texts in one inbox, with AI after hours", None, (0.0, 0.0, 1.0, 0.77)),
         (A + "knowledge-base-2026-10.webp", "Knowledge", "Answers built from real client questions", None, (0.0, 0.0, 1.0, 0.85)),
     ]},
    {"rail": "Brand", "eyebrow": "WHITE-LABEL", "head": ("Your brand. ", "Your platform."),
     "steps": [
         (V + "scorgi-dash.webp", "As Scorgi", "Scorgi, out of the box", None, (0.0, 0.0, 1.0, 1.0)),
         ("clip:brand", "As Foley Prep", "The same platform, running as foleyprep.com", ("clip", "As Foley Prep", None, 0.3, 6.0), None),
     ]},
]
CLIP_ASPECT = 2688 / 1236

# ─── 60–90s ad cut ──────────────────────────────────────────────────────────
# Same recordings, trimmed to the strongest moment of each feature.
# Clip mode here is ("clip", start mark, end mark, offset seconds, max seconds).
AD_CHAPTERS = [
    {"rail": "Tests", "eyebrow": "DIGITAL PRACTICE TESTS", "head": ("Give students a real ", "test-day experience."),
     "steps": [
         ("clip:tests", "Annotate", "Highlight the passage and keep notes beside it", ("clip", "Annotate", "Eliminate", 0.4, 5.6), None),
         ("clip:tests", "Eliminate", "Cross out wrong answers, just like the real exam", ("clip", "Eliminate", "Review", 0.2, 5.4), None),
     ]},
    {"rail": "Insights", "eyebrow": "INSIGHTS & PROGRESS", "head": ("Show every family ", "where the points are."),
     "steps": [
         ("clip:insights", "Progress", "Scores, trends, and gains since the last test", ("clip", "Progress", "Topic board", 0.3, 5.2), None),
         ("clip:insights", "Topic board", "Every topic from Beginner to Mastery", ("clip", "Topic board", "Worksheet", 1.6, 6.4), None),
     ]},
    {"rail": "Colleges", "eyebrow": "SCHOOL TRACKER", "head": ("Guide every family ", "through college admissions."),
     "steps": [
         ("clip:schools", "My Schools", "Fit, deadlines, and checklists for every school", ("clip", "My Schools", "Map", 0.4, 5.4), None),
     ]},
    {"rail": "Booking", "eyebrow": "ONLINE BOOKING", "head": ("Families book ", "without a phone call."),
     "steps": [
         ("clip:booking", "Time", "Families book from your team's live availability", ("clip", "Time", None, 0.0, 4.8), None),
     ]},
    {"rail": "Schedule", "eyebrow": "STAFF SCHEDULING", "head": ("Your whole team's week, ", "in one view."),
     "steps": [
         ("clip:schedule", "Week", "Every tutor and class across the week", ("clip", "Week", "Class", 0.8, 4.4), None),
     ]},
    {"rail": "Front desk", "eyebrow": "KIOSK & TIME CLOCK", "head": ("Kiosk check-in ", "and time clock."),
     "steps": [
         ("clip:kiosk", "Kiosk", "Students check themselves in at the lobby kiosk", ("clip", "Check in", "Checked in", 3.4, 6.5), None),
         ("clip:clock", "Clock in", "Staff clock in and out with a quick photo", ("clip", "Clock in", None, 15.0, 4.6), None),
     ]},
    {"rail": "Brand", "eyebrow": "WHITE-LABEL", "head": ("Your brand. ", "Your platform."),
     "steps": [
         ("clip:brand", "As Foley Prep", "Running today as foleyprep.com, under your brand", ("clip", "As Foley Prep", None, 0.3, 5.6), None),
     ]},
]
AD = False


TOOLS = ["Scheduling app", "Test platform", "Spreadsheets", "Texting app", "Payment links", "CRM"]
PROOF = [("20,000+", "students trained", 20000, "+"), ("46,000+", "tests graded", 46000, "+"),
         ("7", "New Jersey locations", 7, ""), ("4.9", "Google rating", 4.9, "")]

OPEN, PROBLEM, PROOF_T, CTA = 4.6, 6.0, 6.0, 7.0
CARD = 3.9          # section title card before each chapter (text readable for ~2.5s)
MIN_STEP = 5.0      # shortest time any step stays on screen
FORMATS = {"wide": (1920, 1080), "square": (1080, 1080), "vertical": (1080, 1920)}
FONT_URLS = {
    "Outfit.ttf": "https://github.com/google/fonts/raw/main/ofl/outfit/Outfit%5Bwght%5D.ttf",
    "DMSans.ttf": "https://github.com/google/fonts/raw/main/ofl/dmsans/DMSans%5Bopsz,wght%5D.ttf",
}


# ─── Primitives ──────────────────────────────────────────────────────────────

def font_path(name):
    cache = Path.home() / ".cache" / "scorgi-fonts"
    cache.mkdir(parents=True, exist_ok=True)
    path = cache / name
    if not path.exists():
        urllib.request.urlretrieve(FONT_URLS[name], path)
    return str(path)


_fonts = {}


def font(family, size, weight):
    key = (family, int(size), weight)
    if key not in _fonts:
        f = ImageFont.truetype(font_path(family), int(size))
        f.set_variation_by_name(weight)
        _fonts[key] = f
    return _fonts[key]


def clamp(t):
    return max(0.0, min(1.0, t))


def ease(t):
    return 1 - (1 - clamp(t)) ** 3


def ease_io(t):
    t = clamp(t)
    return 3 * t * t - 2 * t * t * t


def ramp(t, start, length):
    return ease((t - start) / length)


def lerp(a, b, k):
    return a + (b - a) * k


def text_layer(text, fnt, color, alpha=255):
    box = fnt.getbbox(text)
    layer = Image.new("RGBA", (box[2] + 6, box[3] + 10), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((0, 0), text, font=fnt, fill=tuple(color) + (alpha,))
    return layer


def gradient_text(text, fnt, a=GREEN, b=ORANGE):
    box = fnt.getbbox(text)
    w, h = box[2] + 6, box[3] + 10
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text((0, 0), text, font=fnt, fill=255)
    grad = Image.linear_gradient("L").rotate(90).resize((w, h))
    colored = Image.merge("RGB", [grad.point(lambda v, i=i: int(b[i] + (a[i] - b[i]) * v / 255)) for i in range(3)])
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(colored, (0, 0), mask)
    return out


def paste(base, layer, xy, opacity=1.0):
    if opacity <= 0.01:
        return
    if opacity < 0.99:
        layer = layer.copy()
        layer.putalpha(layer.getchannel("A").point(lambda v: int(v * opacity)))
    base.alpha_composite(layer, (int(round(xy[0])), int(round(xy[1]))))


def wrap(text, fnt, width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if fnt.getlength(trial) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def light_bg(w, h):
    base = Image.new("RGB", (w, h), BG)
    glow = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(glow)
    r = int(max(w, h) * 0.42)
    d.ellipse((-r // 2, -r // 2, r, r), fill=(212, 243, 225))
    d.ellipse((w - r, h - r, w + r // 2, h + r // 2), fill=(254, 228, 211))
    glow = glow.filter(ImageFilter.GaussianBlur(max(w, h) // 8))
    return Image.blend(base, glow, 0.9).convert("RGBA")


def brand_bg(w, h):
    """Deep Scorgi green with a lighter green sweep and a warm orange glow."""
    lite = (46, 150, 94)
    d_ = int(math.hypot(w, h)) + 4
    grad = Image.linear_gradient("L").resize((d_, d_)).rotate(-35, resample=Image.Resampling.BICUBIC)
    grad = grad.crop(((d_ - w) // 2, (d_ - h) // 2, (d_ - w) // 2 + w, (d_ - h) // 2 + h))
    base = Image.merge("RGB", [grad.point(lambda v, i=i: int(GREEN_DEEP[i] + (lite[i] - GREEN_DEEP[i]) * v / 255 * 0.85)) for i in range(3)])
    glow = Image.new("RGB", (w, h), (0, 0, 0))
    d = ImageDraw.Draw(glow)
    r = int(max(w, h) * 0.35)
    d.ellipse((w - r, h - r, w + r, h + r), fill=(120, 70, 25))
    d.ellipse((-r // 2, -r // 2, r, r), fill=(25, 60, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(max(w, h) // 7))
    return ImageChops.add(base, glow).convert("RGBA")


_cards = {}


def browser_card(w, h, s):
    key = (w, h)
    if key in _cards:
        return _cards[key]
    radius, bar = max(12, int(18 * s)), max(24, int(36 * s))
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius, fill=WHITE + (255,), outline=(220, 228, 223, 255), width=2)
    d.rounded_rectangle((0, 0, w - 1, bar), radius, fill=(241, 244, 242, 255))
    d.rectangle((0, bar - radius, w - 1, bar), fill=(241, 244, 242, 255))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx, cy, rr = bar * 0.62 + i * bar * 0.56, bar / 2, bar * 0.16
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=c + (255,))
    pad = int(64 * s) + 30
    shadow = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((pad, pad + int(24 * s), w + pad, h + pad + int(24 * s)), radius, fill=(18, 58, 38, 72))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(30 * s) + 6))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius, fill=255)
    _cards[key] = (card, shadow, pad, (2, bar + 1, w - 2, h - 2), mask)
    return _cards[key]


def cursor_sprite(scale):
    pts = [(0, 0), (0, 17), (4.2, 13.2), (7.2, 20), (9.6, 19), (6.6, 12.3), (12.2, 12.3)]
    k = scale
    w, h = int(16 * k), int(24 * k)
    spr = Image.new("RGBA", (w + 8, h + 8), (0, 0, 0, 0))
    sh = Image.new("RGBA", spr.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).polygon([(4 + x * k + 2, 4 + y * k + 3) for x, y in pts], fill=(0, 0, 0, 90))
    spr.alpha_composite(sh.filter(ImageFilter.GaussianBlur(2)))
    d = ImageDraw.Draw(spr)
    poly = [(4 + x * k, 4 + y * k) for x, y in pts]
    d.polygon(poly, fill=(18, 18, 18, 255), outline=(255, 255, 255, 255))
    d.line(poly + [poly[0]], fill=(255, 255, 255, 255), width=max(2, int(k * 0.9)))
    return spr


# ─── Layout ─────────────────────────────────────────────────────────────────

class Layout:
    """Chapter frame: progress bar, one-line header with step markers, then a large product window."""
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.kind = "wide" if w > h else ("vertical" if h > w else "square")
        if self.kind == "wide":
            self.s = 1.0
            self.margin = 64
            self.bar_y = 34
            self.head_y = 74
            self.head, self.eyebrow, self.pill, self.caption = 50, 19, 19, 28
            self.card = (64, 184, 1856, 1046)
        elif self.kind == "vertical":
            self.s = 1.0
            self.margin = 50
            self.bar_y = 110
            self.head_y = 190
            self.head, self.eyebrow, self.pill, self.caption = 72, 25, 24, 36
            self.card = (30, 520, 1050, 1520)
            if AD:   # phone feeds: bigger type, full-width product window
                self.head, self.eyebrow, self.pill, self.caption = 84, 28, 27, 40
                self.card = (12, 560, 1068, 1560)
        else:
            self.s = 0.85
            self.margin = 44
            self.bar_y = 34
            self.head_y = 66
            self.head, self.eyebrow, self.pill, self.caption = 46, 18, 18, 24
            self.card = (30, 262, 1050, 1050)


# ─── Assets ─────────────────────────────────────────────────────────────────

class Assets:
    def __init__(self, L):
        self.L = L
        self.light = light_bg(L.w, L.h)
        self.brand = brand_bg(L.w, L.h)
        logo = Image.open(ROOT / "images/scorgi-logo.png").convert("RGBA")
        self.logo = logo.crop(logo.getbbox())
        self.fp_logo = Image.open(ROOT / "images/video/foleyprep-logo.png").convert("RGBA")
        self.images, self.clips, self.readers = {}, {}, {}
        for ch in CHAPTERS:
            for src, *_ in ch["steps"]:
                if src.startswith("clip:"):
                    name = src[5:]
                    if name not in self.clips:
                        self.clips[name] = json.load(open(ROOT / f"images/video/clips/{name}.json"))
                elif src not in self.images:
                    self.images[src] = Image.open(ROOT / src).convert("RGB")
        self.rects = {}
        x0, y0, x1, y1 = L.card
        bar = max(24, int(36 * L.s))
        for i, ch in enumerate(CHAPTERS):
            if L.kind == "wide":
                self.rects[i] = L.card
                continue
            # square / vertical: the window takes the screens' own shape, centered with its caption below
            aspects = sorted(CLIP_ASPECT if src.startswith("clip:") else
                             self.images[src].width * (v[2] - v[0]) / (self.images[src].height * (v[3] - v[1]))
                             for src, _, _, _, v in ch["steps"])
            a = aspects[len(aspects) // 2]
            h = min(y1 - y0, int((x1 - x0 - 4) / a) + bar + 3)
            room = 120 if L.kind == "vertical" else 90
            top = y0 + max(0, (y1 - y0 - h - room) // 2)
            self.rects[i] = (x0, top, x1, top + h)

    def steps_timed(self, ch):
        return steps_timed(ch)

    def _unused(self, ch):
        out, t = [], 0.0
        for src, _, _, mode, _ in ch["steps"]:
            if src.startswith("clip:"):
                meta = self.clips[src[5:]]
                marks = dict(meta["marks"])
                a = marks[mode[1]]
                b = marks[mode[2]] if mode[2] else meta["duration"]
                d = b - a
            else:
                d = STEP
            out.append((t, d))
            t += d
        return out

    def clip_frame(self, name, t, w, h):
        key = (name, w, h)
        r = self.readers.get(key)
        if r is None:
            r = self.readers[key] = ClipReader(ROOT / f"images/video/clips/{name}.mp4", w, h)
        return r.get(t)

    def window_for(self, i):
        x0, y0, x1, y1 = self.rects[i]
        return (x0, y0, x1, y1), browser_card(x1 - x0, y1 - y0, self.L.s)

    def logo_at(self, size):
        return self.logo.resize((int(size), int(size * self.logo.height / self.logo.width)), Image.Resampling.LANCZOS)



# ─── Screen inside the window ───────────────────────────────────────────────

_CLIP_META = {}


def clip_meta(name):
    if name not in _CLIP_META:
        _CLIP_META[name] = json.load(open(ROOT / f"images/video/clips/{name}.json"))
    return _CLIP_META[name]


def step_footage(step):
    """Seconds of real footage a clip step plays (None for stills)."""
    src, _, _, mode, _ = step
    if not src.startswith("clip:"):
        return None
    meta = clip_meta(src[5:])
    marks = dict(meta["marks"])
    a = marks[mode[1]] + (mode[3] if len(mode) > 3 else 0)
    d = (marks[mode[2]] if mode[2] else meta["duration"]) - a
    return min(d, mode[4]) if len(mode) > 4 else d


def steps_timed(ch):
    """[(start, duration)] for each step. Every step stays up at least MIN_STEP seconds so its
    caption can be read; a clip that runs out sooner holds on its last frame."""
    out, t = [], 0.0
    for step in ch["steps"]:
        f = step_footage(step)
        d = max(MIN_STEP, f) if f is not None else max(MIN_STEP, STEP)
        out.append((t, d))
        t += d
    return out


class ClipReader:
    """Sequential frame reader for a recorded clip, scaled to fill the window width (top-aligned)."""
    def __init__(self, path, w, h):
        self.path, self.w, self.h = path, w, h
        self.proc, self.idx, self.frame = None, -1, None

    def _open(self, n):
        if self.proc:
            self.proc.kill()
        vf = f"scale={self.w}:-2:flags=lanczos,pad={self.w}:'max(ih,{self.h})':0:0:color=white,crop={self.w}:{self.h}:0:0"
        self.proc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-ss", f"{n / FPS:.3f}", "-i", str(self.path),
                                      "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.idx = n - 1

    def get(self, t):
        n = max(0, int(round(t * FPS)))
        if self.proc is None or n <= self.idx - 1 or n > self.idx + 45:
            self._open(n)
        size = self.w * self.h * 3
        while self.idx < n:
            buf = self.proc.stdout.read(size)
            if len(buf) < size:
                break                                   # end of clip: hold the last frame
            self.frame = Image.frombytes("RGB", (self.w, self.h), buf)
            self.idx += 1
        return self.frame


def frame_still(img, cw, ch, view):
    """A still screenshot at full width, framed on its view and top-aligned. No zoom."""
    iw, ih = img.size
    vx0, vy0, vx1, vy1 = view[0] * iw, view[1] * ih, view[2] * iw, view[3] * ih
    crop = img.crop((int(vx0), int(vy0), int(vx1), int(vy1)))
    s = cw / crop.width
    crop = crop.resize((cw, max(1, int(round(crop.height * s)))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (cw, ch), crop.getpixel((cw // 2, crop.height - 2)))
    canvas.paste(crop.crop((0, 0, cw, min(ch, crop.height))), (0, 0))
    return canvas


# ─── Segments ───────────────────────────────────────────────────────────────

def seg_open(A, t):
    L = A.L
    f = A.brand.copy()
    s = 1.0 if L.kind == "wide" else (1.15 if L.kind == "vertical" else 0.95)
    logo_size = 250 * s
    word = font("Outfit.ttf", 118 * s, "Bold")
    tag = font("DMSans.ttf", 40 * s, "Medium")
    sub = font("DMSans.ttf", 26 * s, "Bold")
    tag_lines = wrap("The all-in-one platform for tutoring businesses", tag, L.w * 0.82)
    gap1, gap2, gap3 = 30 * s, 26 * s, 40 * s
    logo = A.logo_at(logo_size)
    wl = text_layer("Scorgi", word, WHITE)
    block = logo.height + gap1 + word.size + gap2 + len(tag_lines) * tag.size * 1.3 + gap3 + sub.size
    y = (L.h - block) / 2
    k = ramp(t, 0.1, 0.8)
    pop = 0.86 + 0.14 * k + 0.03 * math.sin(clamp((t - 0.1) / 0.8) * math.pi)
    lg = A.logo_at(logo_size * pop)
    m = int(lg.width * 0.7)
    halo = Image.new("RGBA", (lg.width + 2 * m, lg.height + 2 * m), (255, 255, 255, 0))
    ImageDraw.Draw(halo).ellipse((m * 0.55, m * 0.55, halo.width - m * 0.55, halo.height - m * 0.55), fill=(255, 255, 255, 40))
    halo = halo.filter(ImageFilter.GaussianBlur(m * 0.45))
    paste(f, halo, ((L.w - halo.width) / 2, y + logo.height / 2 - halo.height / 2), k)
    paste(f, lg, ((L.w - lg.width) / 2, y + (logo.height - lg.height) / 2), k)
    y += logo.height + gap1
    k = ramp(t, 0.55, 0.7)
    paste(f, wl, ((L.w - wl.width) / 2, y + (1 - k) * 24), k)
    y += word.size + gap2
    k = ramp(t, 1.05, 0.7)
    for line in tag_lines:
        tl = text_layer(line, tag, (226, 245, 233))
        paste(f, tl, ((L.w - tl.width) / 2, y + (1 - k) * 18), k)
        y += tag.size * 1.3
    y += gap3
    k = ramp(t, 1.6, 0.7)
    pt = text_layer("BUILT AND PROVEN AT FOLEY PREP", sub, (255, 214, 186))
    pw, ph = pt.width + 56 * s, sub.size + 30 * s
    pill = Image.new("RGBA", (int(pw), int(ph)), (0, 0, 0, 0))
    ImageDraw.Draw(pill).rounded_rectangle((0, 0, pw - 1, ph - 1), int(ph / 2), outline=(255, 214, 186, 200), width=2)
    pill.alpha_composite(pt, (int(28 * s), int((ph - sub.size) / 2 - sub.size * 0.12)))
    paste(f, pill, ((L.w - pw) / 2, y - 14 * s), k)
    return f


def seg_problem(A, t):
    L = A.L
    f = A.light.copy()
    s = L.s if L.kind != "vertical" else 1.1
    big = (1.15 if L.kind == "wide" else 1.45) if AD else 1.0      # ads: the hook has to stop the scroll
    hf = font("Outfit.ttf", (72 if L.kind == "wide" else 62 if L.kind == "square" else 58) * s * big, "Bold")
    lines = wrap("Most tutoring companies juggle", hf, L.w * 0.9) if L.kind == "wide" or (L.kind == "square" and not AD) else ["Most tutoring", "companies juggle"]
    sf = font("Outfit.ttf", (48 if L.kind == "wide" else 42) * s * (1.2 if AD else 1.0), "Bold")
    logo_h = {"wide": 330, "square": 300, "vertical": 360}[L.kind] * (1 if L.kind != "square" else s)
    # one centered group: headline, logo (where the tools collapse), closing line
    head_h = (len(lines) + 1) * hf.size * 1.08
    gap = (70 if L.kind == "wide" else 60) * s
    group = head_h + gap + logo_h + gap * 0.5 + sf.size * 1.2
    y = (L.h - group) / 2 + (10 if L.kind == "vertical" else 0)
    k = ramp(t, 0.1, 0.6)
    for ln in lines:
        tl = text_layer(ln, hf, INK)
        paste(f, tl, ((L.w - tl.width) / 2, y + (1 - k) * 20), k)
        y += hf.size * 1.08
    k = ramp(t, 0.35, 0.6)
    gl = gradient_text("six different tools.", hf)
    paste(f, gl, ((L.w - gl.width) / 2, y + (1 - k) * 20), k)
    y += hf.size * 1.08 + gap
    cx, cy = L.w / 2, y + logo_h / 2
    spread_x = {"wide": L.w * 0.3, "square": L.w * 0.33, "vertical": L.w * 0.3}[L.kind]
    spread_y = logo_h * (0.62 if L.kind != "vertical" else 0.9)
    cf = font("DMSans.ttf", (30 if L.kind == "wide" else 28) * s, "Bold")
    merge = ease_io((t - 3.0) / 1.0)
    head_bottom = cy - logo_h / 2 - gap
    chip_h = cf.size + 34 * s
    orbit_cy = max(cy, head_bottom + chip_h * 0.9 + spread_y)   # keep the top chips clear of the headline
    for i, name in enumerate(TOOLS):
        ang = -math.pi / 2 + i * 2 * math.pi / len(TOOLS) + 0.35
        bx, by = cx + math.cos(ang) * spread_x, orbit_cy + math.sin(ang) * spread_y
        bob = math.sin(t * 2.2 + i) * 6
        x, y2 = lerp(bx, cx, merge), lerp(by + bob, cy, merge)
        k = ramp(t, 0.7 + i * 0.22, 0.5) * (1 - ease((t - 3.5) / 0.4))
        tl = text_layer(name, cf, INK)
        pw, ph = tl.width + 50 * s, cf.size + 34 * s
        chip = Image.new("RGBA", (int(pw), int(ph)), (0, 0, 0, 0))
        dd = ImageDraw.Draw(chip)
        dd.rounded_rectangle((0, 0, pw - 1, ph - 1), int(ph / 2), fill=WHITE + (255,), outline=(226, 213, 205, 255), width=2)
        chip.alpha_composite(tl, (int(25 * s), int((ph - cf.size) / 2 - cf.size * 0.12)))
        sc = 1 - 0.5 * merge
        if sc < 0.99:
            chip = chip.resize((max(1, int(chip.width * sc)), max(1, int(chip.height * sc))), Image.Resampling.BICUBIC)
        paste(f, chip, (x - chip.width / 2, y2 - chip.height / 2), k)
    k = ramp(t, 3.6, 0.6)
    lg = A.logo_at(logo_h * (0.85 + 0.15 * k) * A.logo.width / A.logo.height)
    paste(f, lg, (cx - lg.width / 2, cy - lg.height / 2), k)
    k2 = ramp(t, 4.1, 0.6)
    tl = gradient_text("Scorgi is one platform for all of it.", sf, GREEN_DARK, GREEN)
    paste(f, tl, ((L.w - tl.width) / 2, cy + logo_h / 2 + gap * 0.5 + (1 - k2) * 14), k2)
    return f


def progress_bar(f, L, idx, prog):
    """Segmented chapter progress across the top, with the chapter names on wide."""
    d = ImageDraw.Draw(f)
    n = len(CHAPTERS)
    x0, x1 = L.margin, L.w - L.margin
    gap = 14
    segw = (x1 - x0 - gap * (n - 1)) / n
    fnt = font("DMSans.ttf", 15, "Bold") if L.kind == "wide" else None
    for i, ch in enumerate(CHAPTERS):
        sx = x0 + i * (segw + gap)
        y = L.bar_y
        d.rounded_rectangle((sx, y, sx + segw, y + 5), 3, fill=(220, 229, 224, 255))
        fill = 1.0 if i < idx else (prog if i == idx else 0)
        if fill > 0:
            d.rounded_rectangle((sx, y, sx + segw * fill, y + 5), 3, fill=GREEN + (255,))
        if fnt:
            col = GREEN_DARK if i == idx else (MUTED if i < idx else FAINT)
            d.text((sx, y - 22), ch["rail"].upper(), font=fnt, fill=col + (255,))


def step_pills(f, L, labels, cur, x, y, align_right=False):
    """Numbered step markers: done (green check), current (filled), upcoming (outline)."""
    fnt = font("DMSans.ttf", L.pill, "Bold")
    nf = font("DMSans.ttf", L.pill * 0.85, "Bold")
    pad, dot = int(L.pill * 0.7), int(L.pill * 1.35)
    gap = int(L.pill * 1.1)
    h = dot + pad
    widths = [pad * 2 + dot + 10 + fnt.getlength(lb) for lb in labels]
    if align_right:
        x -= sum(widths) + gap * (len(labels) - 1)
    d = ImageDraw.Draw(f)
    for i, (lb, w) in enumerate(zip(labels, widths)):
        state = "done" if i < cur else ("cur" if i == cur else "next")
        fill = GREEN_DARK if state == "cur" else WHITE
        outline = GREEN_DARK if state != "next" else (214, 222, 217)
        d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill + (255,), outline=outline + (255,), width=2)
        cx, cy = x + pad + dot / 2, y + h / 2
        if state == "done":
            d.ellipse((cx - dot / 2, cy - dot / 2, cx + dot / 2, cy + dot / 2), fill=GREEN + (255,))
            kk = dot / 22
            d.line([(cx - 5 * kk, cy + 0.5 * kk), (cx - 1.5 * kk, cy + 4 * kk), (cx + 5 * kk, cy - 4 * kk)], fill=WHITE + (255,), width=max(2, int(2.6 * kk)))
        else:
            d.ellipse((cx - dot / 2, cy - dot / 2, cx + dot / 2, cy + dot / 2), fill=(WHITE if state == "cur" else (236, 241, 238)) + (255,))
            num = str(i + 1)
            d.text((cx - nf.getlength(num) / 2, cy - nf.size * 0.62), num, font=nf, fill=(GREEN_DARK if state == "cur" else FAINT) + (255,))
        d.text((x + pad + dot + 10, cy - L.pill * 0.66), lb, font=fnt, fill=(WHITE if state == "cur" else (INK if state == "done" else FAINT)) + (255,))
        if i < len(labels) - 1:
            ax = x + w + gap / 2
            d.line([(ax - 4, cy), (ax + 4, cy)], fill=(196, 206, 200, 255), width=2)
        x += w + gap


def caption_chip(text, num, L):
    """Dark caption that sits on the screen and names what is happening now."""
    fnt = font("DMSans.ttf", L.caption, "Bold")
    nf = font("DMSans.ttf", L.caption * 0.8, "Bold")
    lines = wrap(text, fnt, (L.card[2] - L.card[0]) * (0.8 if L.kind == "wide" else 0.78 if L.kind == "square" else 0.84))
    pad_x, pad_y = int(L.caption * 0.9), int(L.caption * 0.62)
    dot = int(L.caption * 1.35)
    tw = max(fnt.getlength(ln) for ln in lines)
    lh = L.caption * 1.3
    w = int(pad_x * 2 + dot + L.caption * 0.6 + tw)
    h = int(pad_y * 2 + max(dot, lh * len(lines)))
    chip = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    sh = Image.new("RGBA", chip.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((20, 26, 20 + w, 26 + h), min(h // 2, 34), fill=(10, 40, 25, 110))
    chip.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    d = ImageDraw.Draw(chip)
    d.rounded_rectangle((20, 20, 20 + w, 20 + h), min(h // 2, 34), fill=GREEN_DEEP + (246,))
    cy = 20 + h / 2
    d.ellipse((20 + pad_x, cy - dot / 2, 20 + pad_x + dot, cy + dot / 2), fill=GREEN + (255,))
    d.text((20 + pad_x + dot / 2 - nf.getlength(num) / 2, cy - nf.size * 0.62), num, font=nf, fill=WHITE + (255,))
    ty = cy - lh * len(lines) / 2 + (lh - L.caption) / 2 - L.caption * 0.12
    for ln in lines:
        d.text((20 + pad_x + dot + L.caption * 0.6, ty), ln, font=fnt, fill=WHITE + (255,))
        ty += lh
    return chip


def chapter_len(ch, A=None):
    last = steps_timed(ch)[-1]
    return last[0] + last[1] + 0.6


def seg_chapter(A, i, t):
    L = A.L
    ch = CHAPTERS[i]
    f = A.light.copy()
    timed = A.steps_timed(ch)
    n = len(ch["steps"])
    cur = max(j for j in range(n) if t >= timed[j][0] or j == 0)
    st = t - timed[cur][0]
    progress_bar(f, L, i, clamp(t / chapter_len(ch, A)))

    # header: eyebrow + one headline (two lines on square/vertical), step markers
    x = L.margin
    k = ramp(t, 0.05, 0.45)
    paste(f, text_layer(ch["eyebrow"], font("DMSans.ttf", L.eyebrow, "Bold"), GREEN_DARK), (x, L.head_y), k)
    hf = font("Outfit.ttf", L.head, "Bold")
    hy = L.head_y + L.eyebrow * 1.7
    a_txt, b_txt = ch["head"]
    la, lb = text_layer(a_txt.strip(), hf, INK), gradient_text(b_txt, hf)
    k = ramp(t, 0.12, 0.5)
    if L.kind == "wide":
        paste(f, la, (x, hy + (1 - k) * 18), k)
        paste(f, lb, (x + hf.getlength(a_txt), hy + (1 - k) * 18), k)
        step_pills(f, L, [s_[1] for s_ in ch["steps"]], cur, L.w - L.margin, hy + 8, align_right=True)
    else:
        paste(f, la, (x, hy + (1 - k) * 18), k)
        paste(f, lb, (x, hy + L.head * 1.06 + (1 - k) * 18), k)
        step_pills(f, L, [s_[1] for s_ in ch["steps"]], cur, x, hy + L.head * 2.25)

    # product window
    (x0, y0, x1, y1), (card, shadow, pad, content, mask) = A.window_for(i)
    bw, bh = content[2] - content[0], content[3] - content[1]

    def render_step(j, lt):
        src, _, _, mode, view = ch["steps"][j]
        if src.startswith("clip:"):
            name = src[5:]
            start = dict(A.clips[name]["marks"])[mode[1]] + (mode[3] if len(mode) > 3 else 0)
            return A.clip_frame(name, start + min(lt, step_footage(ch["steps"][j]) - 1 / FPS), bw, bh)
        return frame_still(A.images[src], bw, bh, view)

    shot = render_step(cur, st)
    # stills slide in; consecutive steps of the same recording just keep playing
    if cur > 0 and st < SLIDE and not (ch["steps"][cur][0] == ch["steps"][cur - 1][0] and ch["steps"][cur][0].startswith("clip:") and len(ch["steps"][cur][3]) == 3):
        prev = render_step(cur - 1, timed[cur - 1][1])
        kk = ease_io(st / SLIDE)
        both = Image.new("RGB", (bw, bh))
        both.paste(prev, (int(-bw * kk), 0))
        both.paste(shot, (int(bw * (1 - kk)), 0))
        shot = both
    window = card.copy()
    window.paste(shot, (content[0], content[1]))
    window.putalpha(ImageChops.multiply(window.getchannel("A"), mask))
    a = ramp(t, 0.0, 0.6)
    paste(f, shadow, (x0 - pad, y0 - pad + (1 - a) * 40), a)
    paste(f, window, (x0, y0 + (1 - a) * 40), a)

    # caption for the current step
    caption = ch["steps"][cur][2]
    chip = caption_chip(caption, str(cur + 1), L)
    dur = timed[cur][1]
    kc = ramp(st, 0.35, 0.45) * (1 - ramp(st, dur - 0.3, 0.25) if cur < n - 1 else 1)
    cx_ = x0 + (34 if L.kind == "wide" else 18) - 20
    cy_ = y1 - chip.height + 20 - (34 if L.kind == "wide" else 22)
    if L.kind != "wide":                         # below the window
        cx_, cy_ = (L.w - chip.width) / 2, y1 + (34 if L.kind == "vertical" else 18)
    paste(f, chip, (cx_, cy_ + (1 - kc) * 16), kc * a)
    footer(f, A)
    return f


def footer(f, A):
    L = A.L
    if L.kind != "vertical":
        return
    lg = A.logo_at(42)
    y = L.h - 130
    paste(f, lg, (L.margin, y - lg.height * 0.2))
    paste(f, text_layer("Scorgi", font("Outfit.ttf", 32, "Bold"), INK), (L.margin + lg.width + 12, y))
    u = text_layer("scorgi.com", font("DMSans.ttf", 28, "Medium"), MUTED)
    paste(f, u, (L.w - L.margin - u.width, y + 2))


def _proof_layer(A, t):
    L = A.L
    f = Image.new("RGBA", (L.w, L.h), (0, 0, 0, 0))
    s = L.s if L.kind != "vertical" else 1.1
    hf = font("Outfit.ttf", (68 if L.kind == "wide" else 56) * s, "Bold")
    head = wrap("Built inside a real tutoring business.", hf, L.w * 0.84)
    cols = 4 if L.kind == "wide" else 2
    tw_, th_ = (360, 210) if L.kind == "wide" else ((440, 230) if L.kind == "vertical" else (430, 190))
    gapx = gapy = 28 * s
    rows = [PROOF[r:r + cols] for r in range(0, len(PROOF), cols)]
    logo_h = (200 if L.kind == "wide" else 190) * s
    note_f = font("DMSans.ttf", 19 * s, "Medium")
    block = logo_h + 36 * s + len(head) * hf.size * 1.1 + 46 * s + len(rows) * (th_ + gapy) + 10 * s + note_f.size
    y = (L.h - block) / 2
    fp = A.fp_logo.resize((int(logo_h * A.fp_logo.width / A.fp_logo.height), int(logo_h)), Image.Resampling.LANCZOS)
    k = ramp(t, 0.05, 0.5)
    paste(f, fp, ((L.w - fp.width) / 2, y + (1 - k) * 16), k)
    y += logo_h + 36 * s
    for j, line in enumerate(head):
        kk = ramp(t, 0.2 + j * 0.12, 0.5)
        tl = text_layer(line, hf, INK) if j == 0 else gradient_text(line, hf)
        paste(f, tl, ((L.w - tl.width) / 2, y + (1 - kk) * 20), kk)
        y += hf.size * 1.1
    y += 46 * s
    nf = font("Outfit.ttf", (72 if L.kind != "square" else 62) * s, "Bold")
    lf = font("DMSans.ttf", 24 * s, "Medium")
    for r, row in enumerate(rows):
        left = (L.w - (tw_ * len(row) + gapx * (len(row) - 1))) / 2
        for c, (shown, label, val, suffix) in enumerate(row):
            idx = r * cols + c
            kk = ramp(t, 0.8 + idx * 0.18, 0.5)
            prog = ease((t - 0.9 - idx * 0.18) / 1.4)
            if isinstance(val, float):
                num = f"{val * prog:.1f}" if prog < 1 else shown
            else:
                num = f"{int(round(val * prog)):,}{suffix}" if prog < 1 else shown
            tile = Image.new("RGBA", (int(tw_), int(th_)), (0, 0, 0, 0))
            dd = ImageDraw.Draw(tile)
            dd.rounded_rectangle((0, 0, tw_ - 1, th_ - 1), 22, fill=WHITE + (255,), outline=(220, 233, 225, 255), width=2)
            nl = text_layer(num, nf, GREEN_DARK)
            star = label == "Google rating"
            nx = (tw_ - nl.width - (46 * s if star else 0)) / 2
            tile.alpha_composite(nl, (int(nx), int(th_ * 0.18)))
            if star:
                scx, scy, R = nx + nl.width + 24 * s, th_ * 0.18 + nf.size * 0.58, 20 * s
                pts = [(scx + R * (1 if q % 2 == 0 else 0.45) * math.cos(-math.pi / 2 + q * math.pi / 5),
                        scy + R * (1 if q % 2 == 0 else 0.45) * math.sin(-math.pi / 2 + q * math.pi / 5)) for q in range(10)]
                dd.polygon(pts, fill=ORANGE + (255,))
            ll = text_layer(label, lf, MUTED)
            tile.alpha_composite(ll, (int((tw_ - ll.width) / 2), int(th_ * 0.18 + nf.size * 1.25)))
            paste(f, tile, (left + c * (tw_ + gapx), y + r * (th_ + gapy) + (1 - kk) * 26), kk)
    y += len(rows) * (th_ + gapy) + 10 * s
    note = text_layer("Published by Foley Prep at foleyprep.com, October 2026.", note_f, FAINT)
    paste(f, note, ((L.w - note.width) / 2, y), ramp(t, 2.2, 0.5))
    return f


def seg_proof(A, t):
    """Proof slide, centered on its measured size (logo top to source note)."""
    if not hasattr(A, "proof_dy"):
        box = _proof_layer(A, 50).getchannel("A").getbbox()
        A.proof_dy = (A.L.h - (box[3] - box[1])) / 2 - box[1]
    f = A.light.copy()
    paste(f, _proof_layer(A, t), (0, A.proof_dy))
    footer(f, A)
    return f


def seg_cta(A, t):
    L = A.L
    f = A.brand.copy()
    s = 1.0 if L.kind == "wide" else (1.12 if L.kind == "vertical" else 0.92)
    lg = A.logo_at(170 * s)
    hf = font("Outfit.ttf", (78 if L.kind == "wide" else 66) * s, "Bold")
    lines = ["See Scorgi with your", "business in mind."] if L.kind != "vertical" else ["See Scorgi with", "your business", "in mind."]
    bf = font("DMSans.ttf", 34 * s, "Bold")
    uf = font("DMSans.ttf", 28 * s, "Medium")
    btn_h = bf.size * 2.4
    block = lg.height + 44 * s + len(lines) * hf.size * 1.1 + 50 * s + btn_h + 36 * s + uf.size
    y = (L.h - block) / 2
    k = ramp(t, 0.1, 0.6)
    paste(f, lg, ((L.w - lg.width) / 2, y + (1 - k) * 20), k)
    y += lg.height + 44 * s
    for j, line in enumerate(lines):
        kk = ramp(t, 0.35 + j * 0.12, 0.55)
        tl = text_layer(line, hf, WHITE)
        paste(f, tl, ((L.w - tl.width) / 2, y + (1 - kk) * 22), kk)
        y += hf.size * 1.1
    y += 50 * s
    label = "Book a 20-minute demo"
    pw = bf.getlength(label) + 140 * s
    btn = Image.new("RGBA", (int(pw), int(btn_h)), (0, 0, 0, 0))
    d = ImageDraw.Draw(btn)
    d.rounded_rectangle((0, 0, pw - 1, btn_h - 1), int(btn_h / 2), fill=WHITE + (255,))
    d.text((45 * s, (btn_h - bf.size) / 2 - bf.size * 0.12), label, font=bf, fill=GREEN_DEEP + (255,))
    ax, ay = 45 * s + bf.getlength(label) + 22 * s, btn_h / 2
    d.line([(ax, ay), (ax + 26 * s, ay)], fill=GREEN_DEEP + (255,), width=int(4 * s))
    d.line([(ax + 14 * s, ay - 11 * s), (ax + 26 * s, ay), (ax + 14 * s, ay + 11 * s)], fill=GREEN_DEEP + (255,), width=int(4 * s))
    kk = ramp(t, 1.0, 0.5)
    pulse = 1 + (0.03 * math.sin((t - 1.6) * 3.2) if t > 1.6 else 0)
    if abs(pulse - 1) > 0.002:
        btn = btn.resize((int(btn.width * pulse), int(btn.height * pulse)), Image.Resampling.BICUBIC)
    paste(f, btn, ((L.w - btn.width) / 2, y + (btn_h - btn.height) / 2 + (1 - kk) * 18), kk)
    y += btn_h + 36 * s
    u = text_layer("scorgi.com", uf, (210, 240, 222))
    paste(f, u, ((L.w - u.width) / 2, y), ramp(t, 1.4, 0.5))
    return f


# ─── Timeline ───────────────────────────────────────────────────────────────

def segments():
    segs = [("problem", PROBLEM)] if AD else [("open", OPEN), ("problem", PROBLEM)]
    for i, ch in enumerate(CHAPTERS):
        segs += [(("card", i), CARD), (("chapter", i), chapter_len(ch))]
    segs += [("proof", PROOF_T), ("cta", CTA)]
    out, t0 = [], 0.0
    for kind, dur in segs:
        out.append((kind, t0, dur))
        t0 += dur - XFADE
    return out, t0 + XFADE


def render_seg(A, kind, lt):
    if kind == "open":
        return seg_open(A, lt)
    if kind == "problem":
        return seg_problem(A, lt + (0.35 if AD else 0))      # ads: headline is up from the first frame
    if kind == "proof":
        return seg_proof(A, lt)
    if kind == "cta":
        return seg_cta(A, lt)
    if kind[0] == "card":
        return seg_card(A, kind[1], lt)
    return seg_chapter(A, kind[1], lt)


def seg_card(A, i, t):
    """Section title card: green background, section number, name, and headline,
    so every switch to a new part of the product is unmistakable."""
    L = A.L
    ch = CHAPTERS[i]
    n = len(CHAPTERS)
    f = A.brand.copy()
    out = 1 - ramp(t, CARD - XFADE - 0.32, 0.3)          # text leaves before the crossfade starts
    t = t - XFADE * 0.7                                  # and arrives once the background has settled
    base, f = f, Image.new("RGBA", (L.w, L.h), (0, 0, 0, 0))
    s = {"wide": 1.0, "square": 0.82, "vertical": 1.05}[L.kind]
    num_f = font("DMSans.ttf", 30 * s, "Bold")
    eb_f = font("Outfit.ttf", 30 * s, "Bold")
    hd_f = font("Outfit.ttf", (88 if L.kind == "wide" else 76) * s, "Bold")
    a_txt, b_txt = ch["head"][0].strip(), ch["head"][1]
    width = L.w * 0.84
    lines_a = wrap(a_txt, hd_f, width)
    lines_b = wrap(b_txt, hd_f, width)
    gap = 26 * s
    block = num_f.size + gap * 1.4 + eb_f.size + gap + (len(lines_a) + len(lines_b)) * hd_f.size * 1.08 + gap * 1.6 + 14 * s
    y = (L.h - block) / 2
    # section number with a growing accent line on each side
    k = ramp(t, 0.0, 0.45)
    num = text_layer(f"{i + 1:02d} / {n:02d}", num_f, (255, 214, 186))
    paste(f, num, ((L.w - num.width) / 2, y + (1 - k) * 14), k)
    d = ImageDraw.Draw(f)
    line_len = 120 * s * ease((t - 0.1) / 0.6)
    cy_line = y + num_f.size * 0.62
    if line_len > 1:
        d.rounded_rectangle(((L.w - num.width) / 2 - 24 * s - line_len, cy_line - 2, (L.w - num.width) / 2 - 24 * s, cy_line + 2), 2, fill=(255, 214, 186, 200))
        d.rounded_rectangle(((L.w + num.width) / 2 + 24 * s, cy_line - 2, (L.w + num.width) / 2 + 24 * s + line_len, cy_line + 2), 2, fill=(255, 214, 186, 200))
    y += num_f.size + gap * 1.4
    k = ramp(t, 0.12, 0.45)
    eb = text_layer(ch["eyebrow"], eb_f, (190, 240, 210))
    paste(f, eb, ((L.w - eb.width) / 2, y + (1 - k) * 18), k)
    y += eb_f.size + gap
    for j, line in enumerate(lines_a + lines_b):
        k = ramp(t, 0.22 + j * 0.08, 0.5)
        color = WHITE if j < len(lines_a) else (255, 214, 186)
        tl = text_layer(line, hd_f, color)
        paste(f, tl, ((L.w - tl.width) / 2, y + (1 - k) * 24), k)
        y += hd_f.size * 1.08
    y += gap * 1.6
    # progress dots: done, current, upcoming
    r_ = 7 * s
    sp = 34 * s
    x0 = L.w / 2 - sp * (n - 1) / 2
    k = ramp(t, 0.35, 0.4)
    dots = Image.new("RGBA", (L.w, int(r_ * 4)), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dots)
    for j in range(n):
        cx = x0 + j * sp
        if j == i:
            dd.rounded_rectangle((cx - r_ * 2.2, r_, cx + r_ * 2.2, r_ * 3), r_, fill=(255, 214, 186, 255))
        else:
            dd.ellipse((cx - r_, r_, cx + r_, r_ * 3), fill=(255, 255, 255, 230 if j < i else 90))
    paste(f, dots, (0, y), k)
    paste(base, f, (0, 0), out)
    return base


def compose(A, t):
    segs, _ = segments()
    live = [(k, t - s0, d) for k, s0, d in segs if s0 <= t < s0 + d]
    if not live:
        live = [(segs[-1][0], t - segs[-1][1], segs[-1][2])]
    if len(live) == 1:
        return render_seg(A, live[0][0], live[0][1])
    (k1, t1, _), (k2, t2, _) = live[0], live[-1]
    return Image.blend(render_seg(A, k1, t1), render_seg(A, k2, t2), ease_io(t2 / XFADE))


def build(name, size):
    w, h = size
    L = Layout(w, h)
    A = Assets(L)
    _, total = segments()
    frames = int(total * FPS)
    out = ROOT / f"videos/{PREFIX}-{name}.mp4"
    ff = subprocess.Popen([
        "ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow",
        "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out),
    ], stdin=subprocess.PIPE)
    poster = None
    for n in range(frames):
        t = n / FPS
        frame = compose(A, t).convert("RGB")
        if poster is None and t >= POSTER_T:
            poster = frame
        ff.stdin.write(frame.tobytes())
    ff.stdin.close()
    ff.wait()
    poster.save(ROOT / f"videos/{PREFIX}-{name}-poster.jpg", quality=90)
    print(f"{out.relative_to(ROOT)}  {total:.1f}s  {w}x{h}")


def write_vtt():
    segs, _ = segments()

    def ts(x):
        m, s = divmod(max(0, x), 60)
        return f"{int(m):02d}:{s:06.3f}"

    text = {"open": "Scorgi: the all-in-one platform for tutoring businesses. Built and proven at Foley Prep.",
            "problem": "Most tutoring companies juggle six different tools. Scorgi is one platform for all of it.",
            "proof": "Proven at Foley Prep: 20,000+ students trained, 46,000+ tests graded, 7 New Jersey locations, 4.9 Google rating.",
            "cta": "See Scorgi with your business in mind. Book a 20-minute demo at scorgi.com."}
    cues = ["WEBVTT", ""]
    for kind, s0, d in segs:
        if isinstance(kind, tuple) and kind[0] == "card":
            continue
        if isinstance(kind, tuple):
            ch = CHAPTERS[kind[1]]
            body = "".join(ch["head"]) + "\n" + " · ".join(step[2] for step in ch["steps"])
        else:
            body = text[kind]
        cues += [f"{ts(s0)} --> {ts(s0 + d - XFADE)}", body, ""]
    (ROOT / f"videos/{PREFIX}.vtt").write_text("\n".join(cues))


PREFIX, POSTER_T = "scorgi-overview", 3.6


def use_ad_cut():
    """python3 scripts/build-marketing-video.py --ad [formats]  ->  videos/scorgi-ad-*.mp4"""
    global AD, CHAPTERS, PROBLEM, PROOF_T, CTA, PREFIX, POSTER_T, CARD, MIN_STEP
    AD, CHAPTERS = True, AD_CHAPTERS
    CARD, MIN_STEP = 3.1, 4.6
    PROBLEM, PROOF_T, CTA = 5.0, 4.6, 6.2
    PREFIX, POSTER_T = "scorgi-ad", 4.6


if __name__ == "__main__":
    if "--ad" in sys.argv:
        sys.argv.remove("--ad")
        use_ad_cut()
    wanted = sys.argv[1:] or list(FORMATS)
    for fmt in wanted:
        build(fmt, FORMATS[fmt])
    write_vtt()
