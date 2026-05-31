async function testLogin() {
  const response = await fetch('http://localhost:4028/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@unitrack.com', password: 'admin' })
  });
  const data = await response.json();
  console.log('Login Response:', data);
}

testLogin();
