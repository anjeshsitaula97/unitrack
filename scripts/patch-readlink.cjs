// Node.js v24 on Windows: fs.readlink throws EISDIR on regular files instead of
// EINVAL. webpack's enhanced-resolve does not handle EISDIR, crashing builds.
// This preload remaps the error code so webpack's existing EINVAL handling works.
const fs = require("fs");
if (process.platform === "win32" && parseInt(process.versions.node) >= 24) {
  const _rs = fs.readlinkSync;
  fs.readlinkSync = function (p, o) {
    try {
      return _rs.call(fs, p, o);
    } catch (e) {
      if (e.code === "EISDIR") e.code = "EINVAL";
      throw e;
    }
  };
  const _r = fs.readlink;
  fs.readlink = function (p, o, cb) {
    if (typeof o === "function") {
      cb = o;
      o = undefined;
    }
    _r.call(fs, p, o, (err, res) => {
      if (err && err.code === "EISDIR") err.code = "EINVAL";
      if (cb) cb(err, res);
    });
  };
  const _pr = fs.promises.readlink;
  fs.promises.readlink = function (p, o) {
    return _pr.call(fs.promises, p, o).catch((e) => {
      if (e.code === "EISDIR") e.code = "EINVAL";
      throw e;
    });
  };
}
