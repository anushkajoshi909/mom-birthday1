// ===== Birthday settings =====
const BIRTH_MONTH = 2; // February (1-12)
const BIRTH_DAY = 17;  // 17th
const BIRTH_YEAR = 1977;

// ===== Slideshow settings =====
const PICS = ['photo_01.jpg', 'photo_02.jpg', 'photo_03.jpg', 'photo_04.jpg', 'photo_05.jpg', 'photo_06.jpeg', 'photo_07.jpeg', 'photo_08.jpeg', 'photo_09.jpeg', 'photo_10.jpeg', 'photo_11.jpeg', 'photo_12.jpg', 'photo_13.jpeg'];
const SLIDE_MS = 2200;

// ===== Helpers =====
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

// ===== Countdown =====
function nextBirthdayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const thisYear = new Date(y, BIRTH_MONTH - 1, BIRTH_DAY, 0, 0, 0);
  return now <= thisYear ? thisYear : new Date(y + 1, BIRTH_MONTH - 1, BIRTH_DAY, 0, 0, 0);
}

function updateCountdown() {
  const now = new Date();
  const target = nextBirthdayDate();
  const diff = Math.max(0, target - now);

  const age = target.getFullYear() - BIRTH_YEAR;
  const ageLine = $("ageLine");
  if (ageLine) {
    ageLine.innerHTML = `You’re turning <strong>${age}</strong> this year… older, but still <span class="pretty">so pretty</span> ✨`;
  }

  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / (24 * 3600));
  const hours = Math.floor((total % (24 * 3600)) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if ($("cdDays")) $("cdDays").textContent = days;
  if ($("cdHours")) $("cdHours").textContent = pad(hours);
  if ($("cdMins")) $("cdMins").textContent = pad(mins);
  if ($("cdSecs")) $("cdSecs").textContent = pad(secs);
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ===== Music + Slideshow playback =====
const music = $("music");
if (music) {
  // Put your MP3 here: assets/song.mp3
  music.src = "assets/song.mp3";
}

let slideTimer = null;
let slideIndex = 0;
let started = false;

function setSlide(i) {
  const img = $("slide");
  if (!img || !PICS.length) return;
  img.src = "assets/images/" + PICS[i];
}

function startSlideshowTick() {
  if (slideTimer || !PICS.length) return;
  slideTimer = setInterval(() => {
    slideIndex = (slideIndex + 1) % PICS.length;
    setSlide(slideIndex);
  }, SLIDE_MS);
}

function stopSlideshowTick() {
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = null;
}

async function startPlayback() {
  if (!PICS.length) return;

  if (!started) {
    started = true;
    slideIndex = 0;
    setSlide(0);
  }
  startSlideshowTick();

  // Hide the big overlay play button once playing
  const overlay = $("videoOverlayBtn");
  if (overlay) overlay.style.display = "none";

  try {
    if (music) await music.play();
  } catch (e) {
    alert("Music didn't start. Make sure you added an MP3 at assets/song.mp3");
  }
}

$("playBtn")?.addEventListener("click", () => {
  startPlayback();
  $("slideshow")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

$("videoOverlayBtn")?.addEventListener("click", startPlayback);

$("pauseBtn")?.addEventListener("click", () => {
  stopSlideshowTick();
  if (music) music.pause();
  const overlay = $("videoOverlayBtn");
  if (overlay) overlay.style.display = "";
});

$("resumeBtn")?.addEventListener("click", async () => {
  startSlideshowTick();
  const overlay = $("videoOverlayBtn");
  if (overlay) overlay.style.display = "none";
  try { if (music) await music.play(); } catch {}
});

// ===== Naughty buttons game =====
document.querySelectorAll(".run").forEach((btn) => {
  const hop = () => {
    const dx = Math.random() * 220 - 110;
    const dy = Math.random() * 140 - 70;
    btn.style.position = "relative";
    btn.style.left = dx + "px";
    btn.style.top = dy + "px";
  };
  btn.addEventListener("mouseenter", hop);
  btn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      hop();
    },
    { passive: false }
  );
});

$("meBtn")?.addEventListener("click", () => {
  $("win")?.classList.remove("hidden");
  startConfetti();
});

// ===== Confetti =====
const canvas = $("confetti");
const ctx = canvas?.getContext("2d");
let pieces = [];
let running = false;

function resize() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
}
window.addEventListener("resize", resize);
resize();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function startConfetti() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const count = 180;
  pieces = Array.from({ length: count }, () => ({
    x: rand(0, canvas.width),
    y: rand(-canvas.height, 0),
    r: rand(4, 9) * dpr,
    vx: rand(-1.2, 1.2) * dpr,
    vy: rand(2.0, 4.5) * dpr,
    rot: rand(0, Math.PI),
    vr: rand(-0.08, 0.08),
    a: rand(0.6, 1.0),
  }));
  running = true;
  tick();
  setTimeout(() => (running = false), 3800);
}

function tick() {
  if (!canvas || !ctx) return;
  if (!running) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const palette = ["#ff4d8d", "#ffb3cc", "#7dd3fc", "#ffd061", "#c4b5fd"];
  for (const p of pieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vy += 0.03 * (window.devicePixelRatio || 1);

    if (p.y > canvas.height + 30) {
      p.y = rand(-200, -20);
      p.x = rand(0, canvas.width);
      p.vy = rand(2.0, 4.5) * (window.devicePixelRatio || 1);
    }
    if (p.x < -30) p.x = canvas.width + 30;
    if (p.x > canvas.width + 30) p.x = -30;

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = palette[Math.floor(rand(0, palette.length))];
    ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.9);
    ctx.restore();
  }
  requestAnimationFrame(tick);
}

$("magicBtn")?.addEventListener("click", startConfetti);
