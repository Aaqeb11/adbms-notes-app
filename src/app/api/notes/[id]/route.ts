import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface Params {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const notes = db.collection("notes");

  const { id } = await params;
  const noteId = new ObjectId(id);

  const result = await notes.deleteOne({
    _id: noteId,
    userId: new ObjectId(user.sub),
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
