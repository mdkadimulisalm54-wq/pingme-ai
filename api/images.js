const POLLINATIONS_API_KEY =
  process.env.POLLINATIONS_API_KEY;

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      prompt,
      model = "flux",
      width = 1024,
      height = 1024
    } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Image prompt is required"
      });
    }

    if (!POLLINATIONS_API_KEY) {
      return res.status(500).json({
        error: "Pollinations API key is not configured"
      });
    }

    const imageUrl =
      "https://gen.pollinations.ai/image/" +
      encodeURIComponent(prompt) +
      "?model=" +
      encodeURIComponent(model) +
      "&width=" +
      width +
      "&height=" +
      height;

    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        "Authorization":
          `Bearer ${POLLINATIONS_API_KEY}`
      }
    });

    if (!response.ok) {

      const errorText =
        await response.text();

      return res.status(
        response.status
      ).json({
        error:
          errorText ||
          "Image generation failed"
      });
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "image/png";

    const imageBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    res.setHeader(
      "Content-Type",
      contentType
    );

    return res.status(200).send(
      imageBuffer
    );

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}