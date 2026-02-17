/**
 * ExportService.js
 * Manual CSV formatting for admin reports.
 */

class ExportService {
    static toCSV(data, fields) {
        if (!data || !data.length) return "";

        // Header
        const header = fields.map(f => f.label).join(',');

        // Rows
        const rows = data.map(item => {
            return fields.map(f => {
                let value = item;
                // Support nested paths like 'User.name'
                const paths = f.key.split('.');
                paths.forEach(p => {
                    if (value) value = value[p];
                });

                // Escape quotes and wrap in quotes
                const strValue = (value === null || value === undefined) ? "" : String(value);
                const escaped = strValue.replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',');
        });

        return [header, ...rows].join('\n');
    }
}

module.exports = ExportService;
