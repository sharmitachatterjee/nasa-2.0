// Then and Now Comparison Slider Interactive Logic
(function () {
  const COMPARISONS = {
    oppy: {
      title: "Mars Exploration Rover Opportunity (MER-B)",
      subtitle: "Eagle Crater Landing vs. 5,000 Sols of Martian Dust Storms",
      thenLabel: "THEN (Sol 1 · 2004)",
      nowLabel: "NOW (Sol 5,000 · 2018)",
      thenImg: "https://images-assets.nasa.gov/image/PIA05145/PIA05145~medium.jpg",
      nowImg: "https://images-assets.nasa.gov/image/PIA18613/PIA18613~medium.jpg",
      story: "When Opportunity rolled off the lander in Eagle Crater on January 25, 2004, its triple-junction gallium arsenide solar panels produced over 900 watt-hours per sol. Designed for a 90-sol warranty, Oppy persevered for over 14 Earth years. By 2018, martian dust coated the arrays, dropping power output until the historic global dust storm plunged Endeavour Crater into darkness."
    },
    apollo: {
      title: "Apollo 15 Lunar Roving Vehicle (LRV-001)",
      subtitle: "Hadley Rille Traverse (1971) vs. Lunar Reconnaissance Orbiter (2020)",
      thenLabel: "THEN (Apollo 15 · 1971)",
      nowLabel: "NOW (LRO Orbit · 2020)",
      thenImg: "https://images-assets.nasa.gov/image/AS15-88-11901/AS15-88-11901~medium.jpg",
      nowImg: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001712/GSFC_20171208_Archive_e001712~medium.jpg",
      story: "In August 1971, Dave Scott and Jim Irwin drove the first car on another world across 17.3 miles of the Moon. Because the Moon has no atmosphere, liquid water, or volcanic activity, the LRV parked at Hadley Rille remains in an immaculate state of preservation. Recent orbital imagery from NASA's Lunar Reconnaissance Orbiter still resolves the rover and the astronauts' dual wheel tracks."
    },
    jezero: {
      title: "Mars: Ancient Water Lakebed vs. Red Desert",
      subtitle: "3.5 Billion Years Ago vs. Barren Craters Today",
      thenLabel: "THEN (Ancient Mars · 3.5B YA)",
      nowLabel: "NOW (Barren Crater · Present)",
      thenImg: "https://images-assets.nasa.gov/image/PIA24424/PIA24424~medium.jpg",
      nowImg: "https://images-assets.nasa.gov/image/PIA24419/PIA24419~medium.jpg",
      story: "Billions of years ago, Jezero and Gale craters were filled with deep, flowing liquid water fed by rich river deltas. Today, they are arid, wind-swept basins of rusty perchlorates and sedimentary rocks. By examining the layering and mineral veins left behind, rovers have proven that Mars once possessed all the chemical ingredients for microbial life."
    },
    golden_record: {
      title: "Voyager 1 Golden Record",
      subtitle: "Pristine Gold Phonograph (1977) vs. Interstellar Flight (Present)",
      thenLabel: "THEN (Cleanroom · 1977)",
      nowLabel: "NOW (Interstellar Medium)",
      thenImg: "https://images-assets.nasa.gov/image/PIA01977/PIA01977~medium.jpg",
      nowImg: "https://images-assets.nasa.gov/image/PIA17049/PIA17049~medium.jpg",
      story: "Before launch in 1977, the Golden Record was mounted to Voyager 1's chassis: a gold-plated copper phonograph disc protected by an aluminum cover containing instructions written in atomic constants. Today, Voyager 1 is over 24 billion kilometers out in the interstellar medium—where the record will outlive our Sun and humanity itself."
    },
    enceladus: {
      title: "Saturn's Moon Enceladus",
      subtitle: "Featureless Ice Ball vs. Active Hydrothermal Geysers",
      thenLabel: "THEN (Voyager Flyby · 1980)",
      nowLabel: "NOW (Cassini Plumes · 2015)",
      thenImg: "https://images-assets.nasa.gov/image/PIA01391/PIA01391~medium.jpg",
      nowImg: "https://images-assets.nasa.gov/image/PIA17183/PIA17183~medium.jpg",
      story: "Voyager 1 viewed Enceladus as a quiet, reflective ball of ice. In 2005, Cassini flew close to the south pole and discovered towering geysers venting water vapor, simple organics, and silica nanoparticles into space. Cassini proved Enceladus harbors a warm, global subsurface ocean with hydrothermal vents—one of the best places to look for extraterrestrial life."
    }
  };

  let currentKey = "oppy";
  let sliderPos = 50; // percentage

  const sliderFrame = document.getElementById("sliderFrame");
  const imgThen = document.getElementById("sliderImgThen");
  const imgNow = document.getElementById("sliderImgNow");
  const divider = document.getElementById("sliderDivider");
  const handle = document.getElementById("sliderHandle");
  const badgeThen = document.getElementById("badgeThen");
  const badgeNow = document.getElementById("badgeNow");
  const storyTitle = document.getElementById("sliderStoryTitle");
  const storySubtitle = document.getElementById("sliderStorySubtitle");
  const storyText = document.getElementById("sliderStoryText");
  const pillBtns = document.querySelectorAll("[data-comp]");

  function setComparison(key) {
    if (!COMPARISONS[key]) return;
    currentKey = key;
    const item = COMPARISONS[key];

    pillBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.comp === key);
    });

    if (imgThen) imgThen.src = item.thenImg;
    if (imgNow) imgNow.src = item.nowImg;
    if (badgeThen) badgeThen.textContent = item.thenLabel;
    if (badgeNow) badgeNow.textContent = item.nowLabel;
    if (storyTitle) storyTitle.textContent = item.title;
    if (storySubtitle) storySubtitle.textContent = item.subtitle;
    if (storyText) storyText.textContent = item.story;

    updateSlider(50);
  }

  function updateSlider(percentage) {
    sliderPos = Math.max(0, Math.min(100, percentage));
    if (imgNow) {
      imgNow.style.clipPath = `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`;
    }
    if (divider) divider.style.left = `${sliderPos}%`;
    if (handle) handle.style.left = `${sliderPos}%`;
  }

  function handleMove(e) {
    if (!sliderFrame) return;
    const rect = sliderFrame.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const pct = (offsetX / rect.width) * 100;
    updateSlider(pct);
  }

  function init() {
    pillBtns.forEach((btn) => {
      btn.addEventListener("click", () => setComparison(btn.dataset.comp));
    });

    if (sliderFrame) {
      let isDragging = false;

      sliderFrame.addEventListener("mousedown", (e) => {
        isDragging = true;
        handleMove(e);
      });

      window.addEventListener("mousemove", (e) => {
        if (isDragging) handleMove(e);
      });

      window.addEventListener("mouseup", () => {
        isDragging = false;
      });

      sliderFrame.addEventListener("touchstart", (e) => {
        isDragging = true;
        handleMove(e);
      }, { passive: true });

      window.addEventListener("touchmove", (e) => {
        if (isDragging) handleMove(e);
      }, { passive: true });

      window.addEventListener("touchend", () => {
        isDragging = false;
      });

      // Keyboard navigation
      sliderFrame.setAttribute("tabindex", "0");
      sliderFrame.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          updateSlider(sliderPos - 5);
        } else if (e.key === "ArrowRight") {
          updateSlider(sliderPos + 5);
        }
      });
    }

    setComparison("oppy");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
