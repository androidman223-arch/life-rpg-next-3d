import fs from "fs";
const p = process.argv[2];
const b = fs.readFileSync(p);
const t = b.toString("latin1");
const names = [...t.matchAll(/"name":"([^"]+)"/g)].map((m) => m[1]);
const uniq = [...new Set(names)];
console.log(uniq.filter((n) => /attack|idle|run|pow|bison|walk/i.test(n)).join("\n"));
console.log("---");
console.log(uniq.join("\n"));
