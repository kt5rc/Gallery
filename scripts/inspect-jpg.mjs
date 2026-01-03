import exifr from "exifr";

const file = "public/gallery/00130-784860676.jpg"; // 実際のファイル名

const data = await exifr.parse(file, {
  userComment: true,
});

const raw = data.userComment;

let text = "";
if (raw instanceof Uint8Array) {
  // 先頭の "UNICODE\0" を除去して UTF-16LE でデコード
  const slice = raw.slice(8);
  text = new TextDecoder("utf-8").decode(slice);
} else if (typeof raw === "string") {
  text = raw;
}

console.log("---- decoded parameters ----");
console.log(text);
console.log("---- end ----");
