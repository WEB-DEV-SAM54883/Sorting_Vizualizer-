const arrayContainer = document.getElementById('array-container');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSlider = document.getElementById('speed-slider');
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const swapSound = document.getElementById('swap-sound');

let animationId;
let array = [];
let sortedIndices = [];

function updateArrayView(array, highlightIndices = []) {
    arrayContainer.innerHTML = '';
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value}px`;
        if (highlightIndices.includes(index)) {
            bar.style.backgroundColor = '#002379'; // Change color of the highlighted bar
        } else {
            bar.style.backgroundColor = '#FF5F00'; // Default bar color
        }

        const label = document.createElement('span');
        label.classList.add('bar-label');
        label.textContent = value;

        bar.appendChild(label);
        arrayContainer.appendChild(bar);
    });
}

function parseUserInput(input) {
    return input.trim().split(/\s+/).map(Number);
}

function generateRandomArray(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 300) + 50);
}

function bubbleSort(array) {
    return function* () {
        let n = array.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    yield { array: array.slice(), highlightIndices: [j, j + 1] }; // Highlight the bars being compared
                }
            }
        }
    }();
}

function selectionSort(array) {
    return function* () {
        let n = array.length;
        for (let i = 0; i < n; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (array[j] < array[minIdx]) {
                    minIdx = j;
                }
                yield { array: array.slice(), highlightIndices: [i, j] }; // Highlight the bars being compared
            }
            if (minIdx !== i) {
                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                yield { array: array.slice(), highlightIndices: [i, minIdx] }; // Highlight the bars being swapped
            }
        }
    }();
}

function insertionSort(array) {
    return function* () {
        let n = array.length;
        for (let i = 1; i < n; i++) {
            let key = array[i];
            let j = i - 1;
            while (j >= 0 && array[j] > key) {
                array[j + 1] = array[j];
                j--;
                yield { array: array.slice(), highlightIndices: [j + 1, j + 2] }; // Highlight the bars being compared
            }
            array[j + 1] = key;
            yield { array: array.slice(), highlightIndices: [j + 1] }; // Highlight the bar being inserted
        }
    }();
}

function mergeSort(array) {
    function* merge(arr, l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);
        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) arr[k] = L[i++];
            else arr[k] = R[j++];
            yield { array: arr.slice(), highlightIndices: [k] }; // Highlight the bar being merged
        }
        while (i < n1) arr[k++] = L[i++];
        while (j < n2) arr[k++] = R[j++];
        yield { array: arr.slice(), highlightIndices: [] };
    }

    function* mergeSortHelper(arr, l, r) {
        if (l < r) {
            let m = Math.floor((l + r) / 2);
            yield* mergeSortHelper(arr, l, m);
            yield* mergeSortHelper(arr, m + 1, r);
            yield* merge(arr, l, m, r);
        }
    }

    return mergeSortHelper(array, 0, array.length - 1);
}

function quickSort(array) {
    function* quickSortHelper(arr, low, high) {
        if (low < high) {
            let pi = partition(arr, low, high);
            yield* quickSortHelper(arr, low, pi - 1);
            yield* quickSortHelper(arr, pi + 1, high);
        }
        yield { array: arr.slice(), highlightIndices: [] };
    }

    function partition(arr, low, high) {
        let pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }

    return quickSortHelper(array, 0, array.length - 1);
}

startBtn.addEventListener('click', async () => {
    const algorithm = algorithmSelect.value;
    switch (algorithm) {
        case 'bubble-sort':
            await animateSort(bubbleSort, array);
            break;
        case 'selection-sort':
            await animateSort(selectionSort, array);
            break;
        case 'insertion-sort':
            await animateSort(insertionSort, array);
            break;
        case 'merge-sort':
            await animateSort(mergeSort, array);
            break;
        case 'quick-sort':
            await animateSort(quickSort, array);
            break;
    }
});

stopBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationId);
});

submitBtn.addEventListener('click', () => {
    const userInputValue = userInput.value;
    const numbers = parseUserInput(userInputValue);
    array = numbers;
    updateArrayView(array);
});

randomizeBtn.addEventListener('click', () => {
    const length = Math.floor(Math.random() * 50) + 25; // Generate array length between 25 and 75
    array = generateRandomArray(length);
    updateArrayView(array);
});

async function animateSort(sortFunction, array) {
    const generator = sortFunction([...array]);
    for (const result of generator) {
        updateArrayView(result.array, result.highlightIndices);
        swapSound.play(); // Play swap sound effect
        await new Promise(resolve => setTimeout(resolve, 1000 / speedSlider.value));
    }
}
