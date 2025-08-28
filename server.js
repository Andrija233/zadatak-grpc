import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import connectDB, { User } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

// Učitavanje proto fajla
const PROTO_PATH = "./users.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).users;

// Implementacija metoda
const getUsers = async (call, callback) => {
  try {
    const {name} = call.request;

    let query = {};
    if (name && name.trim() !== "") {
      // case-insensitive pretraga po imenu
      query = { name: { $regex: name, $options: "i" } };
    }
    const users = await User.find(query);
    callback(null, { users });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Database error: " + err.message,
    });
  }
};

const createUser = async (call, callback) => {
  try {
    const { name, email } = call.request;

    if (!name || !email) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Name and email are required",
      });
    }

    if (!isValidEmail(email)) {
        return callback(new Error('Invalid email format'));
    }

    const existingUser = await User.findOne({ email });
      if (existingUser) {
        return callback(new Error('User with this email already exists'));
    }

    const newUser = new User({ name, email });
    await newUser.save();

    callback(null, {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Database error: " + err.message,
    });
  }
};

const deleteUser = async (call, callback) => {
  try {
    const { id } = call.request;
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }

    callback(null, {}); // vraća prazan response (Empty)
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
};

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Pokretanje servera
const main = async () => {
  await connectDB();

  const server = new grpc.Server();
  server.addService(userProto.UserService.service, {
    GetUsers: getUsers,
    CreateUser: createUser,
    DeleteUser: deleteUser,
  });

  const PORT = process.env.PORT || 50051;
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log(`🚀 gRPC server running at 0.0.0.0:${PORT}`);
    }
  );
};

main();
