#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 iHeardAI Widget CDN Build Script');
console.log('==================================\n');

// Configuration
const config = {
  version: '1.0.0',
  cdnUrl: 'https://cdn.iheard.ai',
  buildDir: 'dist',
  widgetFile: 'widget.js',
  minifiedFile: 'widget.min.js',
  versionFile: 'version.json',
  deploymentFile: 'deployment.json'
};

// Create build directory
function ensureBuildDir() {
  const buildPath = path.join(__dirname, '..', config.buildDir);
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true });
    console.log('✅ Created build directory:', buildPath);
  }
  return buildPath;
}

// Read and minify widget
function buildWidget() {
  console.log('📦 Building widget for CDN...');
  
  const sourcePath = path.join(__dirname, '..', 'src', 'widget.template.js');
  const buildPath = ensureBuildDir();
  
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Widget source file not found:', sourcePath);
    process.exit(1);
  }
  
  const source = fs.readFileSync(sourcePath, 'utf8');
  
  // Generate file hash for cache busting
  const hash = crypto.createHash('md5').update(source).digest('hex').substring(0, 8);
  
  // Minify the widget
  const minified = minifyCode(source);
  
  // Write minified file
  const minifiedPath = path.join(buildPath, config.minifiedFile);
  fs.writeFileSync(minifiedPath, minified);
  
  // Write versioned file
  const versionedPath = path.join(buildPath, `widget-${config.version}.min.js`);
  fs.writeFileSync(versionedPath, minified);
  
  // Write hash-versioned file
  const hashPath = path.join(buildPath, `widget-${hash}.min.js`);
  fs.writeFileSync(hashPath, minified);
  
  console.log('✅ Widget built successfully');
  console.log(`   📄 Minified: ${config.minifiedFile}`);
  console.log(`   📄 Versioned: widget-${config.version}.min.js`);
  console.log(`   📄 Hashed: widget-${hash}.min.js`);
  
  return {
    hash,
    size: Buffer.byteLength(minified, 'utf8'),
    originalSize: Buffer.byteLength(source, 'utf8')
  };
}

// Inject environment variables and minify code
function minifyCode(code) {
  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL || 'https://migtkyxdbsmtktzklouc.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3RreXhkYnNtdGt0emtsb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjkzNzMsImV4cCI6MjA2ODY0NTM3M30.Aj3Cgqsj7zBhHwdyOnDOhVPsj23ZgF4fy83zl4rjHus';
  
  // Replace placeholders with environment variables
  let processedCode = code
    .replace(/SUPABASE_URL_PLACEHOLDER/g, supabaseUrl)
    .replace(/SUPABASE_ANON_KEY_PLACEHOLDER/g, supabaseAnonKey);
  
  // Minify the processed code
  return processedCode
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around operators
    .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
    // Remove leading/trailing whitespace
    .trim();
}

// Generate version info
function generateVersionInfo(buildInfo) {
  const versionInfo = {
    version: config.version,
    buildDate: new Date().toISOString(),
    hash: buildInfo.hash,
    size: buildInfo.size,
    originalSize: buildInfo.originalSize,
    compression: Math.round((1 - buildInfo.size / buildInfo.originalSize) * 100),
    cdnUrls: {
      latest: `${config.cdnUrl}/${config.minifiedFile}`,
      versioned: `${config.cdnUrl}/widget-${config.version}.min.js`,
      hashed: `${config.cdnUrl}/widget-${buildInfo.hash}.min.js`
    }
  };
  
  const buildPath = path.join(__dirname, '..', config.buildDir);
  const versionPath = path.join(buildPath, config.versionFile);
  fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
  
  console.log('📋 Version info generated');
  return versionInfo;
}

// Generate deployment manifest
function generateDeploymentManifest(versionInfo) {
  const manifest = {
    version: config.version,
    buildDate: versionInfo.buildDate,
    files: [
      {
        name: config.minifiedFile,
        path: `/${config.minifiedFile}`,
        size: versionInfo.size,
        type: 'application/javascript',
        url: versionInfo.cdnUrls.latest
      },
      {
        name: `widget-${config.version}.min.js`,
        path: `/widget-${config.version}.min.js`,
        size: versionInfo.size,
        type: 'application/javascript',
        url: versionInfo.cdnUrls.versioned
      },
      {
        name: `widget-${versionInfo.hash}.min.js`,
        path: `/widget-${versionInfo.hash}.min.js`,
        size: versionInfo.size,
        type: 'application/javascript',
        url: versionInfo.cdnUrls.hashed
      }
    ],
    cdn: {
      provider: 'Cloudflare',
      domain: config.cdnUrl,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    },
    integration: {
      scriptTag: `<script src="${versionInfo.cdnUrls.latest}"></script>`,
      versionedScriptTag: `<script src="${versionInfo.cdnUrls.versioned}"></script>`,
      hashedScriptTag: `<script src="${versionInfo.cdnUrls.hashed}"></script>`
    }
  };
  
  const buildPath = path.join(__dirname, '..', config.buildDir);
  const manifestPath = path.join(buildPath, config.deploymentFile);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('📋 Deployment manifest generated');
  return manifest;
}

// Generate integration examples
function generateIntegrationExamples(manifest) {
  const examples = {
    basic: `<script src="${manifest.cdn.domain}/${config.minifiedFile}"></script>`,
    versioned: `<script src="${manifest.cdn.domain}/widget-${config.version}.min.js"></script>`,
    withApiKey: `<script src="${manifest.cdn.domain}/${config.minifiedFile}?apiKey=YOUR_API_KEY"></script>`,
    fullIntegration: `<script>
  (function(w,d,s,o,f,js,fjs){
    w['iHeardAIWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;
    if(fjs){fjs.parentNode.insertBefore(js,fjs);}else{d.head.appendChild(js);}
  })(window,document,'script','iHeardAI','${manifest.cdn.domain}/${config.minifiedFile}?apiKey=YOUR_API_KEY');
</script>`
  };
  
  const buildPath = path.join(__dirname, '..', config.buildDir);
  const examplesPath = path.join(buildPath, 'integration-examples.json');
  fs.writeFileSync(examplesPath, JSON.stringify(examples, null, 2));
  
  console.log('📋 Integration examples generated');
  return examples;
}

// Main build process
function main() {
  try {
    console.log('🔨 Starting widget build process...\n');
    
    // Build widget
    const buildInfo = buildWidget();
    
    // Generate version info
    const versionInfo = generateVersionInfo(buildInfo);
    
    // Generate deployment manifest
    const manifest = generateDeploymentManifest(versionInfo);
    
    // Generate integration examples
    const examples = generateIntegrationExamples(manifest);
    
    console.log('\n🎉 Build completed successfully!');
    console.log('=====================================');
    console.log(`📊 File size: ${versionInfo.size} bytes (${versionInfo.compression}% smaller)`);
    console.log(`🏷️  Version: ${config.version}`);
    console.log(`🔗 CDN URL: ${config.cdnUrl}`);
    console.log(`📅 Built: ${versionInfo.buildDate}`);
    
    console.log('\n📁 Generated files:');
    console.log(`   📄 ${config.minifiedFile} (latest version)`);
    console.log(`   📄 widget-${config.version}.min.js (versioned)`);
    console.log(`   📄 widget-${versionInfo.hash}.min.js (cache-busted)`);
    console.log(`   📄 ${config.versionFile} (version info)`);
    console.log(`   📄 ${config.deploymentFile} (deployment manifest)`);
    console.log(`   📄 integration-examples.json (usage examples)`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Upload files to your CDN (Cloudflare Pages/R2)');
    console.log('2. Test the widget from CDN');
    console.log('3. Update integration documentation');
    
    console.log('\n📋 CDN URLs:');
    console.log(`   Latest: ${versionInfo.cdnUrls.latest}`);
    console.log(`   Versioned: ${versionInfo.cdnUrls.versioned}`);
    console.log(`   Hashed: ${versionInfo.cdnUrls.hashed}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, buildWidget, generateVersionInfo }; 