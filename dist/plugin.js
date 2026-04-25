exports.version = 1.1;
exports.description = "Rewrites request paths by stripping leading dots from path segments (e.g. /.file → /file)";
exports.apiRequired = 8.65;
exports.author = "Feuerswut";
exports.repo = "Feuerswut/hfs-DotRewritePaths";

exports.config = {
    paths: {
        type: 'array',
        label: 'Path Prefixes',
        defaultValue: [],
        helperText: 'Limit dot-rewriting to specific path prefixes. Leave empty to apply to all paths.',
        fields: {
            prefix: {
                type: 'string',
                label: 'Prefix',
                helperText: 'e.g. /files or /public',
                $width: 5,
            },
            enabled: {
                type: 'boolean',
                label: 'Enabled',
                defaultValue: true,
                $width: 1,
            },
        },
    },
};

exports.init = api => {
    return { middleware };

    function middleware(ctx) {
        const entries = (api.getConfig('paths') || []).filter(e => e.enabled !== false);

        // If a whitelist is configured, skip requests outside enabled prefixes
        if (entries.length > 0 && !entries.some(e => {
            const p = e.prefix || '';
            return p && (ctx.path === p || ctx.path.startsWith(p.endsWith('/') ? p : p + '/'));
        }))
            return;

        // Strip leading dot from each path segment, but leave '..' alone
        const rewritten = ctx.path
            .split('/')
            .map(seg => (seg.startsWith('.') && !seg.startsWith('..')) ? seg.slice(1) : seg)
            .join('/');

        if (rewritten !== ctx.path) {
            console.log(`[dot-rewrite] ${ctx.path} → ${rewritten}`);
            ctx.path = rewritten; // Koa setter also updates ctx.req.url
        }
    }
};