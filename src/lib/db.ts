import clientPromise from "./mongodb";

export async function getDb() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "notes_app";
  return client.db(dbName);
}
