const REQUIRED_ELEMENTS = {
  form: "careerForm",
  submitBtn: "submitBtn",
  errorBox: "errorBox",
  loadingCard: "loadingCard",
  placeholderCard: "placeholderCard",
  resultCard: "resultCard",
  heroRosterGrid: "heroRosterGrid",
  hqWall: "hqWall",
  comicFxOverlay: "comicFxOverlay",
  workStyle: "work_style",
  mainSkill: "main_skill",
  biggestChallenge: "biggest_challenge",
  careerGoal: "career_goal",
  lgpdConsent: "lgpd_consent",
  heroImage: "heroImage",
  heroName: "heroName",
  alterEgo: "alterEgo",
  compatibilityBadge: "compatibilityBadge",
  analysisSourceBadge: "analysisSourceBadge",
  traitAnalysis: "traitAnalysis",
  careerAdvice: "careerAdvice",
  nextStep: "nextStep",
  privacyNotice: "privacyNotice",
  btnContrast: "btnContrast",
};

const HERO_CHARACTERS = [
  { key: "IRON_MAN", name: "Homem de Ferro" },
  { key: "SPIDER_MAN", name: "Homem-Aranha" },
  { key: "CAPTAIN_AMERICA", name: "Capitão América" },
  { key: "BLACK_PANTHER", name: "Pantera Negra" },
  { key: "DOCTOR_STRANGE", name: "Doutor Estranho" },
  { key: "BLACK_WIDOW", name: "Viúva Negra" },
];

const HERO_IMAGE_PATHS = Object.fromEntries(
  HERO_CHARACTERS.map(({ key }) => [key, `/static/img/heroes/${key}.svg`]),
);

const HQ_PANEL_LAYOUT = [
  { size: "p-m", art: 1 }, { size: "p-wide", art: 2 },
  { size: "p-s", art: 3 }, { size: "p-tall", art: 4 },
  { size: "p-l", art: 5 }, { size: "p-m", speech: "Qual é o plano?" },
  { size: "p-wide", art: 6 }, { size: "p-s", art: 1 },
  { size: "p-l", speech: "Confie no processo." }, { size: "p-m", art: 2 },
  { size: "p-tall", art: 3 }, { size: "p-wide", art: 4 },
  { size: "p-s", speech: "Mais um ciclo de trabalho." }, { size: "p-l", art: 5 },
  { size: "p-m", art: 6 }, { size: "p-wide", speech: "Reúna o time!" },
  { size: "p-tall", art: 1 }, { size: "p-m", speech: "Vamos por partes." },
  { size: "p-l", art: 2 }, { size: "p-s", art: 3 },
  { size: "p-wide", speech: "Ideias em ação!" }, { size: "p-m", art: 4 },
  { size: "p-tall", speech: "O próximo passo é seu." }, { size: "p-l", art: 5 },
];

const ACTION_WORDS = ["AÇÃO", "AVANTE", "IMPACTO", "FOCO", "RESULTADO"];
const MIN_REQUEST_TIMEOUT_MS = 16_000;
const STARTUP_ERROR =
  "O servidor está iniciando ou indisponível. Tente novamente em alguns segundos.";
const FIELD_IDS = ["work_style", "main_skill", "biggest_challenge", "career_goal", "lgpd_consent"];
const FIELD_LABELS = {
  work_style: "Escolha como você costuma liderar ou gerar resultados.",
  main_skill: "Informe sua especialidade com pelo menos 3 caracteres.",
  biggest_challenge: "Descreva seu desafio com pelo menos 3 caracteres.",
  career_goal: "Descreva sua meta com pelo menos 3 caracteres.",
  lgpd_consent: "Autorize o processamento temporário dos dados para continuar.",
};
const FIELD_LIMITS = {
  main_skill: 120,
  biggest_challenge: 200,
  career_goal: 200,
};

const HQ_PANEL_IMAGES = new Map();

function getDomElements() {
  const elements = {};
  const missingNames = [];

  Object.entries(REQUIRED_ELEMENTS).forEach(([name, id]) => {
    elements[name] = document.getElementById(id);
    if (!elements[name]) {
      missingNames.push(id);
      console.error(`Elemento obrigatório ausente: #${id}`);
    }
  });

  if (missingNames.length > 0) {
    const message = "Não foi possível iniciar a página. Atualize-a e tente novamente.";
    if (elements.errorBox) {
      elements.errorBox.textContent = message;
      elements.errorBox.classList.remove("hidden");
    } else {
      window.alert(message);
    }
    return null;
  }

  return elements;
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function renderRandomCharacterRoster(dom) {
  dom.heroRosterGrid.textContent = "";

  shuffleArray(HERO_CHARACTERS).forEach((hero, index) => {
    const card = document.createElement("div");
    card.className = `roster-item roster-tilt-${index % 5}`;

    const image = document.createElement("img");
    image.src = HERO_IMAGE_PATHS[hero.key];
    image.alt = `Emblema original do perfil ${hero.name}`;

    const label = document.createElement("span");
    label.textContent = hero.name;

    card.append(image, label);
    dom.heroRosterGrid.appendChild(card);
  });
}

function showCssPanelArt(panel, artNumber, actionWord) {
  panel.replaceChildren();
  panel.classList.add(`art-${artNumber}`, "is-css-art");

  const soundEffect = document.createElement("span");
  soundEffect.className = "hq-sfx";
  soundEffect.textContent = actionWord;
  panel.appendChild(soundEffect);
}

function loadPanelImage(panel, imageNumber, artNumber, actionWord) {
  const imagePath = `/static/img/hq/painel-${imageNumber}.jpg`;
  let availability = HQ_PANEL_IMAGES.get(imagePath);
  if (!availability) {
    availability = fetch(imagePath, { method: "HEAD" })
      .then((response) => response.ok)
      .catch(() => false);
    HQ_PANEL_IMAGES.set(imagePath, availability);
  }

  const image = document.createElement("img");
  image.loading = "lazy";
  image.decoding = "async";
  image.alt = "";
  image.onerror = () => showCssPanelArt(panel, artNumber, actionWord);

  availability.then((isAvailable) => {
    if (!isAvailable) return;
    panel.classList.remove(`art-${artNumber}`, "is-css-art");
    panel.replaceChildren(image);
    image.src = imagePath;
  });
}

function renderHqWall(dom) {
  const grid = document.createElement("div");
  grid.className = "hq-panel-grid";
  let imageIndex = 0;

  HQ_PANEL_LAYOUT.forEach((panelData, index) => {
    const panel = document.createElement("div");
    panel.className = `hq-panel ${panelData.size} panel-tilt-${(index % 3) + 1}`;

    if (panelData.speech) {
      panel.classList.add("speech-panel");
      const balloon = document.createElement("span");
      balloon.className = "speech-balloon";
      balloon.textContent = panelData.speech;
      panel.appendChild(balloon);
    } else {
      imageIndex = (imageIndex % 12) + 1;
      const imageNumber = imageIndex.toString().padStart(2, "0");
      const actionWord = ACTION_WORDS[(index + panelData.art) % ACTION_WORDS.length];
      showCssPanelArt(panel, panelData.art, actionWord);
      loadPanelImage(panel, imageNumber, panelData.art, actionWord);
    }

    grid.appendChild(panel);
  });

  shuffleArray([...grid.children]).forEach((panel) => grid.appendChild(panel));
  dom.hqWall.appendChild(grid);
}

function stripUnsafeChars(value) {
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/\s+/g, " ").trim();
}

function getFormPayload(dom) {
  return {
    work_style: stripUnsafeChars(dom.workStyle.value),
    main_skill: stripUnsafeChars(dom.mainSkill.value),
    biggest_challenge: stripUnsafeChars(dom.biggestChallenge.value),
    career_goal: stripUnsafeChars(dom.careerGoal.value),
    lgpd_consent: dom.lgpdConsent.checked,
  };
}

function validatePayload(payload) {
  const invalidFields = [];
  let message = "";

  if (!payload.lgpd_consent) {
    invalidFields.push("lgpd_consent");
    message = FIELD_LABELS.lgpd_consent;
  }

  for (const field of ["main_skill", "biggest_challenge", "career_goal"]) {
    if (payload[field].length < 3) {
      invalidFields.push(field);
      message ||= FIELD_LABELS[field];
    }
  }

  return { invalidFields, message };
}

function clearInvalidFields(dom) {
  FIELD_IDS.forEach((id) => {
    const field = document.getElementById(id);
    field.removeAttribute("aria-invalid");
    if (field.getAttribute("aria-describedby") === dom.errorBox.id) {
      field.removeAttribute("aria-describedby");
    }
  });
}

function showError(dom, message, invalidFields = []) {
  dom.errorBox.textContent = message;
  dom.errorBox.classList.remove("hidden");
  dom.placeholderCard.classList.remove("hidden");

  invalidFields.forEach((id) => {
    const field = document.getElementById(id);
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", dom.errorBox.id);
  });

  if (invalidFields.length > 0) {
    document.getElementById(invalidFields[0]).focus();
  }
}

function clearError(dom) {
  dom.errorBox.textContent = "";
  dom.errorBox.classList.add("hidden");
}

function setLoadingState(dom, isLoading) {
  dom.submitBtn.disabled = isLoading;
  dom.submitBtn.textContent = isLoading
    ? "Preparando seu perfil..."
    : "Gerar meu perfil e plano de carreira";

  if (isLoading) {
    dom.placeholderCard.classList.add("hidden");
    dom.resultCard.classList.add("hidden");
    dom.loadingCard.classList.remove("hidden");
  } else {
    dom.loadingCard.classList.add("hidden");
  }
}

function mapValidationErrors(detail) {
  const invalidFields = new Set();
  const messages = new Set();

  detail.filter((item) => item && typeof item === "object").forEach((item) => {
    const field = Array.isArray(item.loc)
      ? item.loc.find((part) => FIELD_IDS.includes(part))
      : null;
    if (!field) return;

    invalidFields.add(field);
    if (item.type === "string_too_long" && FIELD_LIMITS[field]) {
      messages.add(`Use até ${FIELD_LIMITS[field]} caracteres neste campo.`);
    } else {
      messages.add(FIELD_LABELS[field]);
    }
  });

  return {
    invalidFields: [...invalidFields],
    message: messages.size > 0
      ? [...messages].join(" ")
      : "Confira as informações e tente novamente.",
  };
}

async function requestHeroMatch(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MIN_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/v1/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.status === 429) {
        throw new Error("Você atingiu o limite de consultas. Aguarde alguns instantes e tente novamente.");
      }
      throw new Error(STARTUP_ERROR);
    }

    if (response.status === 429) {
      const message = typeof data?.detail === "string"
        ? data.detail
        : "Você atingiu o limite de consultas. Aguarde alguns instantes e tente novamente.";
      throw new Error(message);
    }

    if (response.status === 422) {
      throw Object.assign(new Error(), {
        validation: mapValidationErrors(Array.isArray(data?.detail) ? data.detail : []),
      });
    }

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível concluir a análise no momento. Tente novamente.",
      );
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error(STARTUP_ERROR);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("A conexão demorou mais que o esperado. Tente novamente.");
    }
    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function renderHeroMatch(dom, data) {
  dom.heroImage.src = HERO_IMAGE_PATHS[data.hero_key] || HERO_IMAGE_PATHS.IRON_MAN;
  dom.heroImage.alt = `Emblema original do perfil ${String(data.hero_name ?? "")}`;
  dom.heroName.textContent = String(data.hero_name ?? "");
  dom.heroName.setAttribute("tabindex", "-1");
  dom.alterEgo.textContent = String(data.alter_ego ?? "");
  dom.compatibilityBadge.textContent = `${String(data.compatibility_score ?? "")}% DE AFINIDADE`;
  dom.analysisSourceBadge.textContent = data.analysis_source === "ia"
    ? "Análise por IA"
    : "Análise por regras (modo offline)";
  dom.traitAnalysis.textContent = String(data.trait_analysis ?? "");
  dom.careerAdvice.textContent = String(data.career_advice ?? "");
  dom.nextStep.textContent = String(data.recommended_next_step ?? "");
  dom.privacyNotice.textContent = String(data.privacy_notice ?? "");

  dom.placeholderCard.classList.add("hidden");
  dom.resultCard.classList.remove("hidden");
  dom.heroName.focus();
}

function triggerComicClickEffect(dom) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const words = ["AVANTE", "IMPACTO", "VISÃO", "AÇÃO", "SUCESSO"];
  const chosen = words[Math.floor(Math.random() * words.length)];

  dom.submitBtn.classList.add("btn-clicked");
  window.setTimeout(() => dom.submitBtn.classList.remove("btn-clicked"), 360);

  dom.comicFxOverlay.textContent = "";
  const burst = document.createElement("div");
  burst.className = "comic-burst-word";
  burst.textContent = chosen;
  dom.comicFxOverlay.appendChild(burst);
  dom.comicFxOverlay.classList.remove("hidden");

  window.setTimeout(() => dom.comicFxOverlay.classList.add("hidden"), 550);
}

function setReadingMode(dom, isEnabled) {
  document.body.classList.toggle("reading-contrast-mode", isEnabled);
  dom.btnContrast.setAttribute("aria-pressed", String(isEnabled));
  dom.btnContrast.textContent = isEnabled ? "Modo HQ" : "Modo de leitura";
}

function initReadingMode(dom) {
  try {
    setReadingMode(dom, window.sessionStorage.getItem("ucm-reading-mode") === "true");
  } catch (error) {
    console.warn("Não foi possível recuperar a preferência do Modo Leitura.", error);
    setReadingMode(dom, false);
  }

  dom.btnContrast.addEventListener("click", () => {
    const isEnabled = !document.body.classList.contains("reading-contrast-mode");
    setReadingMode(dom, isEnabled);

    try {
      window.sessionStorage.setItem("ucm-reading-mode", String(isEnabled));
    } catch (error) {
      console.warn("Não foi possível salvar a preferência do Modo Leitura.", error);
    }
  });
}

function initApp(dom) {
  let isSubmitting = false;

  initReadingMode(dom);
  renderRandomCharacterRoster(dom);
  renderHqWall(dom);

  dom.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    isSubmitting = true;
    clearError(dom);
    clearInvalidFields(dom);
    triggerComicClickEffect(dom);

    let isLoading = false;
    try {
      const payload = getFormPayload(dom);
      const validation = validatePayload(payload);
      if (validation.message) {
        showError(dom, validation.message, validation.invalidFields);
        return;
      }

      isLoading = true;
      setLoadingState(dom, true);
      const [matchResult] = await Promise.all([
        requestHeroMatch(payload),
        new Promise((resolve) => window.setTimeout(resolve, 650)),
      ]);
      renderHeroMatch(dom, matchResult);
    } catch (error) {
      if (error.validation) {
        showError(dom, error.validation.message, error.validation.invalidFields);
      } else {
        showError(dom, error.message || "Não foi possível concluir a análise. Tente novamente.");
      }
    } finally {
      if (isLoading) setLoadingState(dom, false);
      isSubmitting = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const dom = getDomElements();
  if (dom) initApp(dom);
});
