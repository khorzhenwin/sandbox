console.log("Hello World");

module.exports = async () => {
  const res = await request
    .post("http://localhost:3000/api/v1/login")
    .send(payload)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Accept-Language", "en-US");
};
