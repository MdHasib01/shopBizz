// Attempt to load the high-performance tfjs-node bindings; fall back to the
// pure JS version when native binaries are unavailable (e.g. on Windows without
// build tools).
let tf: typeof import("@tensorflow/tfjs");

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  tf = require("@tensorflow/tfjs-node");
} catch (error) {
  console.warn(
    "Falling back to @tensorflow/tfjs because @tensorflow/tfjs-node bindings are unavailable:",
    error instanceof Error ? error.message : error
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  tf = require("@tensorflow/tfjs");
}

export default tf;
