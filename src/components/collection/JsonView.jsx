import React from 'react';
import { Box } from '@mui/material';

function JsonView({
    jsonEditData,
    setJsonEditData,
    setJsonHasChanges,
    borderColor,
}) {
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <textarea
                value={jsonEditData}
                onChange={(e) => { setJsonEditData(e.target.value); setJsonHasChanges(true); }}
                style={{
                    flexGrow: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    border: 'none',
                    borderTop: `1px solid ${borderColor}`,
                    outline: 'none',
                    padding: 16,
                    resize: 'none',
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                }}
            />
        </Box>
    );
}

export default JsonView;
