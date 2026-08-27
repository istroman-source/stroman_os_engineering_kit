const minimumSecretBytes = 32;

function validSecret(secret) {
  return typeof secret === "string" && Buffer.byteLength(secret) >= minimumSecretBytes;
}

function validHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Read one secret from a terminal without echoing it or placing it in shell
 * history. This lets the worker launcher own its required setup rather than
 * failing after a user has already started the command.
 */
export async function readHiddenSecret({ stdin = process.stdin, stdout = process.stdout } = {}) {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error(
      "STROMAN_RECONSTRUCTION_WORKER_SECRET must be set to at least 32 bytes when the worker is started non-interactively.",
    );
  }

  stdout.write("Paste the Railway worker secret, then press Return: ");
  const wasRaw = stdin.isRaw;
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = "";

    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(Boolean(wasRaw));
      stdin.pause();
    };

    const finish = () => {
      cleanup();
      stdout.write("\n");
      resolve(value);
    };

    const cancel = () => {
      cleanup();
      stdout.write("\n");
      reject(new Error("Apple reconstruction worker setup cancelled."));
    };

    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u0003") return cancel();
        if (character === "\u0008" || character === "\u007f") {
          value = value.slice(0, -1);
        } else {
          value += character;
        }
      }
    };

    stdin.on("data", onData);
  });
}

export async function appleReconstructionWorkerLaunchConfig(environment, io) {
  const secret = validSecret(environment.STROMAN_RECONSTRUCTION_WORKER_SECRET)
    ? environment.STROMAN_RECONSTRUCTION_WORKER_SECRET
    : await readHiddenSecret(io);

  if (!validSecret(secret)) {
    throw new Error("STROMAN_RECONSTRUCTION_WORKER_SECRET must be set to at least 32 bytes.");
  }

  const appUrl = environment.STROMAN_RECONSTRUCTION_APP_URL;
  if (!validHttpsUrl(appUrl)) {
    throw new Error(
      "STROMAN_RECONSTRUCTION_APP_URL must be an HTTPS Stroman app URL for outbound worker mode.",
    );
  }

  return { appUrl, secret };
}
