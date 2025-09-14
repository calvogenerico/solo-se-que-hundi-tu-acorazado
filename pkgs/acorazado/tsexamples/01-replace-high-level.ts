function replaceUpTo(arr: number[], from: number, to: number, upTo: number) {
  const firstPart = arr.slice(0, upTo).map(elem => elem === from ? to : elem);
  const secondPart = new Array(arr.length - upTo).fill(0);
  return [...firstPart, ...secondPart];
}

// console.log(replaceUpTo([1,1,1], 1, 2, 2));
// console.log(replaceUpTo([1,2,1,2,1,2,1,2,1], 1, 2, 6));
// console.log(replaceUpTo([10, 10, 10, 10], 1, 2, 4));
