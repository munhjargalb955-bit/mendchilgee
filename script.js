"use strict";

const screens = [...document.querySelectorAll(".screen")];
const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const relationshipCounter = document.getElementById("relationshipCounter");
const counterLabel = document.getElementById("counterLabel");
const counterValue = document.getElementById("counterValue");
const noButton = document.getElementById("noButton");
const yesButton = document.getElementById("yesButton");
const questionCard = document.getElementById("questionCard");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const noMessages = ["ҮГҮЙ", "Итгэлтэй байна уу?", "Үнэхээр үү?", "Дахиад бод доо", "Гуйж байна 🥺"];
let noMessageIndex = 0;
let musicWanted = false;
let currentSlide = 0;
let confettiFrame = null;
let noAttempts = 0;
let showingRelationshipDate = false;

function getRelationshipDays() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const relationshipStartUtc = Date.UTC(2022, 10, 4);
  return Math.floor((todayUtc - relationshipStartUtc) / 86400000) + 1;
}

function updateRelationshipCounter() {
  relationshipCounter.classList.remove("flipping");
  void relationshipCounter.offsetWidth;
  relationshipCounter.classList.add("flipping");

  if (showingRelationshipDate) {
    counterLabel.textContent = "Бидний эхлэл";
    counterValue.textContent = "2022.11.04";
    relationshipCounter.setAttribute("aria-label", "Хамт байсан өдрийн тоолуур руу буцах");
  } else {
    counterLabel.textContent = "Бидний хайр";
    counterValue.textContent = `${getRelationshipDays()} өдөр хамтдаа`;
    relationshipCounter.setAttribute("aria-label", "Бидний үерхсэн огноог харах");
  }
  relationshipCounter.setAttribute("aria-pressed", String(showingRelationshipDate));
}

relationshipCounter.addEventListener("click", () => {
  showingRelationshipDate = !showingRelationshipDate;
  updateRelationshipCounter();
});

function showScreen(id) {
  const current = screens.find((screen) => !screen.hidden);
  const next = document.getElementById(id);
  if (!next || current === next) return;

  if (current) current.classList.add("leaving");
  window.setTimeout(() => {
    screens.forEach((screen) => {
      screen.hidden = true;
      screen.classList.remove("active", "leaving");
    });
    resetNoButton();
    next.hidden = false;
    requestAnimationFrame(() => next.classList.add("active"));
    next.querySelector("h1, h2, button")?.focus({ preventScroll: true });
  }, reduceMotion ? 0 : 420);
}

async function startMusic() {
  musicWanted = true;
  music.muted = false;
  try {
    await music.play();
  } catch (error) {
    musicWanted = false;
  }
  updateMusicButton();
}

function updateMusicButton() {
  const playing = !music.paused && !music.muted;
  musicToggle.classList.toggle("playing", playing);
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("aria-label", playing ? "Хөгжмийг хаах" : "Хөгжим тоглуулах");
  musicToggle.querySelector(".music-state").textContent = playing ? "Хөгжимтэй" : "Хөгжимгүй";
  musicToggle.querySelector(".music-icon").textContent = playing ? "♫" : "♪";
}

musicToggle.addEventListener("click", async () => {
  if (!music.paused && !music.muted) {
    music.muted = true;
    musicWanted = false;
  } else {
    music.muted = false;
    await startMusic();
  }
  updateMusicButton();
});

document.getElementById("openGift").addEventListener("click", () => {
  startMusic();
  showScreen("question");
});

function rectanglesOverlap(a, b, padding = 0) {
  return !(a.right + padding < b.left || a.left - padding > b.right || a.bottom + padding < b.top || a.top - padding > b.bottom);
}

function moveNoButton(event) {
  event?.preventDefault();
  event?.stopPropagation();
  noAttempts += 1;

  const baseWidth = Math.min(150, window.innerWidth / 2 - 34);
  const yesWidth = Math.min(baseWidth + noAttempts * 18, Math.min(230, window.innerWidth * .68));
  const yesHeight = Math.min(54 + noAttempts * 4, 78);
  const noWidth = Math.max(baseWidth - noAttempts * 12, 74);
  const noHeight = Math.max(54 - noAttempts * 3, 38);
  yesButton.style.setProperty("--yes-width", `${yesWidth}px`);
  yesButton.style.setProperty("--yes-height", `${yesHeight}px`);
  yesButton.style.setProperty("--yes-font-size", `${Math.min(16 + noAttempts, 22)}px`);
  noButton.style.setProperty("--no-width", `${noWidth}px`);
  noButton.style.setProperty("--no-height", `${noHeight}px`);
  noButton.style.setProperty("--no-font-size", `${Math.max(16 - noAttempts * .7, 10)}px`);
  noButton.classList.add("is-running");

  const margin = 12;
  const rect = noButton.getBoundingClientRect();
  const protectedElements = [yesButton, questionCard.querySelector(".cat"), questionCard.querySelector("h2"), questionCard.querySelector(".subtext")];
  const protectedRects = protectedElements.map((element) => element.getBoundingClientRect());
  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
  let position = null;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = {
      left: margin + Math.random() * Math.max(0, maxX - margin),
      top: margin + Math.random() * Math.max(0, maxY - margin)
    };
    const candidateRect = {
      left: candidate.left,
      top: candidate.top,
      right: candidate.left + rect.width,
      bottom: candidate.top + rect.height
    };
    if (!protectedRects.some((protectedRect) => rectanglesOverlap(candidateRect, protectedRect, 16))) {
      position = candidate;
      break;
    }
  }

  if (!position) {
    position = { left: margin, top: Math.max(margin, window.innerHeight - rect.height - margin) };
  }

  noButton.style.left = `${Math.round(position.left)}px`;
  noButton.style.top = `${Math.round(position.top)}px`;
  noMessageIndex = (noMessageIndex + 1) % noMessages.length;
  noButton.textContent = noMessages[noMessageIndex];
}

function resetNoButton() {
  noButton.classList.remove("is-running");
  noButton.removeAttribute("style");
  yesButton.removeAttribute("style");
  noButton.textContent = "ҮГҮЙ";
  noMessageIndex = 0;
  noAttempts = 0;
}

noButton.addEventListener("pointerdown", moveNoButton);
noButton.addEventListener("click", (event) => event.preventDefault());
window.addEventListener("resize", () => {
  if (noButton.classList.contains("is-running")) moveNoButton();
});

yesButton.addEventListener("click", () => {
  showScreen("celebration");
  launchCelebration();
});
document.getElementById("seeMemories").addEventListener("click", () => showScreen("memories"));
document.getElementById("finalMessage").addEventListener("click", () => showScreen("final"));
document.getElementById("replay").addEventListener("click", () => {
  currentSlide = 0;
  updateSlides();
  showScreen("opening");
});

function createAmbientHearts() {
  if (reduceMotion) return;
  const container = document.querySelector(".ambient-hearts");
  for (let i = 0; i < 13; i += 1) {
    const heart = document.createElement("span");
    heart.className = "ambient-heart";
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${12 + Math.random() * 19}px`;
    heart.style.animationDuration = `${8 + Math.random() * 9}s`;
    heart.style.animationDelay = `${-Math.random() * 14}s`;
    container.appendChild(heart);
  }
}

function launchCelebration() {
  if (reduceMotion) return;
  const hearts = document.getElementById("celebrationHearts");
  hearts.replaceChildren();
  for (let i = 0; i < 22; i += 1) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent = Math.random() > .35 ? "♥" : "♡";
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${15 + Math.random() * 25}px`;
    heart.style.animationDelay = `${Math.random() * 1.6}s`;
    hearts.appendChild(heart);
  }
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const context = canvas.getContext("2d");
  const colors = ["#ef6f7f", "#f8a2b9", "#73d6ae", "#ffe6a7", "#ffffff"];
  const pieces = Array.from({ length: 115 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -30 - Math.random() * window.innerHeight * .5,
    width: 5 + Math.random() * 7,
    height: 8 + Math.random() * 8,
    speed: 2 + Math.random() * 4,
    drift: -1.1 + Math.random() * 2.2,
    rotation: Math.random() * Math.PI,
    spin: -.12 + Math.random() * .24,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  const started = performance.now();

  function resizeCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }
  resizeCanvas();
  cancelAnimationFrame(confettiFrame);

  function draw(now) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotation += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
      context.restore();
    });
    if (now - started < 5000 && pieces.some((piece) => piece.y < window.innerHeight + 30)) {
      confettiFrame = requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
  confettiFrame = requestAnimationFrame(draw);
}

const slides = [...document.querySelectorAll(".slide")];
const dotsContainer = document.getElementById("slideDots");
slides.forEach((slide, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "dot";
  dot.setAttribute("aria-label", `${index + 1}-р дурсамжийг үзэх`);
  dot.addEventListener("click", () => { currentSlide = index; updateSlides(); });
  dotsContainer.appendChild(dot);
});

function updateSlides(direction = 1) {
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentSlide);
    slide.classList.toggle("from-left", direction < 0 && index !== currentSlide);
    slide.setAttribute("aria-hidden", String(index !== currentSlide));
    if (index !== currentSlide) slide.querySelector("video")?.pause();
  });
  [...dotsContainer.children].forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
    dot.setAttribute("aria-current", index === currentSlide ? "true" : "false");
  });
}

function changeSlide(direction) {
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  updateSlides(direction);
}
document.getElementById("prevSlide").addEventListener("click", () => changeSlide(-1));
document.getElementById("nextSlide").addEventListener("click", () => changeSlide(1));

let touchStartX = 0;
let touchStartY = 0;
const slideshow = document.getElementById("slideshow");
slideshow.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });
slideshow.addEventListener("touchend", (event) => {
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) changeSlide(deltaX < 0 ? 1 : -1);
}, { passive: true });

document.querySelectorAll(".photo-frame img").forEach((image) => {
  image.addEventListener("error", () => image.classList.add("is-missing"));
});

document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => {
    if (!music.paused) music.volume = 0.08;
  });
  video.addEventListener("pause", () => {
    music.volume = 0.3;
  });
  video.addEventListener("ended", () => {
    music.volume = 0.3;
  });
});

createAmbientHearts();
updateRelationshipCounter();
updateSlides();
updateMusicButton();
music.volume = 0.2;
