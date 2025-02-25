import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";


export const DATA_FILE = path.join("data", "links.json");


export const loadLinks = async () => {
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


export const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links));
};