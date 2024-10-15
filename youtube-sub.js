// write a node.js script that reads a markdown file with the list of youtube channels and then
// it fetches the number of subscribers for each channel and prints the result
// the markdown file from this format
// <input-file>
// ## Creators
// - Act of Learning
//   - [YouTube](https://www.youtube.com/channel/UCofF7Mp_VtoOZ9rhl_ueX7g)
//   - [Twitter](https://twitter.com/muthuveerappanr)
// </input-file>
// and outputs a markdown file with the number of subscribers for each channel
// <output-file>
// ## Creators
// - Act of Learning
//   - [YouTube](https://www.youtube.com/channel/UCofF7Mp_VtoOZ9rhl_ueX7g) -- 1000 subscribers
//   - [Twitter](https://twitter.com/muthuveerappanr)
// </output-file>

const fs = require("fs");
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  throw new Error("YOUTUBE_API_KEY is not set");
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile) {
  throw new Error("Usage: node youtube-sub.js <input-file> [output-file]");
}

async function fetchSubscribers(channelUrl) {
  const channelIdOrHandle = channelUrl.split("/").pop();

  let apiUrl = "";
  console.log("channelIdOrHandle", channelIdOrHandle);
  if (channelIdOrHandle.includes("@")) {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${channelIdOrHandle}&key=${YOUTUBE_API_KEY}`;
  } else {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIdOrHandle}&key=${YOUTUBE_API_KEY}`;
  }

  try {
    const response = await axios.get(apiUrl);
    return response.data.items[0].statistics.subscriberCount;
  } catch (error) {
    console.error(`Error fetching data for ${apiUrl}:`, error);
    return "N/A";
  }
}

// Function to read markdown file and process channels
async function processMarkdown(inputFile, outputFile) {
  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data.split("\n");
  const outputLines = [];

  for (const line of lines) {
    if (line.includes("youtube.com")) {
      const match = line.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        // console.log(match);
        const channelUrl = match[2];
        const subscriberCount = await fetchSubscribers(channelUrl);
        if (subscriberCount !== "N/A") {
          outputLines.push(`${line} -- ${subscriberCount} subscribers`);
        } else {
          outputLines.push(line);
        }
      } else {
        outputLines.push(line);
      }
      // break;
    } else {
      outputLines.push(line);
    }
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, outputLines.join("\n"), "utf8");
  } else {
    // print to console
    console.log(outputLines.join("\n"));
  }
}

processMarkdown(inputFile, outputFile)
  .then(() => console.log("Markdown file processed successfully."))
  .catch((err) => console.error("Error processing markdown file:", err));
