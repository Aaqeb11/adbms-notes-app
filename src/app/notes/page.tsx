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
  const [editingId, setEditingId] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/notes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to update note");
          return;
        }
      } else {
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
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      await loadNotes();
    } catch {
      setError("Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setNotes((prev) => prev.filter((n) => n._id !== id));
    if (editingId === id) {
      setEditingId(null);
      setTitle("");
      setContent("");
    }
  }

  function handleEditClick(note: Note) {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
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
            {editingId ? "Edit note" : "Add a new note"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
            <div className="flex gap-2">
              <Button type="submit" className="cursor-pointer">
                {editingId ? "Save changes" : "Add note"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => handleEditClick(note)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => handleDelete(note._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
