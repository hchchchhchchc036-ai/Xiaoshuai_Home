import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicAssets = resolve(projectRoot, "public", "assets");
const mirroredAssets = resolve(
	projectRoot,
	"src",
	"assets",
	"public",
	"assets",
);
const musicCoverOutput = resolve(
	projectRoot,
	"src",
	"assets",
	"music",
	"cover",
);

for (const directory of ["desktop-banner", "mobile-banner"]) {
	const targetDirectory = resolve(mirroredAssets, directory);
	await mkdir(targetDirectory, { recursive: true });
	for (let index = 1; index <= 4; index += 1) {
		await cp(
			resolve(publicAssets, directory, `${index}.webp`),
			resolve(targetDirectory, `${index}.webp`),
		);
	}
}

await mkdir(musicCoverOutput, { recursive: true });
for (const name of ["cl", "dazbee", "hitori", "xryx"]) {
	const source = resolve(publicAssets, "music", "cover", `${name}.webp`);
	const target = resolve(musicCoverOutput, `${name}.webp`);
	const metadata = await sharp(source).metadata();

	if ((metadata.width ?? 0) <= 192 && (metadata.height ?? 0) <= 192) {
		await cp(source, target);
	} else {
		await sharp(source)
			.resize(192, 192, { fit: "cover", position: "centre" })
			.webp({ quality: 85 })
			.toFile(target);
	}
}

const personalMirror = resolve(projectRoot, "src/assets/public/images/personal");
await mkdir(personalMirror, { recursive: true });
for (const name of ["avatar.jpg", ...[1, 2, 3, 4].map((i) => `background-${i}-ai.webp`)]) {
	await cp(resolve(projectRoot, "public/images/personal", name), resolve(personalMirror, name));
}
console.log("Prepared mirrored banners, personal images and player-sized music covers.");
