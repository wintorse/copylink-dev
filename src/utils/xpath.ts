export function evaluateXPath(
  xpath: string,
  contextNode: Node = document
): HTMLElement | null {
  return document.evaluate(
    xpath,
    contextNode,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as HTMLElement | null;
}
