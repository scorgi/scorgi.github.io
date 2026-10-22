"""Record real browser interactions as smooth, high-res clips with a visible cursor.

Frames come from the Chrome DevTools screencast (sent only when the page changes), are
resampled to a steady 30 fps and encoded to MP4. Each recording also saves step markers
(seconds from the start) so the video can time its captions to the actions.
"""
import base64, json, math, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / 'images/video/clips'
FPS = 30
W, H = 1344, 618          # the video window's content shape (2.175 : 1)
DPR = 2

CURSOR_JS = r"""
(() => {
  const boot = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div'); c.id = '__cur';
    c.innerHTML = '<svg width="26" height="36" viewBox="0 0 13 18"><path d="M0 0 L0 14 L3.6 10.8 L6.2 16.8 L8.3 15.9 L5.7 10.2 L10.4 10.2 Z" fill="#111" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {position:'fixed', left:'0', top:'0', zIndex:2147483647, pointerEvents:'none',
      transform:'translate(-100px,-100px)', filter:'drop-shadow(0 2px 3px rgba(0,0,0,.35))'});
    document.documentElement.appendChild(c);
    const st = document.createElement('style');
    st.textContent = '@keyframes __rip{from{transform:translate(-50%,-50%) scale(.3);opacity:.9}to{transform:translate(-50%,-50%) scale(1);opacity:0}}' +
      '.__rip{position:fixed;width:64px;height:64px;border-radius:50%;border:4px solid #44ca81;pointer-events:none;z-index:2147483646;animation:__rip .65s ease-out forwards}';
    document.documentElement.appendChild(st);
    addEventListener('mousemove', e => { c.style.transform = `translate(${e.clientX - 2}px,${e.clientY - 1}px)`; }, true);
    addEventListener('mousedown', e => { const r = document.createElement('div'); r.className = '__rip';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.documentElement.appendChild(r); setTimeout(() => r.remove(), 700); }, true);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
})();
"""


class Recorder:
    def __init__(self, page):
        self.pg = page
        self.cdp = page.context.new_cdp_session(page)
        self.frames = []
        self.marks = []
        self.mouse = (W * 0.6, H * 0.85)
        self.cdp.on('Page.screencastFrame', self._on_frame)

    def _on_frame(self, ev):
        self.frames.append((time.monotonic(), ev['data']))
        try:
            self.cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
        except Exception:
            pass

    def start(self):
        self.pg.mouse.move(*self.mouse)
        self.cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 92, 'maxWidth': W * DPR, 'maxHeight': H * DPR, 'everyNthFrame': 1})
        self.wait(1.2)                      # let stale frames flush before the clock starts
        self.pg.mouse.move(self.mouse[0] + 1, self.mouse[1]); self.wait(0.2)
        self.t0 = time.monotonic()
        keep = [f for f in self.frames if f[0] >= self.t0 - 0.15]
        self.frames = keep or self.frames[-1:]
        self.wait(0.6)

    def wait(self, sec):
        end = time.monotonic() + sec
        while time.monotonic() < end:
            self.pg.wait_for_timeout(15)

    def mark(self, label):
        self.marks.append([label, round(time.monotonic() - self.t0, 3)])

    def glide(self, x, y, dur=0.8):
        x0, y0 = self.mouse
        n = max(2, int(dur * 60))
        for i in range(1, n + 1):
            k = i / n
            k = 3 * k * k - 2 * k * k * k
            self.pg.mouse.move(x0 + (x - x0) * k, y0 + (y - y0) * k)
            self.pg.wait_for_timeout(int(dur * 1000 / n))
        self.mouse = (x, y)

    def center(self, locator):
        b = locator.bounding_box()
        return b['x'] + b['width'] / 2, b['y'] + b['height'] / 2

    def click(self, locator, dur=0.8, pause=0.25):
        x, y = self.center(locator)
        self.glide(x, y, dur)
        self.wait(pause)
        self.pg.mouse.down(); self.wait(0.08); self.pg.mouse.up()
        self.wait(0.15)

    def stop(self, name):
        self.cdp.send('Page.stopScreencast')
        t_end = time.monotonic()
        OUT.mkdir(parents=True, exist_ok=True)
        dur = t_end - self.t0
        n = int(dur * FPS)
        print(f'{name}: {len(self.frames)} raw frames over {dur:.1f}s ({len(self.frames) / dur:.1f}/s)')
        ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                               '-vf', f'scale={W * DPR}:{H * DPR}:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
                               '-movflags', '+faststart', str(OUT / f'{name}.mp4')], stdin=subprocess.PIPE)
        j = 0
        for i in range(n):
            t = self.t0 + i / FPS
            while j + 1 < len(self.frames) and self.frames[j + 1][0] <= t:
                j += 1
            ff.stdin.write(base64.b64decode(self.frames[j][1]))
        ff.stdin.close(); ff.wait()
        json.dump({'duration': round(n / FPS, 3), 'marks': self.marks}, open(OUT / f'{name}.json', 'w'), indent=1)
        print(' marks:', self.marks)


def new_page(browser, storage=None, init=None):
    ctx = browser.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DPR, storage_state=storage)
    ctx.add_init_script(CURSOR_JS)
    if init:
        ctx.add_init_script(init)
    return ctx.new_page()


# ─── Clips ──────────────────────────────────────────────────────────────────

def tests(b):
    pg = new_page(b)
    pg.goto('https://foleyprep.com/goja/demo', wait_until='load', timeout=60000); pg.wait_for_timeout(2500)
    pg.locator('text=/Start\\s*Demo/').first.click(); pg.wait_for_timeout(1800)
    pg.locator('select:visible').first.select_option(index=2); pg.wait_for_timeout(300)
    pg.locator('button:has-text("Start Test")').click(); pg.wait_for_timeout(3500)
    r = Recorder(pg); r.start()
    # 1) highlight a phrase by dragging, then Annotate and type a note
    r.mark('Annotate')
    box = pg.evaluate("""()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
        while((n=w.nextNode())){const i=n.nodeValue.indexOf('gathering place'); if(i>=0){const a=document.createRange(); a.setStart(n,i); a.setEnd(n,i+1);
          const z=document.createRange(); z.setStart(n,i+'gathering place for residents'.length-1); z.setEnd(n,i+'gathering place for residents'.length);
          const A=a.getBoundingClientRect(), Z=z.getBoundingClientRect(); return [A.left+1, A.top+A.height/2, Z.right-1, Z.top+Z.height/2]}} }""")
    r.glide(box[0], box[1], 0.9); r.wait(0.3)
    pg.mouse.down()
    steps = 40
    for i in range(1, steps + 1):
        k = i / steps
        pg.mouse.move(box[0] + (box[2] - box[0]) * k, box[1] + (box[3] - box[1]) * k); pg.wait_for_timeout(22)
    pg.mouse.up(); r.mouse = (box[2], box[3]); r.wait(0.5)
    r.click(pg.locator('button:has-text("Annotate")'), 0.9); r.wait(0.6)
    ta = pg.locator('textarea:visible').first
    r.click(ta, 0.6); r.wait(0.2)
    pg.keyboard.type('Key detail: a gathering place for residents', delay=55); r.wait(1.0)
    # 2) eliminate two wrong answers
    r.mark('Eliminate')
    r.click(pg.locator('.problem-eliminate-toggle'), 0.9); r.wait(0.5)
    els = pg.locator('.problem-input-choice-eliminate')
    r.click(els.nth(0), 0.7); r.wait(0.6)
    r.click(els.nth(2), 0.7); r.wait(0.9)
    # 3) choose the answer, flag it, open the navigator
    r.mark('Review')
    r.click(pg.locator('.problem-input-choice').nth(1), 0.8); r.wait(0.5)
    r.click(pg.locator('.problem-mark-for-review-toggle'), 0.8); r.wait(0.6)
    r.click(pg.locator('button:has-text("Question 1 of 2")'), 0.9); r.wait(1.4)
    rv = pg.locator('button:visible', has_text='Review Your Work').first
    r.glide(*r.center(rv), 0.8); r.wait(1.2)
    r.stop('tests')
    pg.context.close()


SHOWCASE_JS = r"""
window.__show = (i, opts) => {
  opts = opts || {};
  const frames = window.__frames || (window.__frames = [...document.querySelectorAll('.pm-sample-frame.pm-shot')]);
  let stage = document.getElementById('__stage');
  if (!stage) {
    stage = document.createElement('div'); stage.id = '__stage';
    Object.assign(stage.style, {position:'fixed', inset:'0', background:'#f4f7f5', zIndex:2147483000, overflow:'hidden'});
    document.body.appendChild(stage);
    const st = document.createElement('style'); st.textContent = '#__stage *{animation:none!important;transition:none!important}'; document.head.appendChild(st);
  }
  const f = frames[i];
  if (!f.__home) { f.__home = f.parentElement; f.__next = f.nextSibling; }
  stage.innerHTML = '';
  const holder = document.createElement('div');
  const s = (innerWidth - 48) / 960;
  f.style.width = '960px'; f.style.maxWidth = 'none'; f.style.margin = '0';
  Object.assign(holder.style, {position:'absolute', left:'24px', top:'0', width:'960px', transformOrigin:'top left', transform:`scale(${s})`});
  holder.appendChild(f); stage.appendChild(holder);
  const h = holder.getBoundingClientRect().height;
  const top = h < innerHeight ? (innerHeight - h) / 2 : 18;
  holder.style.top = top + 'px';
  window.__holder = holder; window.__scale = s; window.__top = top;
  return h;
};
window.__scrollTo = (dy, ms) => new Promise(res => {
  const holder = window.__holder; const start = parseFloat(holder.dataset.dy || 0); const t0 = performance.now();
  const step = now => { let k = Math.min(1, (now - t0) / ms); k = k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
    const v = start + (dy - start) * k; holder.style.top = (window.__top - v) + 'px'; holder.dataset.dy = v;
    if (k < 1) requestAnimationFrame(step); else res(); };
  requestAnimationFrame(step);
});
0;
"""


def insights(b):
    pg = new_page(b)
    pg.goto('https://foleyprep.com/tutoring/progress', wait_until='load', timeout=60000); pg.wait_for_timeout(3500)
    for y in range(0, 9000, 500):
        pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelectorAll('.fp-reveal').forEach(e=>e.classList.add('fp-in-view'))")
    pg.evaluate(SHOWCASE_JS)
    pg.evaluate("for (const q of ['#chat-widget','#chati-teaser','#chati-restore-tab','.hover-zone']) document.querySelectorAll(q).forEach(e=>e.style.setProperty('display','none','important'))")
    h0 = pg.evaluate("window.__show(0)"); pg.wait_for_timeout(800)
    r = Recorder(pg); r.start()
    r.mark('Topic board')
    r.glide(W * 0.30, H * 0.55, 0.9); r.wait(0.8)
    travel = max(0, h0 - H + 40)
    pg.evaluate(f"window.__scrollTo({travel * 0.55}, 2600)"); r.glide(W * 0.80, H * 0.45, 1.2); r.wait(0.8)
    card = pg.locator('#__stage').locator('text=Unit Analysis').first
    r.click(card, 1.0); r.wait(0.5)
    r.mark('Question detail')
    h2 = pg.evaluate("window.__show(2)"); r.wait(1.0)
    r.glide(W * 0.45, H * 0.45, 0.9); r.wait(0.8)
    pg.evaluate(f"window.__scrollTo({max(0, h2 - H + 30)}, 2400)"); r.wait(2.6)
    pr = pg.locator('#__stage button:visible', has_text='Practice').first
    if pr.count():
        r.glide(*r.center(pr), 0.9); r.wait(1.4)
    r.mark('Parent report')
    pg.evaluate("window.__show(1)"); r.wait(0.6)
    r.glide(W * 0.55, H * 0.5, 1.0); r.wait(3.2)
    r.stop('insights')
    pg.context.close()


REDACT_LIVE = r"""
(() => {
  const run = () => {
    // Only student data is sensitive. The "Booking as" chip is Rob's own account and stays visible;
    // tutor names and photos are public on foleyprep.com/team.
    // student / family names on the Welcome page ("Switch to X" cards)
    const names = new Set();
    for (const m of (document.body.innerText || '').matchAll(/Switch to ([^\n]+)/g)) for (const w of m[1].trim().split(/\s+/)) if (w.length > 1) names.add(w);
    for (const el of document.querySelectorAll('body *')) { if (el.children.length) continue; const t = (el.innerText || '').trim();
      if (!t) continue;
      if (names.size && [...names].some(n => t.includes(n))) el.style.filter = 'blur(6px)'; }
  };
  addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style'); s.textContent = '#navbar,header.sticky-top,.navbarPosition,footer,#chat-widget,#chati-teaser,#chati-restore-tab{display:none!important}';
    document.head.appendChild(s); run(); setInterval(run, 60); });
})();
"""


def booking(b):
    pg = new_page(b, storage='dev-session.json', init=REDACT_LIVE)
    writes = []
    pg.on('request', lambda q: q.method not in ('GET', 'HEAD', 'OPTIONS') and 'dev.foleyprep.com' in q.url and '/schedule/client/' not in q.url and writes.append(q.url))
    pg.goto('https://dev.foleyprep.com/apps/schedule-client/', wait_until='commit', timeout=90000); pg.wait_for_selector('text=/Choose a location|Change location/', timeout=90000); pg.wait_for_timeout(3000)
    if not pg.locator('text=Choose a location >> visible=true').count():
        pg.locator('text=Change location >> visible=true').first.click(); pg.wait_for_timeout(2500)
    r = Recorder(pg); r.start()
    r.mark('Location')
    r.glide(W * 0.45, H * 0.55, 0.9); r.wait(0.9)                 # look over the locations first
    r.click(pg.locator('text=Bell Works Holmdel >> visible=true').first, 0.7); r.wait(0.5)
    r.mark('Service')                                              # the Welcome page belongs to the next step
    r.wait(1.1)
    r.click(pg.locator('text=Consultations >> visible=true').first, 0.55); r.wait(1.0)
    r.click(pg.locator('text=Post Diagnostic Planning >> visible=true').first, 0.55); r.wait(1.7)
    r.mark('Time')
    r.glide(W * 0.55, H * 0.7, 0.5)
    for _ in range(12):
        pg.mouse.wheel(0, 26); pg.wait_for_timeout(35)
    r.wait(0.5)
    r.click(pg.locator('text=Pick a tutor >> visible=true').first, 0.6); r.wait(2.0)
    r.stop('booking')
    print(' non-booking writes:', writes)
    pg.context.close()


def brand(b):
    pg = new_page(b, init="""addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#chat-widget,#chati-teaser,#chati-restore-tab,.hover-zone,.scroll-indicator{display:none!important} ::-webkit-scrollbar{display:none}';document.head.appendChild(s)})""")
    pg.goto('https://foleyprep.com/', wait_until='load', timeout=60000)
    pg.evaluate("document.body.style.zoom='0.8'")
    pg.wait_for_function("document.body.innerText.includes('20,000+')", timeout=30000); pg.wait_for_timeout(1500)
    pg.evaluate("""()=>{for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (/Quick Contact/.test(el.innerText||'') && r.width > 0 && r.width < 80) el.style.display='none'; }}""")
    r = Recorder(pg); r.start()
    r.mark('As Foley Prep')
    r.glide(W * 0.62, H * 0.5, 1.0); r.wait(1.5)
    for _ in range(26):
        pg.mouse.wheel(0, 30); pg.wait_for_timeout(50)
    r.wait(2.0)
    r.stop('brand')
    pg.context.close()


DEV_CHROME = """addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#navbar,header.sticky-top,.navbarPosition,footer,#chat-widget,#chati-teaser,#chati-restore-tab,.hover-zone{display:none!important} ::-webkit-scrollbar{display:none}';document.head.appendChild(s)})"""


def schedule(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/schedule-staff/', wait_until='load', timeout=60000); pg.wait_for_timeout(3500)
    s = pg.locator('select:visible')
    s.nth(0).select_option(label='Daily'); s.nth(1).select_option(label='Warren')
    pg.locator('input[type=date]:visible').first.fill('2026-10-17'); pg.locator('button:has-text("Refresh")').first.click(); pg.wait_for_timeout(4500)
    r = Recorder(pg); r.start()
    r.mark('Day')
    r.glide(W * 0.45, H * 0.55, 0.9); r.wait(0.8)
    for _ in range(10):
        pg.mouse.wheel(0, 24); pg.wait_for_timeout(45)
    r.wait(1.0)
    for _ in range(10):
        pg.mouse.wheel(0, -24); pg.wait_for_timeout(45)
    r.wait(0.6)
    r.mark('Week')
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.8); span.select_option(label='Weekly'); r.wait(0.5)
    r.click(pg.locator('button:has-text("Refresh")').first, 0.8); r.wait(3.2)
    r.glide(W * 0.6, H * 0.6, 0.9); r.wait(1.4)
    r.mark('Session')
    card = pg.locator('text=/^C: /').first
    r.click(card, 1.0); r.wait(2.2)
    for lbl in ['Notes', 'Prospectus']:
        tab = pg.locator(f'text={lbl} >> visible=true').first
        if tab.count():
            r.click(tab, 0.8); r.wait(1.4)
    r.wait(0.8)
    r.stop('schedule')
    pg.context.close()


def schools(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    writes = []
    pg.on('request', lambda q: q.method not in ('GET', 'HEAD', 'OPTIONS') and q.url.split('?')[0].startswith('https://dev.foleyprep.com') and writes.append(q.url.split('dev.foleyprep.com')[1][:60]))
    pg.goto('https://dev.foleyprep.com/apps/school-tracker/', wait_until='domcontentloaded', timeout=60000); pg.wait_for_timeout(4000)
    tabs = pg.locator('text=Browse Schools').first
    pg.evaluate("(y)=>scrollTo(0,y)", tabs.bounding_box()['y'] + pg.evaluate('scrollY') - 20); pg.wait_for_timeout(800)
    r = Recorder(pg); r.start()
    r.mark('Search')
    box = pg.locator('input[placeholder="Search schools..."]')
    r.click(box, 0.9); r.wait(0.3)
    pg.keyboard.type('Rutgers', delay=110); r.wait(2.0)
    r.glide(W * 0.5, H * 0.65, 0.8); r.wait(1.0)
    r.mark('Filters')
    r.click(box, 0.6); pg.keyboard.press('Meta+A'); pg.keyboard.press('Backspace'); r.wait(1.0)
    sort = pg.locator('select:visible').filter(has_text='Most Selective').first
    r.click(sort, 0.8); sort.select_option(label='Most Selective'); r.wait(2.0)
    for _ in range(12):
        pg.mouse.wheel(0, 26); pg.wait_for_timeout(45)
    r.wait(1.2)
    for _ in range(12):
        pg.mouse.wheel(0, -26); pg.wait_for_timeout(45)
    r.mark('Map')
    r.click(pg.locator('text=Map >> visible=true').first, 0.9); r.wait(3.5)
    r.glide(W * 0.55, H * 0.55, 1.0); r.wait(1.5)
    r.stop('schools')
    print(' writes:', writes)
    pg.context.close()




def smooth_scroll(pg, r, dy, dur):
    """Scroll the page by dy pixels over dur seconds (ease in/out), keeping the cursor still."""
    n = max(2, int(dur * 40)); done = 0
    for i in range(1, n + 1):
        k = i / n; k = 3 * k * k - 2 * k * k * k
        step = int(dy * k) - done; done += step
        pg.mouse.wheel(0, step); pg.wait_for_timeout(int(dur * 1000 / n))


def open_student_insights(pg):
    pg.goto('https://dev.foleyprep.com/insights', wait_until='load', timeout=60000); pg.wait_for_timeout(2500)
    pg.locator('text=Search a Students Insights').first.click(); pg.wait_for_timeout(800)
    pg.locator('input[placeholder="Search Users"]').fill('Sample Student'); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{const s=[...document.querySelectorAll('select')].filter(s=>s.offsetParent)[0]; const o=[...s.options].find(o=>o.text.includes('Sample Student')); s.value=o.value; s.dispatchEvent(new Event('change',{bubbles:true}))}")
    pg.locator('button:has-text("View Insights")').click(); pg.wait_for_timeout(5000)


def insights(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    open_student_insights(pg)
    top = pg.locator('text=progress so far').first
    pg.evaluate("(y)=>scrollTo(0,y)", top.bounding_box()['y'] + pg.evaluate('scrollY') - 24); pg.wait_for_timeout(1200)
    r = Recorder(pg); r.start()
    r.mark('Progress')
    r.glide(W * 0.42, H * 0.45, 0.9); r.wait(1.6)
    smooth_scroll(pg, r, 420, 2.2); r.wait(1.6)
    smooth_scroll(pg, r, 380, 2.0); r.wait(1.8)
    r.mark('Topic board')
    focus = pg.locator('text=Where to focus').first
    smooth_scroll(pg, r, int(focus.bounding_box()['y']) + 520, 2.4); r.wait(1.0)
    card = pg.locator('.topic-card:visible').filter(has_text='Mastery').first if False else None
    cards = pg.locator('.topic-card:visible')
    pick = None
    for i in range(min(cards.count(), 40)):
        bb = cards.nth(i).bounding_box()
        if bb and 60 < bb['y'] < H - 160: pick = cards.nth(i); break
    if pick is not None:
        r.click(pick, 1.0); r.wait(3.2)
        r.glide(W * 0.5, H * 0.62, 0.8); r.wait(1.4)
        pg.keyboard.press('Escape'); r.wait(0.8)
    r.mark('Worksheet')
    bw = pg.locator('button:visible', has_text='Build a worksheet').first
    smooth_scroll(pg, r, int(bw.bounding_box()['y'] - H * 0.6), 1.6); r.wait(0.6)
    r.click(bw, 1.0); r.wait(2.4)
    cw = pg.locator('button:visible', has_text='Create Worksheet').first
    if cw.count():
        r.glide(*r.center(cw), 1.2); r.wait(2.0)
    r.stop('insights')
    pg.context.close()


def schools(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/school-tracker/', wait_until='domcontentloaded', timeout=60000)
    pg.wait_for_selector('input[placeholder="Search Users"]', timeout=60000); pg.wait_for_timeout(1500)
    pg.locator('input[placeholder="Search Users"]').first.fill('Sample Student'); pg.wait_for_timeout(3000)
    pg.evaluate("()=>{const s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.text.includes('Sample Student'))); s.value=[...s.options].find(o=>o.text.includes('Sample Student')).value; s.dispatchEvent(new Event('change',{bubbles:true}))}")
    pg.wait_for_timeout(3500)
    tabs = pg.locator('text=Browse Schools').first
    pg.evaluate("(y)=>scrollTo(0,y)", tabs.bounding_box()['y'] + pg.evaluate('scrollY') - 20); pg.wait_for_timeout(800)
    r = Recorder(pg); r.start()
    r.mark('My Schools')
    r.click(pg.locator('text=My Schools >> visible=true').first, 0.9); r.wait(2.6)
    r.glide(W * 0.5, H * 0.6, 0.8)
    smooth_scroll(pg, r, 320, 2.2); r.wait(1.5)
    smooth_scroll(pg, r, -320, 1.4); r.wait(0.4)
    r.mark('Map')
    r.click(pg.locator('text=Map >> visible=true').first, 0.9); r.wait(3.5)
    r.glide(W * 0.55, H * 0.6, 1.0); r.wait(1.6)
    r.mark('Compare')
    r.click(pg.locator('text=Compare >> visible=true').first, 0.9); r.wait(3.0)
    r.glide(W * 0.6, H * 0.6, 1.0)
    smooth_scroll(pg, r, 260, 2.0); r.wait(1.8)
    r.stop('schools')
    pg.context.close()


def schedule(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/schedule-staff/', wait_until='load', timeout=60000); pg.wait_for_timeout(3500)
    s_ = pg.locator('select:visible')
    s_.nth(0).select_option(label='Daily'); s_.nth(1).select_option(label='Bell Works Holmdel')
    pg.locator('input[type=date]:visible').first.fill('2026-10-24'); pg.locator('button:has-text("Refresh")').first.click(); pg.wait_for_timeout(5000)
    r = Recorder(pg); r.start()
    r.mark('Day')
    r.glide(W * 0.45, H * 0.6, 0.9); r.wait(1.0)
    smooth_scroll(pg, r, 220, 2.0); r.wait(1.2)
    smooth_scroll(pg, r, -220, 1.4); r.wait(0.4)
    r.mark('Week')
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.8); span.select_option(label='Weekly'); r.wait(0.4)
    pg.locator('input[type=date]:visible').first.fill('2026-10-19')
    r.click(pg.locator('button:has-text("Refresh")').first, 0.8); r.wait(3.4)
    r.glide(W * 0.6, H * 0.6, 1.0); r.wait(1.6)
    r.mark('Class')
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.6); span.select_option(label='Daily'); r.wait(0.3)
    pg.locator('input[type=date]:visible').first.fill('2026-10-24')
    r.click(pg.locator('button:has-text("Refresh")').first, 0.6); r.wait(2.8)
    card = pg.locator('text=/^C: /').first
    r.click(card, 1.0); r.wait(3.4)
    r.glide(W * 0.55, H * 0.55, 0.9); r.wait(1.6)
    r.stop('schedule')
    pg.context.close()




def tab(pg, name):
    return pg.locator('button:visible, a:visible', has_text=name).filter(has_text=__import__('re').compile('^\\s*' + name + '\\s*$')).first


def schools(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/school-tracker/', wait_until='domcontentloaded', timeout=60000)
    pg.wait_for_selector('input[placeholder="Search Users"]', timeout=60000); pg.wait_for_timeout(1500)
    pg.locator('input[placeholder="Search Users"]').first.fill('Sample Student'); pg.wait_for_timeout(3000)
    pg.evaluate("()=>{const s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.text.includes('Sample Student'))); s.value=[...s.options].find(o=>o.text.includes('Sample Student')).value; s.dispatchEvent(new Event('change',{bubbles:true}))}")
    pg.wait_for_timeout(3500)
    t0 = tab(pg, 'Browse Schools')
    pg.evaluate("(y)=>scrollTo(0,y)", t0.bounding_box()['y'] + pg.evaluate('scrollY') - 20); pg.wait_for_timeout(800)
    r = Recorder(pg); r.start()
    r.mark('My Schools')
    r.click(tab(pg, 'My Schools'), 0.9); r.wait(2.8)
    r.glide(W * 0.5, H * 0.6, 0.8)
    smooth_scroll(pg, r, 320, 2.2); r.wait(1.6)
    smooth_scroll(pg, r, -320, 1.4); r.wait(0.4)
    r.mark('Map')
    r.click(tab(pg, 'Map'), 0.9); r.wait(3.6)
    r.glide(W * 0.55, H * 0.6, 1.0); r.wait(1.6)
    r.mark('Fit')
    r.click(tab(pg, 'Browse Schools'), 0.9); r.wait(2.0)
    reach = pg.locator('button:visible', has_text='Reach').first
    r.click(reach, 0.9); r.wait(2.4)
    likely = pg.locator('button:visible', has_text='Likely').first
    r.click(likely, 0.9); r.wait(2.4)
    r.glide(W * 0.5, H * 0.65, 0.8); r.wait(1.0)
    r.stop('schools')
    pg.context.close()


def schedule(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/schedule-staff/', wait_until='load', timeout=60000); pg.wait_for_timeout(3500)
    s_ = pg.locator('select:visible')
    s_.nth(0).select_option(label='Daily'); s_.nth(1).select_option(label='Bell Works Holmdel')
    pg.locator('input[type=date]:visible').first.fill('2026-10-24'); pg.locator('button:has-text("Refresh")').first.click(); pg.wait_for_timeout(5000)
    r = Recorder(pg); r.start()
    r.mark('Day')
    r.glide(W * 0.45, H * 0.6, 0.9); r.wait(1.0)
    smooth_scroll(pg, r, 220, 2.0); r.wait(1.4)
    smooth_scroll(pg, r, -220, 1.4); r.wait(0.4)
    r.mark('Class')
    cards = pg.locator('text=/^C: /')
    pick = None
    for i in range(cards.count()):
        bb = cards.nth(i).bounding_box()
        if bb and 120 < bb['y'] < H - 80: pick = cards.nth(i); break
    r.click(pick or cards.first, 1.0); r.wait(3.6)
    r.glide(W * 0.5, H * 0.55, 0.9); r.wait(1.8)
    back = pg.locator('button:visible, a:visible', has_text='Schedule').first
    r.click(back, 0.8); r.wait(1.2)
    r.mark('Week')
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.8); span.select_option(label='Weekly'); r.wait(0.4)
    pg.locator('input[type=date]:visible').first.fill('2026-10-19')
    r.click(pg.locator('button:has-text("Refresh")').first, 0.8); r.wait(3.6)
    r.glide(W * 0.6, H * 0.6, 1.0); r.wait(2.0)
    r.stop('schedule')
    pg.context.close()




def schools(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/school-tracker/', wait_until='domcontentloaded', timeout=60000)
    pg.wait_for_selector('input[placeholder="Search Users"]', timeout=60000); pg.wait_for_timeout(1500)
    pg.locator('input[placeholder="Search Users"]').first.fill('Sample Student')
    pg.wait_for_function("()=>[...document.querySelectorAll('select')].some(s=>[...s.options].some(o=>o.text.includes('Sample Student')))", timeout=60000); pg.wait_for_timeout(500)
    pg.evaluate("()=>{const s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.text.includes('Sample Student'))); s.value=[...s.options].find(o=>o.text.includes('Sample Student')).value; s.dispatchEvent(new Event('change',{bubbles:true}))}")
    pg.wait_for_timeout(4000)
    nav = lambda name: pg.locator('button.nav-link:visible', has_text=name).first
    # the tracker sits in a narrow column; zoom so it fills the frame edge to edge
    cw = pg.evaluate("()=>{const t=[...document.querySelectorAll('button.nav-link')].find(b=>/Browse Schools/.test(b.innerText)); let c=t; while(c && c.getBoundingClientRect().width < 500) c=c.parentElement; return c.getBoundingClientRect().width}")
    z = round(min(1.6, (W - 48) / cw), 3); print(' zoom', z)
    pg.evaluate(f"document.documentElement.style.zoom='{z}'"); pg.wait_for_timeout(1200)
    pg.evaluate("(y)=>scrollTo(0,y)", nav('Browse Schools').bounding_box()['y'] + pg.evaluate('scrollY') - 16); pg.wait_for_timeout(800)
    r = Recorder(pg); r.start()
    r.mark('My Schools')
    r.click(nav('My Schools'), 0.9); r.wait(2.6)
    r.glide(W * 0.55, H * 0.6, 0.8); r.wait(0.6)
    smooth_scroll(pg, r, 380, 3.0); r.wait(1.8)
    smooth_scroll(pg, r, 380, 3.0); r.wait(1.8)
    smooth_scroll(pg, r, -760, 1.6); r.wait(0.4)
    r.mark('Map')
    r.click(nav('Map'), 0.9); r.wait(2.0)
    smooth_scroll(pg, r, 160, 1.0); r.wait(2.2)
    r.glide(W * 0.55, H * 0.55, 1.0); r.wait(2.0)
    r.stop('schools')
    pg.context.close()


def click_xy(pg, r, x, y, dur=0.9):
    r.glide(x, y, dur); r.wait(0.25)
    pg.mouse.down(); r.wait(0.08); pg.mouse.up(); r.wait(0.15)


def schedule(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/schedule-staff/', wait_until='commit', timeout=90000)
    pg.wait_for_selector('select', timeout=120000); pg.wait_for_timeout(3000)
    s_ = pg.locator('select:visible')
    s_.nth(0).select_option(label='Daily'); s_.nth(1).select_option(label='Bell Works Holmdel')
    pg.locator('input[type=date]:visible').first.fill('2026-10-24'); pg.locator('button:has-text("Refresh")').first.click(); pg.wait_for_timeout(5000)
    r = Recorder(pg); r.start()
    r.mark('Day')
    r.glide(W * 0.45, H * 0.6, 0.9); r.wait(1.0)
    smooth_scroll(pg, r, 220, 2.0); r.wait(1.4)
    smooth_scroll(pg, r, -220, 1.4); r.wait(0.4)
    r.mark('Class')
    pt = pg.evaluate("""()=>{const els=[...document.querySelectorAll('body *')].filter(e=>!e.children.length && /^C: /.test((e.innerText||'').trim()));
        for (const e of els){const b=e.getBoundingClientRect(); if(b.top>140 && b.bottom<innerHeight-60 && b.width>20) return [b.left+b.width/2, b.top+b.height/2];} return null}""")
    print(' class at', pt)
    if pt:
        click_xy(pg, r, pt[0], pt[1]); r.wait(3.6)
        r.glide(W * 0.5, H * 0.55, 0.9); r.wait(1.8)
        back = pg.locator('button:visible, a:visible', has_text='Schedule').first
        if back.count(): r.click(back, 0.8); r.wait(1.2)
    r.mark('Week')
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.8); span.select_option(label='Weekly'); r.wait(0.4)
    pg.locator('input[type=date]:visible').first.fill('2026-10-19')
    r.click(pg.locator('button:has-text("Refresh")').first, 0.8); r.wait(3.6)
    r.glide(W * 0.6, H * 0.6, 1.0); r.wait(2.0)
    r.stop('schedule')
    pg.context.close()




def schedule(b):
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/schedule-staff/', wait_until='commit', timeout=90000)
    pg.wait_for_selector('select', timeout=120000); pg.wait_for_timeout(3000)
    s_ = pg.locator('select:visible')
    s_.nth(0).select_option(label='Daily'); s_.nth(1).select_option(label='Bell Works Holmdel')
    pg.locator('input[type=date]:visible').first.fill('2026-10-24'); pg.locator('button:has-text("Refresh")').first.click(); pg.wait_for_timeout(5000)
    r = Recorder(pg); r.start()
    r.mark('Day')
    r.glide(W * 0.45, H * 0.6, 0.9); r.wait(1.0)
    smooth_scroll(pg, r, 220, 2.0); r.wait(1.4)
    smooth_scroll(pg, r, -220, 1.4); r.wait(0.4)
    r.mark('Week')
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.8); span.select_option(label='Weekly'); r.wait(0.4)
    pg.locator('input[type=date]:visible').first.fill('2026-10-19')
    r.click(pg.locator('button:has-text("Refresh")').first, 0.8); r.wait(3.6)
    r.glide(W * 0.6, H * 0.6, 1.0); r.wait(1.6)
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.7); span.select_option(label='Daily'); r.wait(0.3)
    pg.locator('input[type=date]:visible').first.fill('2026-10-24')
    r.click(pg.locator('button:has-text("Refresh")').first, 0.7); r.wait(3.4)
    r.mark('Class')
    pt = pg.evaluate("""()=>{const els=[...document.querySelectorAll('body *')].filter(e=>!e.children.length && /^C: /.test((e.innerText||'').trim()));
        let best=null, bestN=0;
        for (const e of els){const b=e.getBoundingClientRect(); if(!(b.top>140 && b.bottom<innerHeight-60 && b.width>20)) continue;
          let c=e; for(let i=0;i<8 && c;i++){ const m=(c.innerText||'').match(/(\\d+)\\s*\\/\\s*(\\d+)/); if(m){ const n=+m[1]; if(n>bestN){bestN=n; best=[b.left+b.width/2, b.top+b.height/2];} break;} c=c.parentElement; } }
        return best}""")
    print(' class at', pt)
    if pt:
        click_xy(pg, r, pt[0], pt[1]); r.wait(3.6)
        r.glide(W * 0.5, H * 0.55, 0.9); r.wait(2.0)
    r.stop('schedule')
    pg.context.close()




LEAFLET_HOOK = r"""
(() => { window.__maps = [];
  const t = setInterval(() => { if (window.L && L.Map && !L.Map.__hooked) { L.Map.__hooked = true;
    L.Map.addInitHook(function () { window.__maps.push(this); }); clearInterval(t); } }, 20); })();
"""

FIT_SCHOOLS = """() => { const m = (window.__maps || []).slice(-1)[0]; if (!m) return 'no map';
  const pts = []; m.eachLayer(l => { if (l.getLatLng && !l.getRadius) pts.push(l.getLatLng()); });
  if (!pts.length) return 'no markers';
  m.flyToBounds(L.latLngBounds(pts).pad(0.12), {duration: 1.6}); return pts.length; }"""


def schools(b):
    # Lay the page out narrower (and render at a higher pixel ratio) so the tracker column fills
    # the frame while the cursor and clicks stay exactly aligned.
    vw, vh = 1040, round(1040 * H / W)
    ctx = b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=W * DPR / vw, storage_state='dev-session.json')
    ctx.add_init_script(CURSOR_JS); ctx.add_init_script(DEV_CHROME); ctx.add_init_script(LEAFLET_HOOK)
    pg = ctx.new_page()
    pg.goto('https://dev.foleyprep.com/apps/school-tracker/', wait_until='commit', timeout=90000)
    pg.wait_for_selector('input[placeholder="Search Users"]', timeout=90000); pg.wait_for_timeout(1500)
    pg.locator('input[placeholder="Search Users"]').first.fill('Sample Student')
    pg.wait_for_function("()=>[...document.querySelectorAll('select')].some(s=>[...s.options].some(o=>o.text.includes('Sample Student')))", timeout=60000); pg.wait_for_timeout(500)
    pg.evaluate("()=>{const s=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.text.includes('Sample Student'))); s.value=[...s.options].find(o=>o.text.includes('Sample Student')).value; s.dispatchEvent(new Event('change',{bubbles:true}))}")
    pg.wait_for_timeout(4000)
    nav = lambda name: pg.locator('button.nav-link:visible', has_text=name).first
    pg.evaluate("(y)=>scrollTo(0,y)", nav('Browse Schools').bounding_box()['y'] + pg.evaluate('scrollY') - 12); pg.wait_for_timeout(800)
    r = Recorder(pg); r.mouse = (vw * 0.6, vh * 0.85); r.start()
    r.mark('My Schools')
    r.click(nav('My Schools'), 0.9); r.wait(2.4)
    r.glide(vw * 0.55, vh * 0.6, 0.8); r.wait(0.4)
    smooth_scroll(pg, r, 300, 2.6); r.wait(1.6)
    smooth_scroll(pg, r, 300, 2.6); r.wait(1.4)
    smooth_scroll(pg, r, -600, 1.4); r.wait(0.3)
    r.mark('Map')
    r.click(nav('Map'), 0.9); r.wait(1.6)
    mp = pg.locator('.leaflet-container').first
    pg.evaluate("(y)=>scrollTo(0,y)", nav('Map').bounding_box()['y'] + pg.evaluate('scrollY') - 12)
    r.glide(vw * 0.06, vh * 0.5, 0.5)            # park the cursor off the map so nothing scrolls it
    pg.wait_for_timeout(600)
    # center the tracked schools: drag the map so the marker cluster sits mid-frame
    c = pg.evaluate("""()=>{const ms=[...document.querySelectorAll('.leaflet-marker-icon')].map(m=>m.getBoundingClientRect()).filter(b=>b.width);
        const map=document.querySelector('.leaflet-container').getBoundingClientRect();
        const xs=ms.map(b=>b.left+b.width/2), ys=ms.map(b=>b.top+b.height/2);
        return {cx:(Math.min(...xs)+Math.max(...xs))/2, cy:(Math.min(...ys)+Math.max(...ys))/2,
                mx:map.left+map.width/2, my:Math.max(map.top, 0)+(Math.min(map.bottom, innerHeight)-Math.max(map.top,0))/2, top:map.top}}""")
    dx, dy = c['mx'] - c['cx'], c['my'] - c['cy']
    sx, sy = c['mx'] + 120, c['my'] - 60
    r.glide(sx, sy, 0.8); r.wait(0.3)
    pg.mouse.down()
    n = 40
    for k in range(1, n + 1):
        e = k / n; e = 3 * e * e - 2 * e * e * e
        pg.mouse.move(sx + dx * e, sy + dy * e); pg.wait_for_timeout(28)
    pg.mouse.up(); r.mouse = (sx + dx, sy + dy); r.wait(1.2)
    mk = pg.locator('.leaflet-marker-icon:visible')
    pick = None
    for i in range(mk.count()):
        bb = mk.nth(i).bounding_box()
        if bb and 80 < bb['y'] < vh - 80 and 80 < bb['x'] < vw - 80: pick = mk.nth(i); break
    if pick is not None:
        r.click(pick, 1.0); r.wait(3.0)
    r.stop('schools')
    ctx.close()




def schedule(b):
    # Haddonfield, Sun 10/25: four tutors, classes all day, and a demo class roster (5 "<Name> Demo"
    # students added on dev). Changing the span reloads the grid by itself, so Refresh is never clicked.
    # The cursor stays in the time gutter and filter bar, off the availability blocks.
    pg = new_page(b, storage='dev-session.json', init=DEV_CHROME)
    pg.goto('https://dev.foleyprep.com/apps/schedule-staff/', wait_until='commit', timeout=90000)
    pg.wait_for_selector('select', timeout=120000)
    pg.wait_for_function("[...document.querySelectorAll('select option')].some(o=>o.text==='Haddonfield')", timeout=120000); pg.wait_for_timeout(1500)
    s_ = pg.locator('select:visible')
    s_.nth(0).select_option(label='Daily'); s_.nth(1).select_option(label='Haddonfield')
    pg.locator('input[type=date]:visible').first.fill('2026-10-25'); pg.locator('button:has-text("Refresh")').first.click(); pg.wait_for_timeout(5000)
    gutter_x = pg.evaluate("()=>{const xs=[...document.querySelectorAll('body *')].filter(e=>!e.children.length && /^\\d{1,2}:\\d{2} [AP]M$/.test((e.innerText||'').trim())).map(e=>{const b=e.getBoundingClientRect(); return b.width ? b.left+b.width/2 : 1e9}); return Math.min(...xs)}")
    r = Recorder(pg); r.mouse = (gutter_x, H * 0.85); r.start()
    r.mark('Day')
    r.glide(gutter_x, H * 0.62, 0.6); r.wait(0.6)
    smooth_scroll(pg, r, 220, 1.4); r.wait(0.9)
    smooth_scroll(pg, r, -220, 1.0); r.wait(0.2)
    r.mark('Week')
    span = pg.locator('select:visible').nth(0)
    sb = span.bounding_box()
    r.glide(gutter_x, sb['y'] + sb['height'] / 2, 0.45)          # up the time column, then across the filter bar
    r.click(span, 0.5); span.select_option(label='Weekly'); r.wait(3.4)
    span = pg.locator('select:visible').nth(0)
    r.click(span, 0.5); span.select_option(label='Daily'); r.wait(2.6)
    r.mark('Class')
    pt = pg.evaluate("""()=>{const els=[...document.querySelectorAll('body *')].filter(e=>!e.children.length && /^C: /.test((e.innerText||'').trim()));
        let best=null, bestN=0;
        for (const e of els){const b=e.getBoundingClientRect(); if(!(b.top>140 && b.bottom<innerHeight-30 && b.width>20)) continue;
          let c=e; for(let i=0;i<8 && c;i++){ const m=(c.innerText||'').match(/(\\d+)\\s*\\/\\s*(\\d+)/); if(m){ const n=+m[1]; if(n>bestN){bestN=n; best=[b.left+b.width/2, b.top+b.height/2];} break;} c=c.parentElement; } }
        return best}""")
    print(' class at', pt)
    if pt:
        r.glide(gutter_x, pt[1], 0.5)                            # down the time column to the card's row
        click_xy(pg, r, pt[0], pt[1], 0.5); r.wait(3.0)
        r.glide(W * 0.5, H * 0.55, 0.6); r.wait(1.6)
    r.stop('schedule')
    pg.context.close()




KIOSK_PRIVACY = r"""setInterval(()=>{ for (const e of document.querySelectorAll('body *')) {
    if (e.children.length) continue; const t = (e.innerText || '').trim();
    // student names: demo students (and Sample S.) stay visible; real students are blurred
    if (/^[A-Z][a-z]+ [A-Z]\.$/.test(t) && !/^(Sample S|[A-Z][a-z]+ D)\.$/.test(t)) {
      const block = e.closest('[class*=student i], li, div'); const prev = e.previousElementSibling;
      if (!/with/i.test((e.parentElement && e.parentElement.innerText) || '')) e.style.filter = 'blur(6px)';
    } } }, 120)"""


def kiosk(b):
    ctx = b.new_context(storage_state='kiosk-state.json', viewport={'width': W, 'height': H}, device_scale_factor=DPR)
    ctx.add_init_script(CURSOR_JS); ctx.add_init_script(KIOSK_PRIVACY)
    pg = ctx.new_page()
    pg.goto('https://dev.foleyprep.com/apps/kiosk/', wait_until='commit', timeout=90000)
    pg.wait_for_selector('text=Tap your session', timeout=90000); pg.wait_for_timeout(2500)
    r = Recorder(pg); r.mouse = (W * 0.75, H * 0.85); r.start()
    r.mark('Sessions')
    r.glide(W * 0.62, H * 0.55, 0.9); r.wait(0.6)
    smooth_scroll(pg, r, 260, 2.2); r.wait(1.0)
    r.mark('Check in')
    r.click(pg.get_by_text('SAT Reading/Writing').first, 0.9); r.wait(1.8)
    r.click(pg.get_by_text('Sample S.', exact=True).first, 0.9); r.wait(2.4)
    sk = pg.get_by_text('Skip and check in', exact=True)
    if sk.count():
        r.click(sk.first, 0.9)
    r.mark('Checked in')
    r.wait(4.2)
    r.stop('kiosk')
    ctx.close()


if __name__ == "__main__":
    with sync_playwright() as p:
        b = p.chromium.launch()
        for job in sys.argv[1:]:
            globals()[job](b)
        b.close()

