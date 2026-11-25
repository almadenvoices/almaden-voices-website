/**
 * Shrinks the photos in the finished build so visitors never download a
 * camera-sized original.
 *
 * Runs automatically after `npm run build` (it is the "postbuild" script), on
 * the copies in build/images. The files in public/images are never touched.
 *
 * Any photo wider or taller than 1600px is scaled down to fit (never cropped,
 * never enlarged), and every photo is re-saved in its own format at web quality.
 * The result only replaces the original if it is actually smaller, and the
 * filename and format never change, so no page needs editing.
 *
 * New photos should still be added as WebP (see the note in
 * client/src/data/ourWork.js) with the original kept in /media-originals. This
 * script is the safety net, and also keeps big files from slipping through.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(__dirname, "..", "build", "images");
const MAX_SIDE = 1600;
const WARN_BYTES = 500 * 1024;

const encoders = {
    ".jpg": img => img.jpeg({ quality: 80, mozjpeg: true }),
    ".jpeg": img => img.jpeg({ quality: 80, mozjpeg: true }),
    ".png": img => img.png({ compressionLevel: 9, palette: true, quality: 85 }),
    ".webp": img => img.webp({ quality: 80, effort: 6 }),
};

const kb = bytes => `${Math.round(bytes / 1024)}KB`;

async function optimize(file) {
    const encode = encoders[path.extname(file).toLowerCase()];
    if (!encode) return null;

    const before = fs.statSync(file).size;
    const output = await encode(
        sharp(file)
            .rotate() // apply the phone's orientation flag before it is stripped
            .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    ).toBuffer();

    if (output.length < before) {
        fs.writeFileSync(file, output);
        return { before, after: output.length };
    }
    return { before, after: before };
}

async function main() {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.log("optimize-images: no build/images folder, nothing to do.");
        return;
    }

    let saved = 0;
    const stillBig = [];
    for (const name of fs.readdirSync(IMAGES_DIR)) {
        const file = path.join(IMAGES_DIR, name);
        if (!fs.statSync(file).isFile()) continue;
        try {
            const result = await optimize(file);
            if (!result) continue;
            saved += result.before - result.after;
            if (result.after < result.before) {
                console.log(`optimize-images: ${name} ${kb(result.before)} -> ${kb(result.after)}`);
            }
            if (result.after > WARN_BYTES) stillBig.push(`${name} (${kb(result.after)})`);
        } catch (err) {
            // A photo that can't be read is shipped as it is rather than failing the deploy.
            console.warn(`optimize-images: skipped ${name}: ${err.message}`);
        }
    }

    console.log(`optimize-images: saved ${kb(saved)} in total.`);
    if (stillBig.length) {
        console.warn(`optimize-images: still over ${kb(WARN_BYTES)}: ${stillBig.join(", ")}`);
    }
}

main().catch(err => {
    console.error("optimize-images failed:", err);
    process.exit(1);
});
