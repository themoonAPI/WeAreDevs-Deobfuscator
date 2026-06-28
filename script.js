function decodeEscapes(str) {
    return str.replace(/\\(\d{1,3})|\\x([0-9a-fA-F]{2})/g, (m, dec, hex) => {
        return String.fromCharCode(dec ? parseInt(dec, 10) : parseInt(hex, 16));
    });
}

function deobfuscate() {
    const input = document.getElementById('input').value;
    let code = input;
    const status = document.getElementById('status');
    status.textContent = 'Processing...';

    // Extract & decode string table
    const tableMatch = code.match(/local v=\{(.+?)\}/s);
    if (tableMatch) {
        let entries = tableMatch[1].match(/"([^"]+)"/g) || [];
        const decoded = entries.map(e => decodeEscapes(e.slice(1, -1)));
        code = code.replace(/v\[(\d+)\]/g, (m, idx) => {
            const val = decoded[parseInt(idx) - 1] || '';
            return `"${val.replace(/"/g, '\\"')}"`;
        });
    }

    // Inline concats, proxies, basic cleanup
    code = code.replace(/(\w+)\s*\.\.\s*(\w+)/g, '$1$2');
    code = code.replace(/local \w+ = _G\.(\w+)/g, '$1');
    code = code.replace(/return\(function\(\.\.\.\)/, '// Loader stripped\n');
    code = code.replace(/getfenv\(\)|unpack/g, ''); // common wrappers

    // More aggressive passes
    code = code.replace(/\[\[This file was protected.*?\]\]/, '// Deobfed');
    code = decodeEscapes(code); // global pass

    document.getElementById('output').value = code;
    status.textContent = 'Done. Check for remaining tables/proxies and rerun.';
}

function copyOutput() {
    const out = document.getElementById('output');
    out.select();
    document.execCommand('copy');
    alert('Copied to clipboard');
}
