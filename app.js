import { readFile, writeFile, mkdir } from "fs/promises";
import { createServer } from "http";
import path from "path";
import crypto from "crypto";

const PORT = 3000;

const DATA_FILE = path.join("data", "links.json");

const serverFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile (filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 page not found");
    }
};


const loadLinks = async () => {
    try {
        // Ensure the `data` directory exists
        await mkdir(path.dirname(DATA_FILE), { recursive: true });

        const data = await readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if(error.code === "ENOENT"){
            await writeFile(DATA_FILE, JSON.stringify({}), "utf-8");
            return {};
        }
        throw error;
    }
};


const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links));
};


const server = createServer(async (req, res) => {
    if (req.method === "GET") {
        if (req.url === "/") {
            return serverFile(res, path.join("public", "index.html"), "text/html")
        } else if (req.url === "/style.css") {
            return serverFile(res, path.join("public", "style.css"), "text/css")
        } else if (req.url === "/links") {
            const links = await loadLinks();

            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(links));
        } else {
            const links = await loadLinks();
            const shortCode = req.url.slice(1);
            console.log("links redirection: ", req.url);

            if(links[shortCode]){
                res.writeHead(302, {location: links[shortCode]});
                return res.end();
            }

                res.writeHead(400, { "Content-Type": "text/plain" });
                return res.end("Shortened Url is not found");
        }
    }

    if (req.method === "POST" && req.url === "/shorten") {
        const links = await loadLinks();
    
        let data = "";
        req.on("data", (chunk) => (data += chunk)); 
    
        req.on("end", async () => { 
            try {
                console.log(data);
                const { url, shortcode } = JSON.parse(data);
    
                if (!url) {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    return res.end("URL is required");
                }
    
                const finalShortCode = shortcode || crypto.randomBytes(4).toString("hex");
    
                if (links[finalShortCode]) {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    return res.end("Short code already exists. Please choose another.");
                }
    
                links[finalShortCode] = url;
    
                await saveLinks(links);
    
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, shortcode: finalShortCode }));
            } catch (error) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server error: " + error.message);
            }
        });
    }
});


server.listen(PORT, () => {
    console.log(`Connected to PORT ${PORT}`);
});