obj = {
  number: 1,
  change: "",
  status: "Not here",
  time: ""
}

let lst = []

for (let i = 0; i < 5; i++) {
  lst.push(obj)
}

console.log(JSON.stringify(lst))