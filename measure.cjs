const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("http://localhost:4028/", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));

  const diagnostics = await page.evaluate(() => {
    const results = {};

    // 1. Check main paddingTop vs header height
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    const headerRect = header ? header.getBoundingClientRect() : null;
    const mainStyles = main ? window.getComputedStyle(main) : null;

    results.header = {
      height: headerRect?.height,
      rect: headerRect,
    };
    results.main = {
      paddingTop: mainStyles?.paddingTop,
    };

    // 2. Check section paddings
    const sections = document.querySelectorAll("section");
    results.sections = [];
    sections.forEach((s, i) => {
      const cs = window.getComputedStyle(s);
      const rect = s.getBoundingClientRect();
      results.sections.push({
        index: i,
        id: s.id || "(none)",
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        height: rect.height,
      });
    });

    // 3. Check max-width containers
    const containers = document.querySelectorAll("[class*='max-w-[1440px]']");
    results.containerWidths = [];
    containers.forEach((c, i) => {
      const rect = c.getBoundingClientRect();
      results.containerWidths.push({ index: i, width: rect.width });
    });

    // 4. Check overlapping: elements with negative overlaps
    const allEls = document.querySelectorAll("section, header, footer, main, h1, h2, .bg-inverse-surface");
    results.overlaps = [];
    allEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Check if element is wider than viewport
      if (rect.right > window.innerWidth + 5) {
        results.overlaps.push({
          tag: el.tagName,
          class: el.className.substring(0, 80),
          right: rect.right,
          windowWidth: window.innerWidth,
        });
      }
    });

    // 5. Check for broken SVGs
    const svgs = document.querySelectorAll("svg");
    results.svgCount = svgs.length;

    // 6. Check font loading
    results.fontsLoaded = document.fonts.status;

    // 7. Check elements that have font-size 0 or display:none unexpectedly
    const badges = document.querySelectorAll('[class*="text-metric-display"]');
    results.metricBadges = [];
    badges.forEach((b) => {
      const cs = window.getComputedStyle(b);
      results.metricBadges.push({
        text: b.textContent.trim().substring(0, 20),
        fontSize: cs.fontSize,
        visible: b.offsetParent !== null,
      });
    });

    // 8. Measure h1
    const h1 = document.querySelector("h1");
    if (h1) {
      const cs = window.getComputedStyle(h1);
      results.h1 = {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        width: h1.getBoundingClientRect().width,
        textOverflow: h1.scrollWidth > h1.clientWidth,
      };
    }

    // 9. Full page dimensions
    results.page = {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth,
    };

    return results;
  });

  console.log(JSON.stringify(diagnostics, null, 2));

  await browser.close();
})();
