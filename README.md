gRPC zadatak – Node.js + MongoDB

Ovaj projekat implementira jednostavan gRPC API za upravljanje korisničkim nalozima, razvijen u Node.js sa MongoDB kao bazom podataka.  
Projekat pokriva osnovne i dodatne funkcionalnosti iz zadatka:

- Kreiranje korisnika (`CreateUser`)
- Dobavljanje svih korisnika (`GetUsers`)
- Pretraga korisnika po imenu (filter u `GetUsers`)
- Brisanje korisnika (`DeleteUser`)
- Validacija email adrese  
- Rukovanje duplikatima email adrese

---

Tehnologije:
- Node.js
- gRPC (`@grpc/grpc-js`, `@grpc/proto-loader`)
- MongoDB + Mongoose
- dotenv

---

Instalacija i pokretanje:

1. Kloniranje repozitorijuma

git clone https://github.com/Andrija233/zadatak-grpc.git
cd zadatak-grpc

2. Instalacija zavisnosti

npm install

3. Kreiranje .env fajla
na osnovu .env.example
cp .env.example .env

Primer .env fajla:

MONGO_URI=mongodb://localhost:27017/grpc-users
PORT=50051

4. Pokretanje servera
npm run start:server

Output primera:

✅ MongoDB connected
🚀 gRPC server running at 0.0.0.0:50051

5. Pokretanje klijenta
npm run start:client

Output primera:

📋 Lista korisnika:
1. ID: 68afa48872f89f59c0e5d175, Name: Andrija, Email: andrija@example.com
...


gRPC API specifikacija:

CreateUser (CreateUserRequest) → User
Kreira korisnika.
Validacija: ime i email su obavezni; email mora biti validan i jedinstven.

GetUsers (GetUsersRequest) → UserList
Dobavlja sve korisnike ili filtrira po imenu (case-insensitive).

DeleteUser (DeleteUserRequest) → Empty
Briše korisnika po ID-u.

Bonus funkcionalnosti:

-Validacija email adrese (regex)
-Provera duplikata email adrese
-Filtriranje korisnika po imenu
-Brisanje korisnika po ID-u

Autor:
Andrija Musić