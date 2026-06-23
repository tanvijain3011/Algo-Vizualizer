export type SearchState = {
  array: number[];
  target: number;
  checking: number[];
  found: number | null;
  eliminated: number[];
  description: string;
};

export function generateLinearSearchSteps(initialArray: number[], target: number): SearchState[] {
  const steps: SearchState[] = [];
  const arr = [...initialArray];
  const eliminated: number[] = [];

  steps.push({ array: [...arr], target, checking: [], found: null, eliminated: [...eliminated], description: `Starting Linear Search for ${target}` });

  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: [...arr], target, checking: [i], found: null, eliminated: [...eliminated], description: `Checking if ${arr[i]} equals ${target}` });
    if (arr[i] === target) {
      steps.push({ array: [...arr], target, checking: [], found: i, eliminated: [...eliminated], description: `Found ${target} at index ${i}!` });
      return steps;
    }
    eliminated.push(i);
    steps.push({ array: [...arr], target, checking: [], found: null, eliminated: [...eliminated], description: `${arr[i]} is not ${target}` });
  }

  steps.push({ array: [...arr], target, checking: [], found: null, eliminated: [...eliminated], description: `${target} not found in array.` });
  return steps;
}

export function generateBinarySearchSteps(initialArray: number[], target: number): SearchState[] {
  const steps: SearchState[] = [];
  const arr = [...initialArray].sort((a, b) => a - b);
  let left = 0;
  let right = arr.length - 1;
  let eliminated: number[] = [];

  steps.push({ array: [...arr], target, checking: [], found: null, eliminated: [...eliminated], description: `Array must be sorted. Starting Binary Search for ${target}` });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    // Add elements outside [left, right] to eliminated
    const currentEliminated = Array.from({length: arr.length}, (_, i) => i).filter(i => i < left || i > right);

    steps.push({ array: [...arr], target, checking: [mid], found: null, eliminated: currentEliminated, description: `Checking middle element ${arr[mid]} at index ${mid}` });

    if (arr[mid] === target) {
      steps.push({ array: [...arr], target, checking: [], found: mid, eliminated: currentEliminated, description: `Found ${target} at index ${mid}!` });
      return steps;
    }

    if (arr[mid] < target) {
      steps.push({ array: [...arr], target, checking: [], found: null, eliminated: currentEliminated, description: `${arr[mid]} < ${target}, so search right half` });
      left = mid + 1;
    } else {
      steps.push({ array: [...arr], target, checking: [], found: null, eliminated: currentEliminated, description: `${arr[mid]} > ${target}, so search left half` });
      right = mid - 1;
    }
  }

  steps.push({ array: [...arr], target, checking: [], found: null, eliminated: Array.from({length: arr.length}, (_, i) => i), description: `${target} not found in array.` });
  return steps;
}
