"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadNotes() {
    const res = await fetch("/api/notes");
    if (!res.ok) {
      setError("Failed to load notes (maybe not logged in)");
      return;
    }
    const data = await res.json();
    setNotes(data);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add note");
      return;
    }

    setTitle("");
    setContent("");
    await loadNotes();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setNotes((prev) => prev.filter((n) => n._id !== id));
  }

  const filteredNotes = notes.filter((note) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Add a new note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleAdd}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="cursor-pointer">
              Add note
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold">Your notes</CardTitle>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {search.trim() ? `No notes match "${search}".` : "No notes yet."}
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredNotes.map((note) => (
                <li
                  key={note._id}
                  className="flex items-start justify-between rounded-md border border-border p-3"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{note.title}</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {note.content}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(note._id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
