const puppeteer = require('/opt/homebrew/lib/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

async function renderSlides() {
  console.log('Launching Puppeteer via pipe mode...');
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'presentation_preview.html');
  const fileUrl = `file://${htmlPath}`;
  console.log(`Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  // wait 1.5 seconds for font loading
  await new Promise(r => setTimeout(r, 1500));

  // Render individual slide screenshots
  const slides = await page.$$('.slide');
  console.log(`Found ${slides.length} slides.`);

  for (let i = 0; i < slides.length; i++) {
    const slideNumber = i + 1;
    const outputPath = path.join(__dirname, `slide_${slideNumber}.png`);
    console.log(`Capturing slide ${slideNumber} -> ${outputPath}...`);
    await slides[i].screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false,
    });
  }

  // Generate complete multi-page PDF
  const pdfPath = path.join(__dirname, 'Loreal_VeloCity_AI_Presentation.pdf');
  console.log(`Generating presentation PDF -> ${pdfPath}...`);
  await page.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    pageRanges: '1-5',
  });

  await browser.close();
  console.log('Slides and PDF successfully rendered!');
}

renderSlides().catch((err) => {
  console.error('Error rendering slides:', err);
  process.exit(1);
});

