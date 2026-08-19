export async function resolve(specifier, context, nextResolve) {
  if (specifier !== "js-yaml") {
    return nextResolve(specifier, context);
  }

  const resolved = await nextResolve(specifier, context);
  return {
    url: `js-yaml-default:${encodeURIComponent(resolved.url)}`,
    shortCircuit: true,
  };
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith("js-yaml-default:")) {
    return nextLoad(url, context);
  }

  const originalUrl = decodeURIComponent(url.slice("js-yaml-default:".length));
  return {
    format: "module",
    shortCircuit: true,
    source: `
      import * as yaml from ${JSON.stringify(originalUrl)};
      export * from ${JSON.stringify(originalUrl)};
      export default yaml;
    `,
  };
}