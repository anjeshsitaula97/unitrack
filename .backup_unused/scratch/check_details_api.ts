async function checkDetails() {
  const usersRes = await fetch('http://localhost:4028/api/access');
  const users = await usersRes.json();
  const firstUserId = users[0]?.id;
  
  if (firstUserId) {
    console.log(`Checking details for user: ${firstUserId}`);
    const res = await fetch(`http://localhost:4028/api/access/${firstUserId}/details`);
    if (res.ok) {
      const data = await res.json();
      console.log('Success:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error:', res.status, await res.text());
    }
  } else {
    console.log('No users found');
  }
}
checkDetails();
