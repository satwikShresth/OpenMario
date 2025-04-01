import firstData from "./ins.json" with { type: "json" };
import secondData from "./rmp.json" with { type: "json" };

/**
 * Merges two JSON files based on matching IDs
 */
export async function mergeJsonById(
  firstFilePath,
  secondFilePath,
  outputFilePath,
) {
  const lookup = Object.fromEntries(secondData.map((item) => [item.id, item]));

  const nullTemplate = Object.fromEntries(
    Object.keys(secondData[0] || {})
      .filter((key) => key !== "id")
      .map((key) => [key, null]),
  );

  // Map first data with matches from second data, but always keep name from first object
  const result = firstData.map((item) => {
    const matchedItem = lookup[item.id];
    if (matchedItem) {
      // Create a copy of matched item without the name field
      const { name, ...matchedWithoutName } = matchedItem;
      return {
        ...matchedWithoutName,
        ...item,
      };
    } else {
      return {
        ...nullTemplate,
        ...item,
      };
    }
  });
  // Write result to output file
  await Deno.writeTextFile(outputFilePath, JSON.stringify(result, null, 2));
  return result;
}
// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [first, second, output] = process.argv.slice(2);
  mergeJsonById(
    first || "first.json",
    second || "second.json",
    output || "merged.json",
  )
    .then(() => console.log("Files merged successfully!"))
    .catch((err) => console.error("Error:", err));
}
