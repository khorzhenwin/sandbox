const subDoc = "contacts";
const subDocId = "12345";
const filter = { $pull: {} };
filter.$pull.subDoc = { id: subDocId };
console.log(filter);
console.log("");

// binary search
function binarySearch(arr, key) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] < key) {
      low = mid + 1;
    } else if (arr[mid] > key) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}

() => {};

const index = [
  { code: "ABCD", name: "ABC" },
  { code: "ABCD", name: "ABC" },
  { code: "ABCD", name: "ABC" },
];
