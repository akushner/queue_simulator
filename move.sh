#!/bin/bash

# --- Reorganize for Python/TypeScript Development ---

# Create the new top-level directories
echo "Creating 'python' and 'typescript' directories..."
mkdir python
mkdir typescript

# Move the TypeScript/frontend files
echo "Moving TypeScript project files..."
mv src typescript/
mv eslint.config.js typescript/
mv index.html typescript/
mv package.json typescript/
mv package-lock.json typescript/
mv tsconfig.json typescript/
mv tsconfig.node.json typescript/
mv vite.config.ts typescript/
mv node_modules typescript/

# Move the Python-related documentation
echo "Moving Python-related docs..."
mv convert_to_python.md python/

# The rest of the files (FUTURE_IDEAS.md, GEMINI.md, program_spec.md, README.md, server.log)
# will remain at the root as they are relevant to the whole project.

echo ""
echo "--- Reorganization Complete ---"
echo ""
echo "Here is the new directory structure:"
echo ""

# Display the new structure
ls -F
echo ""
echo "typescript/:'
ls -F typescript/
echo ""
echo "python/:'
ls -F python/