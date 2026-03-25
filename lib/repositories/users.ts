import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import { UserDocument } from "@/lib/models";

export async function getUsersCollection() {
  const database = await getDatabase();
  const collection = database.collection<UserDocument>("users");

  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

export async function findUserByEmail(email: string) {
  const users = await getUsersCollection();
  return users.findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(userId: string) {
  const users = await getUsersCollection();
  return users.findOne({ _id: new ObjectId(userId) });
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const users = await getUsersCollection();
  const now = new Date();

  const document: UserDocument = {
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now
  };

  const result = await users.insertOne(document);
  return {
    ...document,
    _id: result.insertedId
  };
}
