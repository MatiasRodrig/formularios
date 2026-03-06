// utils/actaHelpers.js

// Finds all occurrences of {{variableName}} in the template string
export const extractVariables = (templateStr) => {
    if (!templateStr) return [];
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [...templateStr.matchAll(regex)];
    // Return unique variables
    return [...new Set(matches.map(m => m[1].trim()))];
};

// Replaces all occurrences of {{variableName}} with values from data object
export const replaceVariables = (templateStr, data) => {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
        const key = varName.trim();
        return data[key] !== undefined ? data[key] : `<span style="color:red">[${key} vacío]</span>`;
    });
};


// utils/actaHelpers.js

export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback manual (RFC 4122 v4)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};