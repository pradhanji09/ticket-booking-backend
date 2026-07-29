function requireIdempotencyKey(req, res, next) {
  const key = req.headers["idempotency-key"];
  if (!key) {
    return res
      .status(400)
      .json({ success: false, error: "Idempotency-Key header is required" });
  }
  req.idempotencyKey = key;
  next();
}

module.exports = requireIdempotencyKey;
