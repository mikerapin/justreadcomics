import bcrypt from 'bcrypt';

async function main() {
  const password = process.env.PASSWORD;
  if (!password) {
    console.error('Usage: PASSWORD=yourpassword npx ts-node scripts/hash-password.ts');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
