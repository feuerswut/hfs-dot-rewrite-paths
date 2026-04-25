exports.version = 1.0;
exports.description = "Rewrites request paths by stripping leading dots from path segments (e.g. /.file → /file)";
exports.apiRequired = 8.65;
exports.author = "Feuerswut";
exports.repo = "Feuerswut/hfs-DotRewritePaths";

exports.config = {
    paths: {
        type: 'array',
        defaultValue: [],
        helperText: 'Apply rewriting only under these path prefixes (e.g. /files, /public). Leave empty to apply to all paths.',
    },
};

exports.init = api => {
    return { middleware };

    function middleware(ctx) {
        const prefixes = api.getConfig('paths') || [];

        // If a whitelist is configured, skip requests outside those prefixes
        if (prefixes.length > 0 && !prefixes.some(p => ctx.path === p || ctx.path.startsWith(p.endsWith('/') ? p : p + '/')))
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