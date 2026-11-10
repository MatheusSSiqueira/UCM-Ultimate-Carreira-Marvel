const DOM = {
  form: document.getElementById("careerForm"),
  submitBtn: document.getElementById("submitBtn"),
  errorBox: document.getElementById("errorBox"),
  placeholderCard: document.getElementById("placeholderCard"),
  resultCard: document.getElementById("resultCard"),
  heroImage: document.getElementById("heroImage"),
  heroName: document.getElementById("heroName"),
  alterEgo: document.getElementById("alterEgo"),
  compatibilityBadge: document.getElementById("compatibilityBadge"),
  imageAttribution: document.getElementById("imageAttribution"),
  traitAnalysis: document.getElementById("traitAnalysis"),
  careerAdvice: document.getElementById("careerAdvice"),
  nextStep: document.getElementById("nextStep"),
  privacyNotice: document.getElementById("privacyNotice"),
};

function getFormPayload() {
  return {
    work_style: document.getElementById("work_style").value,
    main_skill: document.getElementById("main_skill").value.trim(),
    biggest_challenge: document.getElementById("biggest_challenge").value.trim(),
    career_goal: document.getElementById("career_goal").value.trim(),
    lgpd_consent: document.getElementById("lgpd_consent").checked,
  };
}

function validatePayload(payload) {
  if (!payload.lgpd_consent) {
    throw new Error("Você precisa aceitar o termo de uso consciente de dados (LGPD) para continuar.");
  }
  if (
    payload.main_skill.length < 3 ||
    payload.biggest_challenge.length < 3 ||
    payload.career_goal.length < 3
  ) {
    throw new Error("Preencha todos os campos com pelo menos 3 caracteres.");
  }
}

function setLoadingState(isLoading) {
  DOM.submitBtn.disabled = isLoading;
  DOM.submitBtn.textContent = isLoading
    ? "Processando com IA..."
    : "Analisar Perfil Profissional";
}

function showError(message) {
  DOM.errorBox.textContent = message;
  DOM.errorBox.classList.remove("hidden");
}

function clearError() {
  DOM.errorBox.textContent = "";
  DOM.errorBox.classList.add("hidden");
}

// Usa apenas textContent em vez de innerHTML para evitar XSS baseado no DOM
function renderHeroMatch(data) {
  DOM.heroImage.src = data.image_url;
  DOM.heroName.textContent = data.hero_name;
  DOM.alterEgo.textContent = data.alter_ego;
  DOM.compatibilityBadge.textContent = `${data.compatibility_score}% Match`;
  DOM.imageAttribution.textContent = data.image_attribution;
  DOM.traitAnalysis.textContent = data.trait_analysis;
  DOM.careerAdvice.textContent = data.career_advice;
  DOM.nextStep.textContent = data.recommended_next_step;
  DOM.privacyNotice.textContent = data.privacy_notice;

  DOM.placeholderCard.classList.add("hidden");
  DOM.resultCard.classList.remove("hidden");
}

async function requestHeroMatch(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

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
        : data.detail || "Falha ao processar sua análise.";
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("A análise demorou mais que o esperado. Tente novamente.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  clearError();

  try {
    const payload = getFormPayload();
    validatePayload(payload);
    setLoadingState(true);

    const matchResult = await requestHeroMatch(payload);
    renderHeroMatch(matchResult);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoadingState(false);
  }
}

DOM.form.addEventListener("submit", handleFormSubmit);