#!/usr/bin/env node

/**
 * Script to update all TextField date inputs to use the new DatePicker component
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const files = [
  'client/src/pages/Dashboard.tsx',
  'client/src/pages/MenuAnalysis.tsx',
  'client/src/pages/SalesReport.tsx',
  'client/src/pages/Transactions.tsx'
];

// Run the update process
(async () => {
  console.log('Updating date pickers in components...');
  let updatedCount = 0;
  
  for (const filePath of files) {
    try {
      console.log(`Processing ${filePath}...`);
      
      // Read the file
      let content = await readFile(filePath, 'utf8');
      
      // Check if the DatePicker import is already present
      if (!content.includes("import DatePicker from '../components/common/DatePicker'")) {
        // Add the import statement
        content = content.replace(
          /import.*from ['"]react['"];/,
          (match) => match + '\nimport DatePicker from \'../components/common/DatePicker\';'
        );
      }
      
      // Replace TextField date inputs with DatePicker component
      const updatedContent = content.replace(
        /<TextField\s+label="([^"]+)"\s+type="date"\s+value={([^}]+)}\s+onChange={([^}]+)}\s+([^>]+)InputLabelProps={{ shrink: true }}([^>]*)\/>/g,
        '<DatePicker\n      label="$1"\n      value={$2}\n      onChange={$3}\n      $4$5/>'
      );
      
      // Only write if we made changes
      if (content !== updatedContent) {
        await writeFile(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated ${filePath}`);
        updatedCount++;
      } else {
        console.log(`⏭️ No changes needed in ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  console.log(`\nCompleted! Updated ${updatedCount} of ${files.length} files.`);
})(); 