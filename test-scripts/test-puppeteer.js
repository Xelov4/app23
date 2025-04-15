const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('Starting Puppeteer test...');
  
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log('Browser launched successfully');
    console.log('Creating new page...');
    
    const page = await browser.newPage();
    console.log('Page created successfully');
    
    console.log('Navigating to example.com...');
    await page.goto('https://example.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('Navigation successful');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Closing browser...');
    await browser.close();
    console.log('Browser closed successfully');
    
    return { success: true, message: 'Puppeteer test completed successfully' };
  } catch (error) {
    console.error('Error in Puppeteer test:', error);
    return { success: false, message: `Puppeteer test failed: ${error.message}` };
  }
}

testPuppeteer()
  .then(result => {
    console.log('Test result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 