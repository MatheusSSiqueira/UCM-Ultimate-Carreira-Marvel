const DOM = {
  form: document.getElementById("careerForm"),
  submitBtn: document.getElementById("submitBtn"),
  errorBox: document.getElementById("errorBox"),
  loadingCard: document.getElementById("loadingCard"),
  placeholderCard: document.getElementById("placeholderCard"),
  resultCard: document.getElementById("resultCard"),
  heroRosterGrid: document.getElementById("heroRosterGrid"),
  randomStickersLayer: document.getElementById("randomStickersLayer"),
  comicFxOverlay: document.getElementById("comicFxOverlay"),
  heroImage: document.getElementById("heroImage"),
  heroName: document.getElementById("heroName"),
  alterEgo: document.getElementById("alterEgo"),
  compatibilityBadge: document.getElementById("compatibilityBadge"),
  imageAttribution: document.getElementById("imageAttribution"),
  traitAnalysis: document.getElementById("traitAnalysis"),
  careerAdvice: document.getElementById("careerAdvice"),
  nextStep: document.getElementById("nextStep"),
  privacyNotice: document.getElementById("privacyNotice"),
  btnContrast: document.getElementById("btnContrast"),
};

const HERO_CHARACTERS = [
  { key: "IRON_MAN", name: "Homem de Ferro", primary: "#ed1d24", accent: "#facc15" },
  { key: "SPIDER_MAN", name: "Homem-Aranha", primary: "#dc2626", accent: "#2563eb" },
  { key: "CAPTAIN_AMERICA", name: "Cap. America", primary: "#1d4ed8", accent: "#ef4444" },
  { key: "BLACK_PANTHER", name: "Pantera Negra", primary: "#18181b", accent: "#a855f7" },
  { key: "DOCTOR_STRANGE", name: "Dr. Estranho", primary: "#7c2d12", accent: "#22c55e" },
  { key: "BLACK_WIDOW", name: "Viuva Negra", primary: "#09090b", accent: "#ef4444" },
];

function generateCharacterPngDataUrl(heroKey) {
  const hero = HERO_CHARACTERS.find((h) => h.key === heroKey) || HERO_CHARACTERS[0];
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 320, 320);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";

  ctx.fillStyle = hero.accent;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    const radius = i % 2 === 0 ? 145 : 110;
    const x = 160 + Math.cos(angle) * radius;
    const y = 155 + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = hero.primary;
  ctx.beginPath();
  ctx.ellipse(160, 155, 78, 95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  if (hero.key === "IRON_MAN") {
    ctx.fillStyle = "#facc15";
    ctx.fillRect(102, 95, 116, 115);
    ctx.strokeRect(102, 95, 116, 115);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(112, 132, 36, 16);
    ctx.fillRect(172, 132, 36, 16);
  } else if (hero.key === "CAPTAIN_AMERICA") {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("A", 160, 118);
    ctx.fillRect(115, 135, 32, 16);
    ctx.fillRect(173, 135, 32, 16);
  } else {
    ctx.beginPath();
    ctx.moveTo(105, 130);
    ctx.lineTo(148, 148);
    ctx.lineTo(112, 162);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(215, 130);
    ctx.lineTo(172, 148);
    ctx.lineTo(208, 162);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(35, 255, 250, 44);
  ctx.strokeRect(35, 255, 250, 44);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(hero.name.toUpperCase(), 160, 286);

  return canvas.toDataURL("image/png");
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderRandomCharacterRoster() {
  const shuffled = shuffleArray(HERO_CHARACTERS);
  DOM.heroRosterGrid.textContent = "";

  shuffled.forEach((hero) => {
    const card = document.createElement("div");
    card.className = "roster-item";
    const randomTilt = (Math.random() * 6 - 3).toFixed(1);
    card.style.transform = `rotate(${randomTilt}deg)`;

    const img = document.createElement("img");
    img.src = generateCharacterPngDataUrl(hero.key);
    img.alt = `${hero.name} PNG`;

    const label = document.createElement("span");
    label.textContent = hero.name;

    card.appendChild(img);
    card.appendChild(label);
    DOM.heroRosterGrid.appendChild(card);
  });

  renderFloatingBackgroundStickers(shuffled);
}

function renderFloatingBackgroundStickers(heroes) {
  DOM.randomStickersLayer.textContent = "";
  const zones = [
    { top: "14%", left: "3%" },
    { top: "68%", left: "4%" },
    { top: "18%", left: "88%" },
    { top: "72%", left: "87%" },
  ];

  zones.forEach((zone, idx) => {
    const hero = heroes[idx % heroes.length];
    const sticker = document.createElement("img");
    sticker.className = "floating-sticker";
    sticker.src = generateCharacterPngDataUrl(hero.key);
    sticker.alt = "";
    const angle = Math.floor(Math.random() * 32 - 16);
    sticker.style.top = zone.top;
    sticker.style.left = zone.left;
    sticker.style.transform = `rotate(${angle}deg)`;
    DOM.randomStickersLayer.appendChild(sticker);
  });
}

function triggerComicClickEffect() {
  const words = ["AVANTE", "IMPACTO", "VISAO", "ACAO", "SUCESSO"];
  const chosen = words[Math.floor(Math.random() * words.length)];

  DOM.submitBtn.classList.add("btn-clicked");
  setTimeout(() => DOM.submitBtn.classList.remove("btn-clicked"), 360);

  DOM.comicFxOverlay.textContent = "";
  const burst = document.createElement("div");
  burst.className = "comic-burst-word";
  burst.textContent = chosen;
  DOM.comicFxOverlay.appendChild(burst);
  DOM.comicFxOverlay.classList.remove("hidden");

  setTimeout(() => {
    DOM.comicFxOverlay.classList.add("hidden");
  }, 550);
}

function stripUnsafeChars(value) {
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/\s+/g, " ").trim();
}

function getFormPayload() {
  return {
    work_style: stripUnsafeChars(document.getElementById("work_style").value),
    main_skill: stripUnsafeChars(document.getElementById("main_skill").value),
    biggest_challenge: stripUnsafeChars(document.getElementById("biggest_challenge").value),
    career_goal: stripUnsafeChars(document.getElementById("career_goal").value),
    lgpd_consent: document.getElementById("lgpd_consent").checked,
  };
}

function validatePayload(payload) {
  if (!payload.lgpd_consent) {
    throw new Error("Por favor, marque a caixa de autorizacao para gerar seu diagnostico.");
  }
  if (
    payload.main_skill.length < 3 ||
    payload.biggest_challenge.length < 3 ||
    payload.career_goal.length < 3
  ) {
    throw new Error("Preencha todos os campos com pelo menos 3 caracteres validos.");
  }
}

function setLoadingState(isLoading) {
  DOM.submitBtn.disabled = isLoading;
  DOM.submitBtn.textContent = isLoading
    ? "GERANDO DIAGNOSTICO EXECUTIVO..."
    : "GERAR MEU PERFIL E MENTORIA";

  if (isLoading) {
    DOM.placeholderCard.classList.add("hidden");
    DOM.resultCard.classList.add("hidden");
    DOM.loadingCard.classList.remove("hidden");
  } else {
    DOM.loadingCard.classList.add("hidden");
  }
}

function showError(message) {
  DOM.errorBox.textContent = message;
  DOM.errorBox.classList.remove("hidden");
  DOM.placeholderCard.classList.remove("hidden");
}

function clearError() {
  DOM.errorBox.textContent = "";
  DOM.errorBox.classList.add("hidden");
}

function renderHeroMatch(data) {
  const localCharacterPng = generateCharacterPngDataUrl(data.hero_key);
  DOM.heroImage.onerror = () => {
    DOM.heroImage.src = localCharacterPng;
  };
  DOM.heroImage.src = localCharacterPng;

  DOM.heroName.textContent = data.hero_name;
  DOM.alterEgo.textContent = data.alter_ego;
  DOM.compatibilityBadge.textContent = `${data.compatibility_score}% AFINIDADE`;
  DOM.imageAttribution.textContent = data.image_attribution;
  DOM.traitAnalysis.textContent = data.trait_analysis;
  DOM.careerAdvice.textContent = data.career_advice;
  DOM.nextStep.textContent = data.recommended_next_step;
  if (DOM.privacyNotice) {
    DOM.privacyNotice.textContent = data.privacy_notice;
  }

  DOM.placeholderCard.classList.add("hidden");
  DOM.resultCard.classList.remove("hidden");
}

async function requestHeroMatch(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch("/api/v1/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = Array.isArray(data.detail)
        ? data.detail[0].msg
        : data.detail || "Nao foi possivel concluir a analise no momento.";
      throw new Error(errorMessage);
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("A conexao demorou mais que o esperado. Tente novamente.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  clearError();
  triggerComicClickEffect();

  try {
    const payload = getFormPayload();
    validatePayload(payload);
    setLoadingState(true);

    const [matchResult] = await Promise.all([
      requestHeroMatch(payload),
      new Promise((resolve) => setTimeout(resolve, 650)),
    ]);

    setLoadingState(false);
    renderHeroMatch(matchResult);
  } catch (error) {
    setLoadingState(false);
    showError(error.message);
  }
}

function initReadingContrastToggle() {
  if (!DOM.btnContrast) return;
  DOM.btnContrast.addEventListener("click", () => {
    const isReadingMode = document.body.classList.toggle("reading-contrast-mode");
    DOM.btnContrast.setAttribute("aria-pressed", String(isReadingMode));
    DOM.btnContrast.textContent = isReadingMode ? "Modo HQ" : "Modo Leitura";
  });
}

initReadingContrastToggle();
renderRandomCharacterRoster();
DOM.form.addEventListener("submit", handleFormSubmit);