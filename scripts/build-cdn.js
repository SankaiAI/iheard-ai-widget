#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify } = require('terser');

// Copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

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
async function buildWidget() {
  console.log('📦 Building widget for CDN...');
  
  const sourcePath = path.join(__dirname, '..', 'src', 'widget.js');
  const buildPath = ensureBuildDir();
  
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Widget source file not found:', sourcePath);
    process.exit(1);
  }
  
  const source = fs.readFileSync(sourcePath, 'utf8');
  
  // Generate file hash for cache busting
  const hash = crypto.createHash('md5').update(source).digest('hex').substring(0, 8);
  
  // Minify the widget
  const minified = await minifyCode(source);
  
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

// Minify code using Terser for proper JavaScript minification
async function minifyCode(code) {
  try {
    const result = await minify(code, {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.error']
      },
      mangle: {
        reserved: ['iHeardAIWidget'] // Don't mangle the global function name
      },
      format: {
        comments: false
      }
    });
    
    if (result.error) {
      console.error('❌ Minification error:', result.error);
      throw result.error;
    }
    
    return result.code;
  } catch (error) {
    console.error('❌ Minification failed:', error);
    // Fallback to basic minification
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
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
async function main() {
  try {
    console.log('🔨 Starting widget build process...\n');
    
    // Build widget
    const buildInfo = await buildWidget();
    
    // Generate version info
    const versionInfo = generateVersionInfo(buildInfo);
    
    // Generate deployment manifest
    const manifest = generateDeploymentManifest(versionInfo);
    
    // Generate integration examples
    const examples = generateIntegrationExamples(manifest);
    
    // Copy functions directory for Cloudflare Pages
    const functionsSrc = path.join(__dirname, '..', 'functions');
    const functionsDest = path.join(__dirname, '..', config.buildDir, 'functions');
    if (fs.existsSync(functionsSrc)) {
      copyDirectory(functionsSrc, functionsDest);
      console.log('📁 Functions directory copied for Cloudflare Pages');
    }
    
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