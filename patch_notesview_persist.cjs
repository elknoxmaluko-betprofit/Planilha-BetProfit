const fs = require('fs');
let content = fs.readFileSync('components/NotesView.tsx', 'utf8');

content = content.replace(
  "import React, { useMemo, useState } from 'react';",
  "import React, { useMemo, useState, useEffect } from 'react';"
);

const oldState = `  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState<boolean>(false);`;

const newState = `  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('betprofit_notes_selected_tags');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [showTags, setShowTags] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('betprofit_notes_selected_tags', JSON.stringify(selectedTags));
  }, [selectedTags]);`;

content = content.replace(oldState, newState);
fs.writeFileSync('components/NotesView.tsx', content);
