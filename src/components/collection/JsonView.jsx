import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, useTheme, TextField, IconButton, Tooltip } from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon,
    KeyboardArrowUp as PrevIcon,
    KeyboardArrowDown as NextIcon,
} from '@mui/icons-material';

function JsonView({
    jsonEditData,
    setJsonEditData,
    setJsonHasChanges,
}) {
    const theme = useTheme();
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const isDark = theme.palette.mode === 'dark';
    const editorColors = theme.custom.editor;

    // Search state
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(0);
    const searchInputRef = useRef(null);


    // Count lines
    const lineCount = (jsonEditData || '').split('\n').length;

    // Sync scroll between textarea and line numbers
    const handleScroll = (e) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // Generate line numbers
    const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

    // Find all matches and navigate
    const findMatches = useCallback(() => {
        if (!searchText || !jsonEditData) {
            setMatchCount(0);
            setCurrentMatch(0);
            return [];
        }

        const text = jsonEditData.toLowerCase();
        const search = searchText.toLowerCase();
        const matches = [];
        let index = 0;

        while ((index = text.indexOf(search, index)) !== -1) {
            matches.push(index);
            index += search.length;
        }

        setMatchCount(matches.length);
        if (matches.length > 0 && currentMatch === 0) {
            setCurrentMatch(1);
        }
        return matches;
    }, [searchText, jsonEditData, currentMatch]);

    // Navigate to specific match
    const goToMatch = useCallback((matchIndex) => {
        const matches = findMatches();
        if (matches.length === 0 || !textareaRef.current) return;

        const index = matches[matchIndex - 1];
        if (index !== undefined) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(index, index + searchText.length);
            textareaRef.current.scrollTop = Math.max(0, (textareaRef.current.scrollHeight / jsonEditData.length) * index - 100);
        }
    }, [findMatches, searchText, jsonEditData]);

    // Navigate to next match
    const nextMatch = useCallback(() => {
        if (matchCount === 0) return;
        const next = currentMatch >= matchCount ? 1 : currentMatch + 1;
        setCurrentMatch(next);
        goToMatch(next);
    }, [matchCount, currentMatch, goToMatch]);

    // Navigate to previous match
    const prevMatch = useCallback(() => {
        if (matchCount === 0) return;
        const prev = currentMatch <= 1 ? matchCount : currentMatch - 1;
        setCurrentMatch(prev);
        goToMatch(prev);
    }, [matchCount, currentMatch, goToMatch]);

    // Ctrl+F keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setSearchVisible(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
            }
            if (e.key === 'Escape' && searchVisible) {
                setSearchVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchVisible]);

    // Update matches when search text changes
    useEffect(() => {
        if (searchText) {
            findMatches();
            if (matchCount > 0 && currentMatch > 0) {
                goToMatch(currentMatch);
            }
        }
    }, [searchText, findMatches, matchCount, currentMatch, goToMatch]);

    return (
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: editorColors.bg,
            borderTop: 1,
            borderColor: 'divider',
            height: '100%',
            overflow: 'hidden',
        }}>
            {/* Editor Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 0.5,
                bgcolor: editorColors.gutter,
                borderBottom: 1,
                borderColor: 'divider',
            }}>
                <Typography sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
                }}>
                    JSON Editor
                </Typography>
                <Typography sx={{
                    fontSize: '0.7rem',
                    color: 'text.disabled',
                }}>
                    {lineCount} lines
                </Typography>
            </Box>

            {/* Editor Body with Line Numbers */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
            }}>
                {/* Line Numbers Gutter */}
                <Box
                    ref={lineNumbersRef}
                    sx={{
                        width: 50,
                        minWidth: 50,
                        bgcolor: editorColors.gutter,
                        borderRight: 1,
                        borderColor: 'divider',
                        overflow: 'hidden',
                        py: 1,
                        userSelect: 'none',
                    }}
                >
                    {lineNumbers.map((num) => (
                        <Box
                            key={num}
                            sx={{
                                height: '1.4em',
                                lineHeight: '1.4em',
                                textAlign: 'right',
                                pr: 1.5,
                                fontSize: '0.8rem',
                                fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
                                color: editorColors.lineNumber,
                            }}
                        >
                            {num}
                        </Box>
                    ))}
                </Box>

                {/* Text Editor */}
                <textarea
                    ref={textareaRef}
                    value={jsonEditData}
                    onChange={(e) => {
                        setJsonEditData(e.target.value);
                        setJsonHasChanges(true);
                    }}
                    onScroll={handleScroll}
                    spellCheck={false}
                    style={{
                        flexGrow: 1,
                        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace',
                        fontSize: '0.8rem',
                        lineHeight: '1.4em',
                        border: 'none',
                        outline: 'none',
                        padding: '8px 16px',
                        resize: 'none',
                        backgroundColor: editorColors.bg,
                        color: theme.palette.text.primary,
                        caretColor: theme.palette.primary.main,
                        tabSize: 2,
                        whiteSpace: 'pre',
                        overflowX: 'auto',
                        overflowY: 'auto',
                    }}
                    placeholder="Enter JSON data..."
                />

                {/* Search Bar */}
                {searchVisible && (
                    <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        boxShadow: 3,
                        zIndex: 10,
                    }}>
                        <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <TextField
                            inputRef={searchInputRef}
                            size="small"
                            placeholder="Find..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (e.shiftKey) {
                                        prevMatch();
                                    } else {
                                        nextMatch();
                                    }
                                }
                            }}
                            sx={{
                                width: 200,
                                '& .MuiInputBase-root': {
                                    height: 28,
                                    fontSize: '0.8rem',
                                },
                                '& .MuiInputBase-input': {
                                    py: 0.5,
                                    px: 1,
                                },
                            }}
                        />
                        {matchCount > 0 && (
                            <Typography sx={{
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                minWidth: 45,
                                textAlign: 'center',
                            }}>
                                {currentMatch}/{matchCount}
                            </Typography>
                        )}
                        <Tooltip title="Previous (Shift+Enter)">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={prevMatch}
                                    disabled={matchCount === 0}
                                    sx={{ p: 0.5 }}
                                >
                                    <PrevIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Next (Enter)">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={nextMatch}
                                    disabled={matchCount === 0}
                                    sx={{ p: 0.5 }}
                                >
                                    <NextIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Close (Escape)">
                            <IconButton
                                size="small"
                                onClick={() => setSearchVisible(false)}
                                sx={{ p: 0.5 }}
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default JsonView;
