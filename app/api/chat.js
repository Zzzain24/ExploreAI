// api/chat.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { prompt } = req.body[0];
      // Your logic to handle the chat request
      const response = {
        results: [{ text: `Response to: ${prompt}` }],
      };
      res.status(200).json(response);
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }