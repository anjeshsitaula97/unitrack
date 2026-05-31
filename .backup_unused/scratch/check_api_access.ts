async function checkApi() {
  const res = await fetch('http://localhost:4028/api/access');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
checkApi();
