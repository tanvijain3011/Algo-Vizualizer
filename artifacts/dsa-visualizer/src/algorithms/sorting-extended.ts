import { SortState } from "./sorting";

export function generateInsertionSortSteps(initialArray: number[]): SortState[] {
  const steps: SortState[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [0], description: "First element is trivially sorted." });

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    
    steps.push({ array: [...arr], comparing: [i], swapping: [], sorted: Array.from({length: i}, (_, k) => k), description: `Selecting ${key} to insert` });

    while (j >= 0 && arr[j] > key) {
      steps.push({ array: [...arr], comparing: [j, j+1], swapping: [], sorted: Array.from({length: i}, (_, k) => k), description: `Comparing ${arr[j]} > ${key}` });
      steps.push({ array: [...arr], comparing: [], swapping: [j, j+1], sorted: Array.from({length: i}, (_, k) => k), description: `Moving ${arr[j]} to right` });
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({length: i + 1}, (_, k) => k), description: `Inserted ${key} at index ${j+1}` });
  }

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), description: "Array is sorted!" });
  return steps;
}

export function generateMergeSortSteps(initialArray: number[]): SortState[] {
  const steps: SortState[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: "Starting Merge Sort" });

  function merge(l: number, m: number, r: number) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
      steps.push({ array: [...arr], comparing: [l + i, m + 1 + j], swapping: [], sorted: [], description: `Comparing ${left[i]} and ${right[j]}` });
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      steps.push({ array: [...arr], comparing: [], swapping: [k], sorted: [], description: `Placed ${arr[k]} at index ${k}` });
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      steps.push({ array: [...arr], comparing: [], swapping: [k], sorted: [], description: `Placed remaining ${arr[k]}` });
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      steps.push({ array: [...arr], comparing: [], swapping: [k], sorted: [], description: `Placed remaining ${arr[k]}` });
      j++;
      k++;
    }
  }

  function sort(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor(l + (r - l) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: `Merged section ${l} to ${r}` });
  }

  sort(0, n - 1);
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), description: "Array is sorted!" });
  return steps;
}

export function generateQuickSortSteps(initialArray: number[]): SortState[] {
  const steps: SortState[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: "Starting Quick Sort" });

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({ array: [...arr], comparing: [high], swapping: [], sorted: [], description: `Selected pivot ${pivot}` });

    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparing: [j, high], swapping: [], sorted: [], description: `Comparing ${arr[j]} with pivot ${pivot}` });
      if (arr[j] < pivot) {
        i++;
        steps.push({ array: [...arr], comparing: [], swapping: [i, j], sorted: [], description: `Swapping ${arr[i]} and ${arr[j]}` });
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    steps.push({ array: [...arr], comparing: [], swapping: [i + 1, high], sorted: [], description: `Placing pivot ${pivot} at index ${i + 1}` });
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  sort(0, n - 1);
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), description: "Array is sorted!" });
  return steps;
}

export type { SortState } from "./sorting";
