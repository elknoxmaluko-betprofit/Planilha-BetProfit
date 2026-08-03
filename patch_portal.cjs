const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

if (!content.includes("import { createPortal }")) {
  content = content.replace(
    /import React, \{ useMemo \} from 'react';/,
    "import React, { useMemo } from 'react';\nimport { createPortal } from 'react-dom';"
  );
}

const returnStatement = `  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>`;

const portalReturnStatement = `  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose}>`;

content = content.replace(returnStatement, portalReturnStatement);

const endStatement = `        </div>
      </div>
    </div>
  );
};`;

const portalEndStatement = `        </div>
      </div>
    </div>,
    document.body
  );
};`;

content = content.replace(endStatement, portalEndStatement);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
