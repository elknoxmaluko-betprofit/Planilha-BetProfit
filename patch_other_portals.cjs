const fs = require('fs');

function wrapWithPortal(file, oldReturn, newReturn, oldEnd, newEnd) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("createPortal")) {
    content = content.replace(/import React(.*?);/, "import React$1;\nimport { createPortal } from 'react-dom';");
  }
  content = content.replace(oldReturn, newReturn);
  content = content.replace(oldEnd, newEnd);
  fs.writeFileSync(file, content);
}

wrapWithPortal(
  'components/ConfirmModal.tsx',
  '  return (\n    <div className="fixed inset-0',
  '  return createPortal(\n    <div className="fixed inset-0',
  '      </div>\n    </div>\n  );\n};',
  '      </div>\n    </div>,\n    document.body\n  );\n};'
);

wrapWithPortal(
  'components/LogoEditModal.tsx',
  '  return (\n    <div className="fixed inset-0',
  '  return createPortal(\n    <div className="fixed inset-0',
  '      </div>\n    </div>\n  );\n};',
  '      </div>\n    </div>,\n    document.body\n  );\n};'
);

wrapWithPortal(
  'components/DuplicateModal.tsx',
  '  return (\n    <div className="fixed inset-0',
  '  return createPortal(\n    <div className="fixed inset-0',
  '      </div>\n    </div>\n  );\n};',
  '      </div>\n    </div>,\n    document.body\n  );\n};'
);

