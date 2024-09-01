import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument } from '../../Services/appwrite';
import { marked } from 'marked';

const SharedNote = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedNote();
  }, [noteId]);

  const fetchSharedNote = async () => {
    setLoading(true);
    try {
      const fetchedNote = await getDocument('notes', noteId);
      setNote(fetchedNote);
    } catch (error) {
      console.error('Error fetching shared note', error);
      setError('Failed to fetch the shared note. It may not exist or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading shared note...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!note) return <div>Note not found.</div>;

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">{note.title}</h2>
      <div className="bg-gray-100 p-4 rounded">
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: marked(note.content) }}
        />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Last updated: {new Date(note.updated_at).toLocaleString()}
      </p>
    </div>
  );
};

export default SharedNote;