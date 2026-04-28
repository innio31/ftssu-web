export default function handler(req, res) {
    res.status(200).json({
        success: true,
        version: '1.0.0',
        lastUpdated: '2026-04-28',
        forceUpdate: false
    });
}