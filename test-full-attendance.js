const http = require('http');

// First check out
const checkoutData = JSON.stringify({
  employeeId: "1"
});

const checkoutOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/attendance/checkout',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': checkoutData.length
  }
};

const checkoutReq = http.request(checkoutOptions, (res) => {
  console.log(`Checkout Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Checkout Response: ${chunk}`);
  });
  
  // Now check in
  const checkinData = JSON.stringify({
    employeeId: "1"
  });

  const checkinOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/attendance/checkin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': checkinData.length
    }
  };

  const checkinReq = http.request(checkinOptions, (res) => {
    console.log(`Checkin Status: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      console.log(`Checkin Response: ${chunk}`);
    });
  });

  checkinReq.on('error', (e) => {
    console.error(`Problem with checkin request: ${e.message}`);
  });

  checkinReq.write(checkinData);
  checkinReq.end();
});

checkoutReq.on('error', (e) => {
  console.error(`Problem with checkout request: ${e.message}`);
});

checkoutReq.write(checkoutData);
checkoutReq.end();
