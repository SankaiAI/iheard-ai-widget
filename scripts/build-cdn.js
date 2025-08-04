#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify } = require('terser');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Only set if not already set in process.env
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
    console.log('✅ Environment variables loaded from .env file');
  } else {
    console.log('ℹ️ No .env file found, using system environment variables');
  }
}

// Load .env file at startup
loadEnvFile();

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

// Inject environment variables into the widget source
function injectEnvironmentVariables(source) {
  console.log('🔧 Injecting environment variables...');
  
  // Get environment variables - try multiple naming conventions
  const TEXT_AGENT_URL = process.env.TEXT_AGENT_URL || process.env.IHEARD_TEXT_AGENT_URL;
  const VOICE_AGENT_URL = process.env.VOICE_AGENT_URL || process.env.IHEARD_VOICE_AGENT_URL;
  const WIDGET_URL = process.env.WIDGET_URL || process.env.IHEARD_WIDGET_URL;
  const NODE_ENV = process.env.NODE_ENV || 'production';
  
  // Create the environment variables injection
  let envInjection = '// Environment variables injected at build time\n';
  envInjection += `// Build Date: ${new Date().toISOString()}\n`;
  envInjection += `// Environment: ${NODE_ENV}\n`;
  envInjection += '\n';
  
  if (TEXT_AGENT_URL) {
    envInjection += `window.IHEARD_TEXT_AGENT_URL = '${TEXT_AGENT_URL}';\n`;
    console.log('✅ Injecting TEXT_AGENT_URL:', TEXT_AGENT_URL);
  } else {
    console.log('⚠️ No TEXT_AGENT_URL found - widget will use auto-detection fallback');
  }
  
  if (VOICE_AGENT_URL) {
    envInjection += `window.IHEARD_VOICE_AGENT_URL = '${VOICE_AGENT_URL}';\n`;
    console.log('✅ Injecting VOICE_AGENT_URL:', VOICE_AGENT_URL);
  } else {
    console.log('⚠️ No VOICE_AGENT_URL found - widget will use auto-detection fallback');
  }
  
  if (WIDGET_URL) {
    envInjection += `window.IHEARD_WIDGET_URL = '${WIDGET_URL}';\n`;
    console.log('✅ Injecting WIDGET_URL:', WIDGET_URL);
  }
  
  envInjection += `window.IHEARD_BUILD_ENV = '${NODE_ENV}';\n`;
  envInjection += `window.IHEARD_BUILD_TIME = '${new Date().toISOString()}';\n`;
  envInjection += '\n';
  
  // Inject at the beginning of the file, after any initial comments
  const lines = source.split('\n');
  let insertIndex = 0;
  
  // Skip initial comment blocks
  while (insertIndex < lines.length && (
    lines[insertIndex].trim().startsWith('//') || 
    lines[insertIndex].trim().startsWith('/*') ||
    lines[insertIndex].trim() === ''
  )) {
    insertIndex++;
  }
  
  // Insert environment variables
  lines.splice(insertIndex, 0, envInjection);
  
  return lines.join('\n');
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
  
  let source = fs.readFileSync(sourcePath, 'utf8');
  
  // Inject environment variables at build time
  source = injectEnvironmentVariables(source);
  
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

    // Copy source modules for CDN deployment
    const srcPath = path.join(__dirname, '..', 'src');
    const srcDest = path.join(__dirname, '..', config.buildDir);
    const moduleFolders = ['api', 'core', 'styles', 'ui', 'utils', 'voice'];
    
    for (const folder of moduleFolders) {
      const folderSrc = path.join(srcPath, folder);
      const folderDest = path.join(srcDest, folder);
      if (fs.existsSync(folderSrc)) {
        copyDirectory(folderSrc, folderDest);
        console.log(`📁 Module directory copied: ${folder}`);
      }
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