#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 iHeardAI Widget Build Script');
console.log('==============================\n');

// Configuration
const config = {
  buildDir: 'dist',
  widgetFile: 'widget.js',
  minifiedFile: 'widget.min.js'
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

// Simple minification
function minifyCode(code) {
  return code
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

// Build widget
function buildWidget() {
  console.log('📦 Building widget...');
  
  const sourcePath = path.join(__dirname, '..', 'src', config.widgetFile);
  const buildPath = ensureBuildDir();
  
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Widget source file not found:', sourcePath);
    process.exit(1);
  }
  
  const source = fs.readFileSync(sourcePath, 'utf8');
  const minified = minifyCode(source);
  
  // Write minified file
  const minifiedPath = path.join(buildPath, config.minifiedFile);
  fs.writeFileSync(minifiedPath, minified);
  
  const originalSize = Buffer.byteLength(source, 'utf8');
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const compression = Math.round((1 - minifiedSize / originalSize) * 100);
  
  console.log('✅ Widget built successfully');
  console.log(`   📄 Minified: ${config.minifiedFile}`);
  console.log(`   📊 Size: ${minifiedSize} bytes (${compression}% smaller)`);
  
  return {
    size: minifiedSize,
    originalSize: originalSize,
    compression: compression
  };
}

// Main build process
function main() {
  try {
    console.log('🔨 Starting widget build...\n');
    
    const buildInfo = buildWidget();
    
    console.log('\n🎉 Build completed successfully!');
    console.log('=====================================');
    console.log(`📊 File size: ${buildInfo.size} bytes (${buildInfo.compression}% smaller)`);
    console.log(`📁 Output: dist/${config.minifiedFile}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, buildWidget }; 