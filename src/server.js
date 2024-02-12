const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const PORT = 3000;

// Utility function to determine response type
const getResponseType = (req) => {
  const accepts = req.headers["accept"];
  return accepts && accepts.includes("xml") ? "xml" : "json";
};

// Utility function to send JSON response
const sendJSONResponse = (res, statusCode, title, message) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ title, message }));
};

// Utility function to send XML response
const sendXMLResponse = (res, statusCode, title, message) => {
  res.writeHead(statusCode, { "Content-Type": "text/xml" });
  res.end(
    `<response><title>${title}</title><message>${message}</message></response>`
  );
};

// Function to serve the client.html file
const serveClientHtml = (res) => {
  const filePath = path.join(__dirname, "../client/client.html");
  fs.readFile(filePath, (err, content) => {
    if (err) {
      sendJSONResponse(res, 500, "Error", "Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content, "utf-8");
    }
  });
};

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname; // Correct variable to use for routing
  const query = parsedUrl.query;

  // Serve client.html on the root path
  if (pathname === "/") {
    serveClientHtml(res);
    return; // Stop further processing
  }

  // Determine response type
  const responseType = getResponseType(req);

  // Routing
  if (pathname === "/success") {
    const title = "Success";
    const message = "This is a successful response";
    responseType === "json"
      ? sendJSONResponse(res, 200, title, message)
      : sendXMLResponse(res, 200, title, message);
  } else if (pathname === "/badRequest") {
    const valid = query.valid === "true";
    const statusCode = valid ? 200 : 400;
    const title = valid ? "Success" : "Bad Request";
    const message = valid
      ? "This is a successful response"
      : "Missing valid query parameter set to true";
    responseType === "json"
      ? sendJSONResponse(res, statusCode, title, message)
      : sendXMLResponse(res, statusCode, title, message);
  } else if (pathname === "/unauthorized") {
    const loggedIn = query.loggedIn === "yes";
    const statusCode = loggedIn ? 200 : 401;
    const title = loggedIn ? "Success" : "Unauthorized";
    const message = loggedIn
      ? "This is a successful response"
      : "Missing loggedIn query parameter set to yes";
    responseType === "json"
      ? sendJSONResponse(res, statusCode, title, message)
      : sendXMLResponse(res, statusCode, title, message);
  } else if (pathname === "/forbidden") {
    const title = "Forbidden";
    const message = "You do not have access to this content.";
    responseType === "json"
      ? sendJSONResponse(res, 403, title, message)
      : sendXMLResponse(res, 403, title, message);
  } else if (pathname === "/internal") {
    const title = "Internal Server Error";
    const message = "Internal Server Error. Something went wrong.";
    responseType === "json"
      ? sendJSONResponse(res, 500, title, message)
      : sendXMLResponse(res, 500, title, message);
  } else if (pathname === "/notImplemented") {
    const title = "Not Implemented";
    const message =
      "A get request for this page has not been implemented yet. Check again later for updated content.";
    responseType === "json"
      ? sendJSONResponse(res, 501, title, message)
      : sendXMLResponse(res, 501, title, message);
  } else {
    const title = "Resource Not Found";
    const message = "The page you are looking for was not found.";
    responseType === "json"
      ? sendJSONResponse(res, 404, title, message)
      : sendXMLResponse(res, 404, title, message);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
