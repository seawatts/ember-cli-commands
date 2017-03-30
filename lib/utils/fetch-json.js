const fetch = require("node-fetch");

module.exports = function fetchJSON(path) {
  return fetch(path)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }

      throw new Error(`${res.url} - ${res.statusText}`);
    })
    .catch((err) => {
      console.log(err);
    });;
}
