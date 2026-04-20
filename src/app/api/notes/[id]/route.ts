import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const notes = db.collection("notes");

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

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;

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

  const noteId = new ObjectId(id);

  const result = await notes.updateOne(
    { _id: noteId, userId: new ObjectId(user.sub) },
    {
      $set: {
        title,
        content,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
