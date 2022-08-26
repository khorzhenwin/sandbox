const subDoc = "contacts";
const subDocId = "12345";
const filter = { $pull: {} };
filter.$pull[subDoc] = { id: subDocId };
console.log(filter);
console.log("");
