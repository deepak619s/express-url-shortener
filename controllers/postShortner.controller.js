// import { readFile } from "fs/promises";
// import path from "path";
import crypto from "crypto";
import { loadLinks, saveLinks } from "../models/shortener.model.js";

export const getShortnerPage = async (req, res) => {
    try {
        // const file = await readFile(path.join("views", "index.html"));
        const links = await loadLinks();

        return res.render("index.ejs", { links, host: req.host});
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};


export const postURLShortner = async (req, res) => {
    try {
        const { url, shortcode } = req.body;
        const finalShortCode = shortcode || crypto.randomBytes(4).toString("hex");

        const links = await loadLinks();

        if (links[finalShortCode]) {
            res.status(400).send("Short code already exists. Please choose another.");
        }

        links[finalShortCode] = url;
    
        await saveLinks(links);
        return res.redirect("/");

    } catch (error) {
        console.log(error);
        res.status(200).send("Server error: " + error.message);
    }
};


export const redirectToShort = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const links = await loadLinks();

        if(!links[shortCode]) {
            return res.status(400).send("404 error occured");
        }

        return res.redirect(links[shortCode]);
    } catch (error) {
        return res.status(500).send("Internal server error");
    }
};