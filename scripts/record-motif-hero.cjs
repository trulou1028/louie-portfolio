/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Records the homepage hero loop from the live Motif studio (Plan 048).
 * Every frame is the real site; nothing is redrawn.
 *
 *   node scripts/record-motif-hero.cjs [url] [outDir]
 *
 * Writes JPEG frames plus an ffmpeg concat list to outDir/frames. Then keep
 * two parts of each frame, the "What are you building?" block and the app's
 * settings area, and place them as two cards on scripts/motif-hero/backdrop.html
 * (rendered to bg.png at 1600x1000). With an ffmpeg that has libx264 and
 * libvpx-vp9 (for example the `ffmpeg-static` npm package), from outDir:
 *
 *   ffmpeg -loop 1 -i bg.png -f concat -safe 0 -i frames/list.txt -filter_complex "[1:v]fps=30,split[a][b];[a]crop=412:240:172:150,scale=494:288:flags=lanczos,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1\,min(min(X\,W-1-X)\,min(Y\,H-1-Y))/18)'[ca];[b]crop=700:554:856:82,scale=840:665:flags=lanczos[cb];[0:v][ca]overlay=85:356:shortest=1[t];[t][cb]overlay=679:167,format=yuv420p" -c:v libx264 -crf 14 raw.mp4
 *   # Crossfade the tail into the head (X = 0.6s, L = raw length) so it loops seamlessly:
 *   ffmpeg -i raw.mp4 -filter_complex "[0]split[a][b];[a]trim=0:X,setpts=PTS-STARTPTS[h];[b]trim=X,setpts=PTS-STARTPTS[t];[t][h]xfade=transition=fade:duration=X:offset=L-2X" -an -c:v libx264 -profile:v high -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart hero-loop.mp4
 *   ffmpeg -i hero-loop.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 hero-loop.webm
 *   ffmpeg -i hero-loop.mp4 -frames:v 1 -q:v 3 hero-loop-poster.jpg
 *
 * The crop coordinates assume the 1600x1000 viewport and 1.3 pinch zoom
 * below; check them against frames/f00000.jpg after any site change.
 *
 * Copy the three outputs to public/work/motif/.
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

const url = process.argv[2] ?? "https://motif-ui-kappa.vercel.app/";
const outDir = path.resolve(process.argv[3] ?? "motif-hero-recording");

/**
 * The sequence (Plan 050): one choice at a time, held long enough to see the
 * app replay. Work tools (snappy), Kids & games (bouncy), Banking & health
 * (calm), then back to Work tools so the loop closes. Nothing else moves.
 */
async function choreography(p, studio) {
  const wait = (ms) => p.waitForTimeout(ms);
  // Pinch zoom (below) shifts pointer coordinates, so click in the page.
  const pick = (name) => studio.getByRole("radio", { name, exact: true }).evaluate((el) => el.click());
  await wait(1800);
  await pick("Kids & games");
  await wait(3600);
  await pick("Banking & health");
  await wait(3600);
  await pick("Work tools");
  await wait(3200);
}

(async () => {
  const frameDir = path.join(outDir, "frames");
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const browser = await chromium.launch();
  // 16:10. The screencast captures at 1x, so the studio is magnified with
  // pinch zoom (pageScaleFactor), which keeps the layout and stays sharp.
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  // Let the first-load tour finish, then open Settings, the view the loop shows.
  await page.waitForTimeout(14000);
  const studio = page.locator("section", { has: page.locator("#feel-title") }).first();
  await studio.getByRole("button", { name: "Settings", exact: true }).click();
  await page.addStyleTag({ content: "header{display:none!important}" });
  const panel = page.locator("#feel-title").locator("xpath=ancestor::*[contains(@class,'rounded')][1]");
  const top = await panel.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, top - 16));
  await page.mouse.move(2, 2);
  await page.waitForTimeout(1500);

  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1.3 });
  await page.waitForTimeout(600);
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
