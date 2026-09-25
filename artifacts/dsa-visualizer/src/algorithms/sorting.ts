import type { SortState } from "./sorting-types";

export type { SortState };

export function generateBubbleSortSteps(initialArray: number[]): SortState[] {
  const steps: SortState[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const sorted: number[] = [];

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: "Starting Bubble Sort" });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: [...sorted], description: `Comparing index ${j} and ${j + 1}` });
      if (arr[j] > arr[j + 1]) {
        steps.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: [...sorted], description: `Swapping ${arr[j]} and ${arr[j + 1]}` });
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
        steps.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: [...sorted], description: `Swapped` });
      }
    }
    sorted.push(n - i - 1);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: `${arr[n - i - 1]} is in its final position` });
    if (!swapped) {
      break;
    }
  }
  for (let i = 0; i < n; i++) {
    if (!sorted.includes(i)) sorted.push(i);
  }
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: "Array is sorted!" });
  return steps;
}

export function generateSelectionSortSteps(initialArray: number[]): SortState[] {
  const steps: SortState[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const sorted: number[] = [];

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: "Starting Selection Sort" });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...arr], comparing: [minIdx, j], swapping: [], sorted: [...sorted], description: `Comparing current min ${arr[minIdx]} with ${arr[j]}` });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      steps.push({ array: [...arr], comparing: [], swapping: [i, minIdx], sorted: [...sorted], description: `Swapping ${arr[i]} and ${arr[minIdx]}` });
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }
    sorted.push(i);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: `${arr[i]} is in its final position` });
  }
  sorted.push(n - 1);
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: "Array is sorted!" });
  return steps;
}

export * from './sorting-extended';