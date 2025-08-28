import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./users.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const userProto = grpc.loadPackageDefinition(packageDefinition).users;

// Kreiranje klijenta
const client = new userProto.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Funkcija za kreiranje korisnika
function createUser(name, email) {
  return new Promise((resolve, reject) => {
    client.CreateUser({ name, email }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

// Funkcija za dobavljanje korisnika (sa opcionalnim filterom)
function getUsers(filterName = "") {
  return new Promise((resolve, reject) => {
    client.GetUsers({ name: filterName }, (err, response) => {
      if (err) reject(err);
      else resolve(response.users);
    });
  });
}

// Funkcija za brisanje korisnika po ID-u
function deleteUser(id) {
  return new Promise((resolve, reject) => {
    client.DeleteUser({ id }, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

//  Funkcija za prikaz korisnika
function displayUsers(users) {
  console.log('📋 Lista korisnika:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
  });
}


// Glavna test funkcija (clean async/await)
async function testGRPC() {
  try {
    console.log('Testiranje gRPC klijenta...\n');

    // Test 1: Kreiranje korisnika
    console.log('1. Kreiranje korisnika...');
    const user1 = await createUser('Andrija', 'andrija@example.com');
    console.log('✅ Kreiran korisnik:', user1);

    // Test 2: Kreiranje drugog korisnika
    console.log('\n2. Kreiranje drugog korisnika...');
    const user2 = await createUser('Jovan', 'jovan@example.com');
    console.log('✅ Kreiran korisnik:', user2);

    // Test 3: Dobavljanje svih korisnika
    console.log('\n3. Dobavljanje svih korisnika...');
    const users = await getUsers();
    displayUsers(users);

    // Test 4: Dobavljanje korisnika po imenu
    const filtered = await getUsers("Jovan");
    console.log("\n 4. 🔍 Pretraga korisnika po imenu 'Jovan':");
    displayUsers(filtered);

    // Test 5: Brisanje korisnika po ID-u (brisemo prvog iz liste ako postoji)
    if (users.length > 0) {
      console.log(`\n 5. Brisanje korisnika sa ID: ${users[1].id}`);
      await deleteUser(users[1].id);

      // Ponovo dobavljanje svih korisnika
      const afterDelete = await getUsers();
      console.log("\n📋 Lista nakon brisanja:");
      displayUsers(afterDelete);
    }

    // Test 6: Probamo da kreíramo korisnika sa istim emailom (greška)
    console.log('\n6. Testiranje duplikata emaila...');
    try {
      await createUser('Andrija Drugi', 'andrija@example.com');
    } catch (error) {
      console.log('✅ Očekivana greška za duplikat:', error.message);
    }

    // Test 7: Probamo nevalidan email
    console.log('\n7. Testiranje nevalidnog emaila...');
    try {
      await createUser('Test', 'nevalidan-email');
    } catch (error) {
      console.log('✅ Očekivana greška za nevalidan email:', error.message);
    }

    console.log('\n🎯 Testiranje završeno!');

  } catch (error) {
    console.error('❌ Neočekivana greška:', error.message);
  }
}

// Pokretanje glavne funkcije
async function main() {
  console.log('gRPC klijent');
  console.log('==========================\n');

  await testGRPC();

}

main().catch(console.error);