const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,1200"],
  });

  const viewports = [
    { name: "desktop-1600", width: 1600, height: 1000 },
    { name: "desktop-1920", width: 1920, height: 1080 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:4028/", { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({
      path: `/tmp/unitrack-${vp.name}.png`,
      fullPage: true,
    });
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    console.log(
      `${vp.name}: scrollWidth=${bodyScrollWidth} clientWidth=${bodyClientWidth} overflow=${bodyScrollWidth > bodyClientWidth}`
    );
    await page.close();
  }

  await browser.close();
})();