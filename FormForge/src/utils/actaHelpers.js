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
