#!/usr/bin/env node
import process from 'node:process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const ROOT_DIR = resolve(fileURLToPath(new URL('..', import.meta.url)));
const META_PATH = resolve(ROOT_DIR, 'public', 'data', 'exercises.meta.json');
const MODULE_PATH = new URL('../src/data/exercises.js', import.meta.url);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STRAY_PATTERN = /\*\*/;
const VERSION_PATTERN = /^20\d{2}\.\d{2}\.\d{2}-\d+$/;

const errorsById = new Map();

function addError(id, message) {
  const key = id || 'library';
  if (!errorsById.has(key)) {
    errorsById.set(key, []);
  }
  errorsById.get(key).push(message);
}

function reportAndExit() {
  if (!errorsById.size) {
    return;
  }
  console.error('Exercise library validation failed:\n');
  const ordered = Array.from(errorsById.entries()).sort((a, b) => {
    if (a[0] === 'library') return -1;
    if (b[0] === 'library') return 1;
    return a[0].localeCompare(b[0]);
  });
  ordered.forEach(([id, messages]) => {
    console.error(`❌ ${id}`);
    messages.forEach(message => {
      console.error(`   - ${message}`);
    });
    console.error('');
  });
  process.exit(1);
}

const moduleExports = await import(MODULE_PATH).catch(error => {
  addError('library', `failed to load exercise library: ${error.message}`);
  reportAndExit();
});

const {
  default: EXERCISE_LIBRARY,
  ALLOWED_EQUIPMENT,
  ALLOWED_INTIMIDATION_LEVELS,
  ALLOWED_MUSCLE_GROUPS,
  EXERCISE_LIBRARY_CHECKSUM,
  EXERCISE_LIBRARY_VERSION,
  generateExerciseLibraryChecksum
} = moduleExports;

if (!Array.isArray(EXERCISE_LIBRARY)) {
  addError('library', 'exercise library must be an array.');
  reportAndExit();
}

if (typeof EXERCISE_LIBRARY_VERSION !== 'string' || !VERSION_PATTERN.test(EXERCISE_LIBRARY_VERSION)) {
  addError('library', `invalid version format: "${EXERCISE_LIBRARY_VERSION}"`);
}

const equipmentSet = new Set(ALLOWED_EQUIPMENT);
const muscleGroupSet = new Set(ALLOWED_MUSCLE_GROUPS);
const intimidationSet = new Set(ALLOWED_INTIMIDATION_LEVELS);
const seenIds = new Set();
const adjacency = new Map();
const pendingAlternativeChecks = [];

EXERCISE_LIBRARY.forEach((exercise, index) => {
  if (!exercise || typeof exercise !== 'object') {
    addError(`exercise@${index}`, 'invalid exercise entry: expected object.');
    return;
  }

  const rawId = typeof exercise.id === 'string' ? exercise.id.trim() : '';
  const bucketId = rawId || `exercise@${index}`;

  if (!rawId) {
    addError(bucketId, 'missing field: id');
  } else {
    if (!ID_PATTERN.test(rawId)) {
      addError(bucketId, `invalid id format: "${exercise.id}"`);
    }
    if (seenIds.has(rawId)) {
      addError(bucketId, `duplicate id detected: "${rawId}"`);
      addError(rawId, `duplicate id detected: "${rawId}"`);
    } else {
      seenIds.add(rawId);
      adjacency.set(rawId, []);
    }
  }

  if (typeof exercise.name !== 'string' || !exercise.name.trim()) {
    addError(bucketId, 'missing field: name');
  } else if (STRAY_PATTERN.test(exercise.name)) {
    addError(bucketId, 'name contains stray characters ("**").');
  }

  if (typeof exercise.equipment !== 'string' || !exercise.equipment.trim()) {
    addError(bucketId, 'missing field: equipment');
  } else if (!equipmentSet.has(exercise.equipment)) {
    addError(bucketId, `invalid equipment: "${exercise.equipment}"`);
  }

  if (typeof exercise.muscleGroup !== 'string' || !exercise.muscleGroup.trim()) {
    addError(bucketId, 'missing field: muscleGroup');
  } else if (!muscleGroupSet.has(exercise.muscleGroup)) {
    addError(bucketId, `invalid muscleGroup: "${exercise.muscleGroup}"`);
  }

  if (typeof exercise.intimidationLevel !== 'string' || !exercise.intimidationLevel.trim()) {
    addError(bucketId, 'missing field: intimidationLevel');
  } else if (!intimidationSet.has(exercise.intimidationLevel)) {
    addError(bucketId, `invalid intimidationLevel: "${exercise.intimidationLevel}"`);
  }

  if (!Array.isArray(exercise.alternatives)) {
    addError(bucketId, 'invalid type: alternatives must be an array.');
  } else if (rawId) {
    exercise.alternatives.forEach((alternative, altIndex) => {
      if (typeof alternative !== 'string' || !alternative.trim()) {
        addError(bucketId, `alternatives[${altIndex}] must be a non-empty string.`);
        return;
      }
      pendingAlternativeChecks.push({
        sourceId: rawId,
        targetId: alternative.trim()
      });
    });
  }

  if (typeof exercise.etiquette !== 'string' || !exercise.etiquette.trim()) {
    addError(bucketId, 'missing field: etiquette');
  } else if (STRAY_PATTERN.test(exercise.etiquette)) {
    addError(bucketId, 'etiquette contains stray characters ("**").');
  }

  if (typeof exercise.gymxietySafe !== 'boolean') {
    addError(bucketId, 'invalid type: gymxietySafe must be a boolean.');
  }

  if (exercise.notes !== undefined) {
    if (typeof exercise.notes !== 'string') {
      addError(bucketId, 'invalid type: notes must be a string when provided.');
    } else if (STRAY_PATTERN.test(exercise.notes)) {
      addError(bucketId, 'notes contain stray characters ("**").');
    }
  }

  if (typeof exercise.videoUrl !== 'string') {
    addError(bucketId, 'invalid type: videoUrl must be a string.');
  }

  if (typeof exercise.howItShouldFeel !== 'string' || !exercise.howItShouldFeel.trim()) {
    addError(bucketId, 'missing field: howItShouldFeel must be a non-empty string.');
  }

  if (typeof exercise.commonMistakes !== 'string' || !exercise.commonMistakes.trim()) {
    addError(bucketId, 'missing field: commonMistakes must be a non-empty string.');
  }

  if (typeof exercise.reassurance !== 'string' || !exercise.reassurance.trim()) {
    addError(bucketId, 'missing field: reassurance must be a non-empty string.');
  }
});

const validIds = new Set(seenIds);
pendingAlternativeChecks.forEach(({ sourceId, targetId }) => {
  if (!validIds.has(sourceId)) {
    return;
  }
  if (!validIds.has(targetId)) {
    addError(sourceId, `alternatives reference unknown ID: "${targetId}"`);
  } else {
    adjacency.get(sourceId).push(targetId);
  }
});

const cycles = [];
const visiting = new Set();
const visited = new Set();
const cycleSignatures = new Set();

const dfs = (node, trail) => {
  visiting.add(node);
  trail.push(node);
  const neighbors = adjacency.get(node) || [];
  neighbors.forEach(neighbor => {
    if (visiting.has(neighbor)) {
      const startIndex = trail.indexOf(neighbor);
      if (startIndex !== -1) {
        const cycle = trail.slice(startIndex).concat(neighbor);
        const signature = cycle.join('->');
        if (!cycleSignatures.has(signature)) {
          cycleSignatures.add(signature);
          cycles.push(cycle);
        }
      }
      return;
    }
    if (!visited.has(neighbor)) {
      dfs(neighbor, trail);
    }
  });
  trail.pop();
  visiting.delete(node);
  visited.add(node);
};

Array.from(adjacency.keys()).forEach(id => {
  if (!visited.has(id)) {
    dfs(id, []);
  }
});

cycles.forEach(cycle => {
  const printable = cycle.join(' -> ');
  const nodes = new Set(cycle.slice(0, -1));
  nodes.forEach(id => {
    addError(id, `alternatives contain a circular reference: ${printable}`);
  });
});

if (typeof generateExerciseLibraryChecksum === 'function') {
  const computedChecksum = generateExerciseLibraryChecksum(EXERCISE_LIBRARY);
  if (computedChecksum !== EXERCISE_LIBRARY_CHECKSUM) {
    addError('library', 'checksum mismatch: regenerate EXERCISE_LIBRARY_CHECKSUM.');
  }
}

reportAndExit();

const metaPayload = {
  version: EXERCISE_LIBRARY_VERSION,
  checksum: EXERCISE_LIBRARY_CHECKSUM,
  entries: EXERCISE_LIBRARY.length,
  generatedAt: new Date().toISOString()
};

await writeFile(META_PATH, `${JSON.stringify(metaPayload, null, 2)}\n`);

console.log('Exercise library validated successfully.');
