import { useState, useEffect } from "react";

export const useNotes = (key) => {
  const [notes, setNotes] = useState(() => localStorage.getItem(key) || "");

  useEffect(() => {
    localStorage.setItem(key, notes);
  }, [notes]);

  return [notes, setNotes];
};
