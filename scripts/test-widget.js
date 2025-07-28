#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 iHeardAI Widget Test Script');
console.log('==============================\n');

// Test configuration
const tests = [
  {
    name: 'Source file exists',
    test: () => {
      const sourcePath = path.join(__dirname, '..', 'src', 'widget.js');
      return fs.existsSync(sourcePath);
    }
  },
  {
    name: 'Source file is readable',
    test: () => {
      const sourcePath = path.join(__dirname, '..', 'src', 'widget.js');
      try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        return content.length > 0;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'Source file contains widget code',
    test: () => {
      const sourcePath = path.join(__dirname, '..', 'src', 'widget.js');
      try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        return content.includes('iHeardAIWidget') && content.includes('window.iHeardAIWidget');
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'Build directory exists (if built)',
    test: () => {
      const buildPath = path.join(__dirname, '..', 'dist');
      return fs.existsSync(buildPath);
    },
    optional: true
  },
  {
    name: 'Minified file exists (if built)',
    test: () => {
      const minifiedPath = path.join(__dirname, '..', 'dist', 'widget.min.js');
      return fs.existsSync(minifiedPath);
    },
    optional: true
  },
  {
    name: 'Minified file is smaller than source (if built)',
    test: () => {
      const sourcePath = path.join(__dirname, '..', 'src', 'widget.js');
      const minifiedPath = path.join(__dirname, '..', 'dist', 'widget.min.js');
      
      if (!fs.existsSync(minifiedPath)) {
        return true; // Skip if not built
      }
      
      const sourceSize = fs.statSync(sourcePath).size;
      const minifiedSize = fs.statSync(minifiedPath).size;
      
      return minifiedSize < sourceSize;
    },
    optional: true
  },
  {
    name: 'Package.json is valid',
    test: () => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      try {
        const content = fs.readFileSync(packagePath, 'utf8');
        JSON.parse(content);
        return true;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'Package.json has required scripts',
    test: () => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      try {
        const content = fs.readFileSync(packagePath, 'utf8');
        const pkg = JSON.parse(content);
        return pkg.scripts && pkg.scripts['build:cdn'] && pkg.scripts.dev;
      } catch (error) {
        return false;
      }
    }
  }
];

// Run tests
function runTests() {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  
  console.log('Running tests...\n');
  
  for (const test of tests) {
    try {
      const result = test.test();
      
      if (result) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        if (test.optional) {
          console.log(`⏭️  ${test.name} (skipped - optional)`);
          skipped++;
        } else {
          console.log(`❌ ${test.name}`);
          failed++;
        }
      }
    } catch (error) {
      if (test.optional) {
        console.log(`⏭️  ${test.name} (skipped - optional)`);
        skipped++;
      } else {
        console.log(`❌ ${test.name} (error: ${error.message})`);
        failed++;
      }
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📈 Total: ${tests.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Check if widget can be built
function testBuild() {
  console.log('\n🔨 Testing build process...');
  
  try {
    // Import and run build script
    const buildScript = require('./build-cdn.js');
    buildScript.main();
    console.log('✅ Build test completed successfully!');
  } catch (error) {
    console.log(`❌ Build test failed: ${error.message}`);
    process.exit(1);
  }
}

// Main test runner
function main() {
  runTests();
  testBuild();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests, testBuild }; 