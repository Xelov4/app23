const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

// Simple implementation of the URL validator functionality
async function validateUrl(url, toolId) {
  console.log(`Validating URL: ${url} for tool: ${toolId}`);
  
  const prisma = new PrismaClient();
  
  // Normalize URL if necessary
  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
    console.log(`URL normalized to: ${normalizedUrl}`);
  }
  
  // Initialize browser
  console.log('Launching Puppeteer...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Puppeteer launched successfully');
  } catch (browserError) {
    console.error('Error launching Puppeteer:', browserError);
    return {
      success: false,
      error: `Error launching browser: ${browserError.message}`
    };
  }
  
  // Validation result
  const validationResult = {
    originalUrl: normalizedUrl,
    finalUrl: normalizedUrl,
    statusCode: 0,
    isRedirected: false,
    chainOfRedirects: [normalizedUrl],
    isValid: false,
    message: ""
  };
  
  try {
    // Open new page
    console.log('Opening new page...');
    const page = await browser.newPage();
    console.log('Page opened successfully');
    
    // Configure request interception to track redirects
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      request.continue();
    });
    
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      
      console.log(`Response from ${url} with status ${status}`);
      
      // Record HTTP status code
      validationResult.statusCode = status;
      
      // Handle redirect
      if (status >= 300 && status < 400) {
        validationResult.isRedirected = true;
        
        // Add redirect URL to chain
        const redirectUrl = response.headers()['location'];
        if (redirectUrl && !validationResult.chainOfRedirects.includes(redirectUrl)) {
          console.log(`Redirect detected to: ${redirectUrl}`);
          validationResult.chainOfRedirects.push(redirectUrl);
        }
      }
    });
    
    // Navigate to URL
    console.log(`Navigating to: ${normalizedUrl}`);
    await page.goto(normalizedUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    console.log('Navigation completed');
    
    // Final URL after redirects
    validationResult.finalUrl = page.url();
    console.log(`Final URL: ${validationResult.finalUrl}`);
    
    // Check if final URL is different from original
    if (validationResult.finalUrl !== normalizedUrl) {
      validationResult.isRedirected = true;
      
      // Ensure final URL is in the redirect chain
      if (!validationResult.chainOfRedirects.includes(validationResult.finalUrl)) {
        validationResult.chainOfRedirects.push(validationResult.finalUrl);
      }
    }
    
    // Verify the page is actually loaded
    try {
      const pageTitle = await page.evaluate(() => document.title);
      console.log(`Page title: ${pageTitle}`);
    } catch (evalError) {
      const errorMessage = evalError instanceof Error ? evalError.message : String(evalError);
      throw new Error(`Cannot interact with the page: ${errorMessage}`);
    }
    
    // Determine if the URL is valid
    if (validationResult.statusCode >= 200 && validationResult.statusCode < 300) {
      validationResult.isValid = true;
      validationResult.message = "The URL is valid and accessible.";
      
      if (validationResult.statusCode === 206) {
        validationResult.statusCode = 200;
        validationResult.message += " (Code 206 Partial Content treated as 200 OK)";
      }
      
      if (validationResult.isRedirected) {
        validationResult.message += ` Redirected to ${validationResult.finalUrl}`;
      }
    } else if (validationResult.statusCode >= 300 && validationResult.statusCode < 400) {
      validationResult.isValid = false;
      validationResult.message = `URL responded with redirect code ${validationResult.statusCode}, but the redirect didn't lead to a valid URL.`;
    } else if (validationResult.statusCode >= 400 && validationResult.statusCode < 500) {
      validationResult.isValid = false;
      validationResult.message = `URL responded with client error ${validationResult.statusCode}.`;
    } else if (validationResult.statusCode >= 500) {
      validationResult.isValid = false;
      validationResult.message = `URL responded with server error ${validationResult.statusCode}.`;
    } else {
      validationResult.isValid = false;
      validationResult.message = "Unable to determine URL validity.";
    }
    
    // Close page
    await page.close();
    
  } catch (error) {
    console.error('Error validating URL:', error);
    
    // Mark URL as invalid on error
    validationResult.isValid = false;
    
    // Determine error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Detect DNS and connection errors
    if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
        errorMessage.includes('DNS_PROBE') ||
        errorMessage.includes('getaddrinfo') || 
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('ERR_CONNECTION_RESET') ||
        errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
        errorMessage.includes('ERR_CONNECTION_CLOSED') ||
        errorMessage.includes('ERR_SSL_PROTOCOL_ERROR') ||
        errorMessage.includes('ERR_FAILED') ||
        errorMessage.includes('Cannot interact with the page')) {
      
      validationResult.message = `Connection error: The domain cannot be resolved or the server is not accessible (${errorMessage})`;
      validationResult.statusCode = -1; // Special code for DNS/connection errors
    } else {
      validationResult.message = `Error during validation: ${errorMessage}`;
    }
    
  } finally {
    // Close browser
    console.log('Closing browser...');
    await browser.close();
    console.log('Browser closed');
  }
  
  console.log('Validation result:', validationResult);
  
  // Update tool if toolId is provided
  if (toolId && validationResult.statusCode !== 0) {
    try {
      console.log(`Looking up tool with ID: ${toolId}`);
      const tool = await prisma.tool.findUnique({
        where: { id: toolId }
      });
      
      if (tool) {
        console.log(`Found tool: ${tool.name} (${tool.id})`);
        
        const updateData = {
          websiteUrl: validationResult.isValid && validationResult.isRedirected ? 
                       validationResult.finalUrl : tool.websiteUrl,
          httpCode: validationResult.statusCode,
          httpChain: validationResult.chainOfRedirects.join(' -> ')
        };
        
        if (!validationResult.isValid && (validationResult.statusCode >= 400 || validationResult.statusCode === -1)) {
          updateData.isActive = false;
        } else if (validationResult.isValid) {
          updateData.isActive = true;
        }
        
        console.log('Updating tool with data:', updateData);
        
        const updatedTool = await prisma.tool.update({
          where: { id: tool.id },
          data: updateData
        });
        
        console.log(`Tool updated successfully: ${updatedTool.name} (isActive: ${updatedTool.isActive})`);
        validationResult.message += ` Tool ${validationResult.isValid ? 'activated' : 'deactivated'}.`;
      } else {
        console.log(`Tool with ID ${toolId} not found`);
      }
    } catch (dbError) {
      console.error('Error updating tool:', dbError);
      validationResult.message += ` Error updating the tool in the database.`;
    } finally {
      await prisma.$disconnect();
    }
  }
  
  return {
    success: true, 
    result: validationResult
  };
}

// Test with a few URLs
async function runTests() {
  try {
    // Test with a valid URL
    console.log('\n===== Testing with valid URL: example.com =====');
    const result1 = await validateUrl('example.com', null);
    console.log('\nTest result:', result1.success ? 'SUCCESS' : 'FAILURE');
    
    // Test with an invalid/non-existent URL
    console.log('\n===== Testing with invalid URL: non-existent-domain-123456.com =====');
    const result2 = await validateUrl('non-existent-domain-123456.com', null);
    console.log('\nTest result:', result2.success ? 'SUCCESS' : 'FAILURE');
    
    console.log('\nAll tests completed');
    return true;
  } catch (error) {
    console.error('Error running tests:', error);
    return false;
  }
}

runTests()
  .then(success => {
    console.log(`\nTest suite ${success ? 'completed successfully' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 