/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Re-records the homepage hero loop from the live Neuron Shift prototype
 * (Plan 041). Every frame is the real app; nothing is redrawn.
 *
 *   node scripts/record-neuron-hero.cjs [url] [outDir]
 *
 * Writes JPEG frames plus an ffmpeg concat list to outDir/frames. Then encode
 * with an ffmpeg build that has libx264 and libvpx-vp9 (for example the
 * `ffmpeg-static` npm package), from outDir:
 *
 *   ffmpeg -f concat -safe 0 -i frames/list.txt -vf "fps=30,scale=1600:1000:flags=lanczos,format=yuv420p" -c:v libx264 -crf 14 raw.mp4
 *   # Crossfade the tail into the head (X = 0.8s, L = raw length) so it loops seamlessly:
 *   ffmpeg -i raw.mp4 -filter_complex "[0]split[a][b];[a]trim=0:X,setpts=PTS-STARTPTS[h];[b]trim=X,setpts=PTS-STARTPTS[t];[t][h]xfade=transition=fade:duration=X:offset=L-2X" -c:v libx264 -crf 14 loop.mp4
 *   # Rotate so the loop opens on the traced power path (S = 2.4s), then encode for the web:
 *   ffmpeg -i loop.mp4 -filter_complex "[0]split[a][b];[a]trim=S,setpts=PTS-STARTPTS[x];[b]trim=0:S,setpts=PTS-STARTPTS[y];[x][y]concat=n=2:v=1[v]" -map "[v]" -an -c:v libx264 -profile:v high -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart hero-loop.mp4
 *   ffmpeg -i hero-loop.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 hero-loop.webm
 *   ffmpeg -i hero-loop.mp4 -frames:v 1 -q:v 3 hero-loop-poster.jpg
 *
 * Copy the three outputs to public/work/neuron-shift/.
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

const url = process.argv[2] ?? "https://neuron-shift.vercel.app/";
const outDir = path.resolve(process.argv[3] ?? "neuron-hero-recording");

/** The sequence: take the shift, trace the path, preview two failures, approve. */
async function choreography(p) {
  const wait = (ms) => p.waitForTimeout(ms);
  await wait(1400);
  await p.getByRole("button", { name: /Start shift/ }).click();
  await wait(2600);
  await p.getByRole("button", { name: /Trace affected power path/ }).click();
  await wait(2200);
  await p.locator('[data-tour="tab-impact"]').click();
  await wait(2000);
  await p.locator('.react-flow__node[data-id="pdu"]').click();
  await wait(2400);
  await p.locator('.react-flow__node[data-id="ups-a"]').click();
  await wait(600);
  await p.locator('[data-tour="review-decide"]').click();
  await wait(1200);
  const dialog = p.getByRole("dialog");
  await dialog.getByRole("group", { name: "Your decision" }).getByRole("button", { name: /^Approve$/ }).click();
  await wait(700);
  for (const box of await dialog.getByRole("checkbox").all()) {
    await box.check();
    await wait(260);
  }
  const input = dialog.getByRole("textbox").first();
  await input.click();
  await input.pressSequentially("UPS-A1", { delay: 110 });
  await wait(700);
  await dialog.getByRole("button", { name: /Record/ }).click();
  await wait(2600);
}

(async () => {
  const frameDir = path.join(outDir, "frames");
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  // Skip the first-visit guided tour.
  await context.addInitScript(() => localStorage.setItem("neuron-shift:tour:v1", "seen"));
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (frame) => {
    frames.push({ t: frame.metadata.timestamp, data: frame.data });
    await cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 2880, maxHeight: 1800 });
  await choreography(page);
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
