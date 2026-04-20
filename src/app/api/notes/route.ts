import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const notes = db.collection("notes");

  const data = await notes
    .find({ userId: new ObjectId(user.sub) })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 },
    );
  }

  const db = await getDb();
  const notes = db.collection("notes");

  const result = await notes.insertOne({
    userId: new ObjectId(user.sub),
    title,
    content,
    createdAt: new Date(),
  });

  return NextResponse.json(
    { success: true, id: result.insertedId.toString() },
    { status: 201 },
  );
}
