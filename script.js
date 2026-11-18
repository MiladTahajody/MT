(function () {
  "use strict";

  var cfg = Object.assign(
    { fullName: "Full Name", startDate: "1987/aug/21", bpm: 72 },
    window.CONFIG || {}
  );

  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  /* ---------- name + beat speed ---------- */
  document.getElementById("fullName").textContent = cfg.fullName;
  document.title = cfg.fullName;
  var bpm = Number(cfg.bpm) > 0 ? Number(cfg.bpm) : 72;
  document.documentElement.style.setProperty("--beat", (60 / bpm).toFixed(4) + "s");

  /* ---------- days counter ---------- */
  function parseStart(str) {
    var p = String(str).trim().split(/[\/\-\s.]+/);
    var y = parseInt(p[0], 10);
    var m = isNaN(p[1]) ? MONTHS[String(p[1]).slice(0, 3).toLowerCase()] : parseInt(p[1], 10) - 1;
    var d = parseInt(p[2], 10) || 1;
    if (isNaN(y) || m === undefined || isNaN(m)) return null;
    return Date.UTC(y, m, d);
  }

  var daysEl = document.getElementById("days");
  function updateDays() {
    var start = parseStart(cfg.startDate);
    if (start === null) { daysEl.textContent = "—"; return; }
    var now = new Date();
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var n = Math.floor((today - start) / 86400000);
    daysEl.textContent = n.toLocaleString("en-US");
  }
  function scheduleMidnight() {
    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    setTimeout(function () { updateDays(); scheduleMidnight(); }, next - now);
  }
  updateDays();
  scheduleMidnight();

  /* ---------- audio ---------- */
  var audio = document.getElementById("heartbeat");
  var btn = document.getElementById("toggle");
  var hint = document.getElementById("hint");
  var body = document.body;

  function setPlaying(on) {
    body.classList.toggle("playing", on);
    btn.setAttribute("aria-label", on ? "Pause heartbeat" : "Play heartbeat");
  }
  function updateHint() { hint.hidden = !(audio.muted && !audio.paused); }

  // the visual beat starts exactly when sound actually starts
  audio.addEventListener("playing", function () { setPlaying(true); updateHint(); });
  audio.addEventListener("pause", function () { setPlaying(false); updateHint(); });
  audio.addEventListener("volumechange", updateHint);

  var userPaused = false;

  // 1) try with sound  2) if the browser blocks it, start muted (always allowed) and unmute on first gesture
  function autoStart() {
    if (userPaused || !audio.paused) return;
    audio.muted = false;
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () {
        audio.muted = true;
        var q = audio.play();
        if (q && q.catch) q.catch(function () {});
      });
    }
  }

  btn.addEventListener("click", function () {
    if (audio.muted && !audio.paused) { audio.muted = false; return; }   // first tap = unmute
    if (audio.paused) { userPaused = false; audio.muted = false; audio.play().catch(function () {}); }
    else { userPaused = true; audio.pause(); }
  });

  // any real gesture unmutes (browsers only allow unmuting after user activation)
  var GESTURES = ["pointerdown", "pointerup", "click", "touchend", "keydown"];
  function onGesture(e) {
    if (e.target && e.target.closest && e.target.closest("#toggle")) return;
    if (audio.paused && !userPaused) { audio.muted = false; audio.play().catch(function () {}); }
    else if (audio.muted && !audio.paused) { audio.muted = false; }
    if (!audio.muted && !audio.paused) {
      GESTURES.forEach(function (t) { window.removeEventListener(t, onGesture, true); });
    }
  }
  GESTURES.forEach(function (t) { window.addEventListener(t, onGesture, true); });

  // fire as early as possible, and retry when data is ready / page becomes visible
  autoStart();
  audio.addEventListener("canplay", autoStart);
  window.addEventListener("load", autoStart);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) autoStart(); });
})();
