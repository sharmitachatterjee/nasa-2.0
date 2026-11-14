const storyList = document.querySelector("[data-story-list]");
const storyName = document.querySelector("[data-story-name]");
const storyProse = document.querySelector("[data-story-prose]");
const storyAccessible = document.querySelector("[data-story-accessible]");
const storyCursor = document.querySelector("[data-story-cursor]");
const storyProgress = document.querySelector("[data-story-progress]");
const typewriterButton = document.querySelector("[data-typewriter]");
const storyFigure = document.querySelector("[data-story-figure]");
const storyImage = document.querySelector("[data-story-image]");
const storyImageLink = document.querySelector("[data-story-image-link]");
const storyImageCatalog = document.querySelector("[data-story-image-catalog]");
const storyImageCredit = document.querySelector("[data-story-image-credit]");
const storyImageFallback = document.querySelector("[data-story-image-fallback]");

let stories = [];
let currentStory;
let typingTimer;
let typingToken = 0;
let imageToken = 0;
let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function finishTyping(token = typingToken) {
  if (token !== typingToken || !currentStory) return;
  window.clearTimeout(typingTimer);
  const paragraphs = [...storyProse.querySelectorAll("p")];
  currentStory.paragraphs.forEach((text, index) => {
    paragraphs[index].textContent = text;
  });
  storyCursor.hidden = true;
  typewriterButton.textContent = "Read again";
  storyProgress.textContent = "Transmission complete";
}

function beginTyping() {
  typingToken += 1;
  const token = typingToken;
  window.clearTimeout(typingTimer);

  storyProse.replaceChildren();
  currentStory.paragraphs.forEach(() => {
    const paragraph = document.createElement("p");
    storyProse.append(paragraph);
  });

  if (prefersReducedMotion.matches) {
    finishTyping(token);
    return;
  }

  typewriterButton.textContent = "Skip the typewriter";
  storyProgress.textContent = "Receiving transmission…";
  storyCursor.hidden = false;
  let paragraphIndex = 0;
  let characterIndex = 0;
  const paragraphs = [...storyProse.querySelectorAll("p")];
  const characters = currentStory.paragraphs.map((text) => Array.from(text));

  function typeNextCharacter() {
    if (token !== typingToken) return;
    while (
      paragraphIndex < characters.length &&
      characterIndex >= characters[paragraphIndex].length
    ) {
      paragraphIndex += 1;
      characterIndex = 0;
    }

    if (paragraphIndex >= characters.length) {
      finishTyping(token);
      return;
    }

    paragraphs[paragraphIndex].textContent += characters[paragraphIndex][characterIndex];
    characterIndex += 1;
    typingTimer = window.setTimeout(typeNextCharacter, 17);
  }

  typeNextCharacter();
}

function createStoryChoice(story, index) {
  const button = document.createElement("button");
  button.className = "story-choice";
  button.type = "button";
  button.dataset.storyId = story.id;
  button.setAttribute("aria-pressed", "false");

  const number = document.createElement("span");
  number.className = "story-choice-number";
  number.textContent = String(index + 1).padStart(2, "0");

  const copy = document.createElement("span");
  copy.className = "story-choice-copy";
  const name = document.createElement("span");
  name.className = "story-choice-name";
  name.textContent = story.name;
  const meta = document.createElement("span");
  meta.className = "story-choice-meta";
  meta.textContent = story.type;
  const image = document.createElement("img");
  image.className = "story-choice-image";
  image.src = story.image.url;
  image.alt = "";
  image.loading = "lazy";
  image.setAttribute("aria-hidden", "true");
  image.addEventListener("error", () => {
    image.hidden = true;
  });
  copy.append(name, meta);
  button.append(number, image, copy);
  button.addEventListener("click", () => selectStory(story.id, true));
  return button;
}

function selectStory(storyId, updateUrl) {
  const story = stories.find((item) => item.id === storyId);
  if (!story) return;
  currentStory = story;
  document.querySelector("[data-story-era]").textContent =
    `FIELD NOTE ${String(stories.indexOf(story) + 1).padStart(2, "0")} · ${story.era}`;
  document.querySelector("[data-story-location]").textContent = story.location;
  storyName.textContent = story.name;
  document.querySelector("[data-story-subtitle]").textContent = story.subtitle;
  storyAccessible.textContent = story.paragraphs.join("\n\n");

  const source = document.querySelector("[data-story-source]");
  source.href = story.sourceUrl;
  source.textContent = `Read ${story.sourceLabel} ↗`;

  storyFigure.hidden = false;
  storyImage.hidden = false;
  storyImageFallback.hidden = true;
  storyImage.alt = story.image.alt;
  imageToken += 1;
  const selectedImageToken = imageToken;
  storyImage.onload = () => {
    if (selectedImageToken !== imageToken) return;
    storyImage.hidden = false;
    storyImageFallback.hidden = true;
  };
  storyImage.onerror = () => {
    if (selectedImageToken !== imageToken) return;
    storyImage.hidden = true;
    storyImageFallback.hidden = false;
  };
  storyImageLink.href = story.image.catalogUrl;
  storyImageCatalog.href = story.image.catalogUrl;
  storyImageCatalog.textContent = story.image.title;
  storyImageCredit.textContent = story.image.credit;
  storyImage.src = story.image.url;

  storyList.querySelectorAll("[data-story-id]").forEach((button) => {
    const selected = button.dataset.storyId === story.id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  if (updateUrl) {
    history.replaceState(null, "", `?story=${encodeURIComponent(story.id)}`);
  }
  beginTyping();
}

async function start() {
  typewriterButton.addEventListener("click", () => {
    if (typewriterButton.textContent === "Skip the typewriter") {
      finishTyping();
    } else {
      beginTyping();
    }
  });

  prefersReducedMotion.addEventListener("change", (event) => {
    if (event.matches && currentStory) finishTyping();
  });

  try {
    const response = await fetch("data/stories.json");
    if (!response.ok) {
      throw new Error(`Could not load mission stories (${response.status}).`);
    }
    stories = await response.json();
    if (!Array.isArray(stories) || stories.length !== 6) {
      throw new Error("The mission story archive is incomplete.");
    }

    stories.forEach((story, index) => storyList.append(createStoryChoice(story, index)));
    document.querySelector("[data-story-count]").textContent =
      `${stories.length} STORIES`;
    const requestedStory = new URLSearchParams(window.location.search).get("story");
    const initialStory = stories.some((story) => story.id === requestedStory)
      ? requestedStory
      : stories[0].id;
    selectStory(initialStory, false);
  } catch (error) {
    console.error("Mission stories could not be loaded:", error);
    storyName.textContent = "The archive is unavailable";
    storyProgress.textContent =
      error instanceof Error ? error.message : "Please reload to try again.";
    typewriterButton.disabled = true;
  }
}

start();