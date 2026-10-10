/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Records the homepage hero loop from the live Motif studio (Plan 048).
 * Every frame is the real site; nothing is redrawn.
 *
 *   node scripts/record-motif-hero.cjs [url] [outDir]
 *
 * Writes JPEG frames plus an ffmpeg concat list to outDir/frames. The crop
 * keeps the studio and drops the page margin around it. Encode as in
 * scripts/record-neuron-hero.cjs (an ffmpeg with libx264 and libvpx-vp9, for
 * example the `ffmpeg-static` npm package), from outDir:
 *
 *   ffmpeg -f concat -safe 0 -i frames/list.txt -vf "fps=30,crop=1376:948:112:14,scale=1600:1102:flags=lanczos,format=yuv420p" -c:v libx264 -crf 14 raw.mp4
 *   # Crossfade the tail into the head (X = 0.6s, L = raw length) so it loops seamlessly:
 *   ffmpeg -i raw.mp4 -filter_complex "[0]split[a][b];[a]trim=0:X,setpts=PTS-STARTPTS[h];[b]trim=X,setpts=PTS-STARTPTS[t];[t][h]xfade=transition=fade:duration=X:offset=L-2X" -an -c:v libx264 -profile:v high -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart hero-loop.mp4
 *   ffmpeg -i hero-loop.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 hero-loop.webm
 *   ffmpeg -i hero-loop.mp4 -frames:v 1 -q:v 3 hero-loop-poster.jpg
 *
 * Copy the three outputs to public/work/motif/.
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

const url = process.argv[2] ?? "https://motif-ui-kappa.vercel.app/";
const outDir = path.resolve(process.argv[3] ?? "motif-hero-recording");

/**
 * The sequence: change the kind of product three times, so the same app
 * replays as Kids & games (bouncy), Banking & health (calm), and a shuffled
 * style; open a menu and flip a switch between them; end on Work tools, the
 * opening feel, so the loop closes.
 */
async function choreography(p, studio) {
  const wait = (ms) => p.waitForTimeout(ms);
  const pick = (name) => studio.getByRole("radio", { name, exact: true }).click();
  await wait(900);
  await pick("Kids & games");
  await wait(3200);
  await studio.getByRole("button", { name: "Options" }).click();
  await wait(1300);
  await p.keyboard.press("Escape");
  await wait(700);
  await pick("Banking & health");
  await wait(3200);
  const alerts = studio.getByRole("switch").nth(1);
  await alerts.click();
  await wait(1100);
  await studio.getByRole("button", { name: "Shuffle" }).click();
  await wait(3200);
  await alerts.click();
  await wait(600);
  await pick("Work tools");
  await wait(3000);
}

(async () => {
  const frameDir = path.join(outDir, "frames");
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const browser = await chromium.launch();
  // 16:10, the hero frame's shape. At this width the studio fits on screen.
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  // Let the first-load tour finish, then open Settings, the view the loop shows.
  await page.waitForTimeout(14000);
  const studio = page.locator("section", { has: page.locator("#feel-title") }).first();
  await studio.getByRole("button", { name: "Settings", exact: true }).click();
  await page.addStyleTag({ content: "header{display:none!important}" });
  const panel = page.locator("#feel-title").locator("xpath=ancestor::*[contains(@class,'rounded')][1]");
  const top = await panel.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, top - 22));
  await page.mouse.move(2, 2);
  await page.waitForTimeout(2000);

  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (frame) => {
    frames.push({ t: frame.metadata.timestamp, data: frame.data });
    await cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 3200, maxHeight: 2000 });
  await choreography(page, studio);
  await cdp.send("Page.stopScreencast");
  await browser.close();

  let list = "";
  frames.forEach((frame, i) => {
    const file = `f${String(i).padStart(5, "0")}.jpg`;
    fs.writeFileSync(path.join(frameDir, file), Buffer.from(frame.data, "base64"));
    const next = frames[i + 1];
    list += `file '${file}'\nduration ${(next ? next.t - frame.t : 0.5).toFixed(4)}\n`;
  });
  list += `file 'f${String(frames.length - 1).padStart(5, "0")}.jpg'\n`;
  fs.writeFileSync(path.join(frameDir, "list.txt"), list);
  console.log(`${frames.length} frames written to ${frameDir}`);
})();
