import fs from 'fs';
import path from 'path';

// Minimal GLB parser to find node names and animations
function inspectGLB(filePath) {
  console.log(`Inspecting: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }
  const data = fs.readFileSync(filePath);
  const magic = data.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    console.error('Not a valid GLB file');
    return;
  }

  const jsonChunkLength = data.readUInt32LE(12);
  const jsonChunk = data.slice(20, 20 + jsonChunkLength).toString('utf8');
  const gltf = JSON.parse(jsonChunk);

  if (gltf.animations) {
    console.log(`Animations Found (${gltf.animations.length}):`);
    gltf.animations.forEach((anim, i) => {
      console.log(`  [${i}] ${anim.name || 'unnamed'}`);
    });
  } else {
    console.log('No animations found');
  }

  if (!gltf.nodes) {
    console.log('No nodes found in GLB');
    return;
  }

  console.log(`Total nodes: ${gltf.nodes.length}`);
  const nodeNames = gltf.nodes.map(n => n.name || 'unnamed');
  
  const criticalNodes = [
    'root', 'spine', 'head', 'hips', 'pelvis',
    'tail_01', 'tail_02', 'tail_03', 'tail_04', 'tail_05', 'tail_06', 'tail_07', 'tail_08', 'tail_09'
  ];

  console.log('Found Critical Nodes:');
  criticalNodes.forEach(name => {
    const found = nodeNames.some(n => n.toLowerCase().includes(name.toLowerCase()));
    console.log(`- ${name}: ${found ? '✓' : '✗'}`);
  });

  const hasArmature = nodeNames.some(n => n.toLowerCase().includes('armature') || n.toLowerCase().includes('skeleton'));
  console.log(`Has Armature/Skeleton: ${hasArmature ? 'YES' : 'NO'}`);

  // List first 30 nodes for context
  console.log('Sample node names (first 30):');
  console.log(nodeNames.slice(0, 30).join(', '));
}

const targets = process.argv.slice(2);
if (targets.length > 0) {
  targets.forEach(t => {
    inspectGLB(t);
    console.log('-----------------------------------');
  });
} else {
  console.error('Please provide GLB path(s)');
}
