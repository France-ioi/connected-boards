import { MicropythonFsHex, microbitBoardId } from "@microbit/microbit-fs";

export async function convertToHex(userCode) {
  const microPythonV1HexFile = await downloadFileContent('https://static-items.algorea.org/files/checkouts/16ac8eb4d2b901e8abe47434462e9a21/microbit-firmware/micropython-microbit-v1.0.hex');
  const microPythonV2HexFile = await downloadFileContent('https://static-items.algorea.org/files/checkouts/16ac8eb4d2b901e8abe47434462e9a21/microbit-firmware/micropython-microbit-v2.1.1.hex');

  const micropythonFs = new MicropythonFsHex([
    { hex: microPythonV1HexFile, boardId: microbitBoardId.V1 },
    { hex: microPythonV2HexFile, boardId: microbitBoardId.V2 },
  ]);

  await micropythonFs.write('main.py', userCode);

  return micropythonFs.getUniversalHex();
}

export async function downloadFileContent(path) {
  const response = await fetch(path);

  return (await response.text()) as string;
}
