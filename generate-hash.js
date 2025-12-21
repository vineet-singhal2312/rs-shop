const bcrypt = require('bcryptjs');

// Generate hash for password "adminrs321"
const password = 'adminrs321';
const hash = bcrypt.hashSync(password, 10);

console.log('Password hash for "adminrs321":');
console.log(hash);
console.log('\nUsername: adminrs');
console.log('Password: adminrs321');
