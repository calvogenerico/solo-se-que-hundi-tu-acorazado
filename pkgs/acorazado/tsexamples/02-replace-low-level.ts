function replaceUpTo(arr: number[], from: number, to: number, upTo: number) {
  const res: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    if (res[i] === from) {
      res[i] = to;
    } else {
      res[i] = arr[i]!;
    }
  }

  for (let i = upTo; i < arr.length; i++) {
    res[i] = 0;
  }

  return res;
}

// console.log(replaceUpTo([1,1,1], 1, 2, 2));
// console.log(replaceUpTo([1,2,1,2,1,2,1,2,1], 1, 2, 6));
// console.log(replaceUpTo([10, 10, 10, 10], 1, 2, 4));
