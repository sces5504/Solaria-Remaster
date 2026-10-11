import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
const context = canvas?.getContext("2d");
if (!canvas || !context) throw new Error("無法初始化遊戲畫布");

context.fillStyle = "#101d23";
context.fillRect(0, 0, canvas.width, canvas.height);
context.fillStyle = "#efce86";
context.font = "32px Georgia";
context.textAlign = "center";
context.fillText("SOLARIA", canvas.width / 2, canvas.height / 2);
