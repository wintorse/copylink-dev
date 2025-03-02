/**
 * Evaluates an XPath query and returns the first element that matches the query.
 *
 * @param xpath
 * @param contextNode
 * @returns HTMLElement | null
 */
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
