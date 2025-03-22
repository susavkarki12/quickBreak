const fs = require('fs');
const path = require('path');

function copyPatches() {
  console.log('Applying patches to node_modules...');
  
  const patchesDir = path.join(__dirname, 'patches');
  if (!fs.existsSync(patchesDir)) {
    console.error(`Patch directory ${patchesDir} does not exist!`);
    return;
  }
  
  const nodeModulesDir = path.join(__dirname, 'node_modules');
  
  // Get all directories in the patches folder
  const patchDirs = fs.readdirSync(patchesDir)
    .filter(file => fs.statSync(path.join(patchesDir, file)).isDirectory());
  
  console.log(`Found patch directories: ${patchDirs.join(', ')}`);
  
  // Process each patch directory
  patchDirs.forEach(dir => {
    const sourcePatchDir = path.join(patchesDir, dir);
    const targetDir = path.join(nodeModulesDir, dir);
    
    console.log(`Applying patches from ${sourcePatchDir} to ${targetDir}`);
    
    // Copy patches
    copyRecursively(sourcePatchDir, targetDir);
  });

  // Special handling for NdkConfiguratorUtils.kt
  const ndkPatchSource = path.join(__dirname, 'patches', '@react-native', 'gradle-plugin', 'src', 'main', 'kotlin', 'com', 'facebook', 'react', 'utils', 'NdkConfiguratorUtils.kt');
  const ndkPatchTarget = path.join(__dirname, 'node_modules', '@react-native', 'gradle-plugin', 'src', 'main', 'kotlin', 'com', 'facebook', 'react', 'utils', 'NdkConfiguratorUtils.kt');
  
  if (fs.existsSync(ndkPatchSource)) {
    console.log(`Found NdkConfiguratorUtils.kt patch at: ${ndkPatchSource}`);
    
    // Ensure the target directory exists
    const targetDir = path.dirname(ndkPatchTarget);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }
    
    // Copy the file
    fs.copyFileSync(ndkPatchSource, ndkPatchTarget);
    console.log(`Patched file copied: ${ndkPatchTarget}`);
  } else {
    console.log(`NdkConfiguratorUtils.kt patch not found at: ${ndkPatchSource}`);
  }
  
  console.log('Patches applied successfully.');
}

function copyRecursively(source, target) {
  console.log(`Found ${fs.readdirSync(source).length} files in ${source}`);
  
  // Loop through all the files in the source directory
  fs.readdirSync(source).forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create directory if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
        console.log(`Created directory: ${targetPath}`);
      }
      
      // Recursive call
      copyRecursively(sourcePath, targetPath);
    } else {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
      }
      
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Patched file copied: ${targetPath}`);
    }
  });
}

copyPatches(); 