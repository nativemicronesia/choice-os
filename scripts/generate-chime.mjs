// Synthesizes a short two-tone "new order" chime as a 16-bit mono PCM WAV.
// No dependencies — hand-writes the WAV header and raw samples. Run once;
// the output (public/chime.wav) is committed, this script is just how it
// was produced / how to regenerate it.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tone(freqHz, durationMs, amplitude = 0.5) {
  const sampleCount = Math.floor((durationMs / 1000) * SAMPLE_RATE);
  const samples = new Int16Array(sampleCount);
  const fadeSamples = Math.floor(0.005 * SAMPLE_RATE); // 5ms fade in/out

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;
    let envelope = 1;
    if (i < fadeSamples) envelope = i / fadeSamples;
    else if (i > sampleCount - fadeSamples) envelope = (sampleCount - i) / fadeSamples;

    const value = Math.sin(2 * Math.PI * freqHz * t) * amplitude * envelope;
    samples[i] = Math.max(-1, Math.min(1, value)) * 32767;
  }
  return samples;
}

function concatInt16(chunks) {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function writeWavFile(filePath, samples) {
  const dataSize = samples.length * 2; // 16-bit = 2 bytes/sample
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataSize, 40);

  const dataBuffer = Buffer.from(samples.buffer, samples.byteOffset, dataSize);
  writeFileSync(filePath, Buffer.concat([header, dataBuffer]));
}

const chime = concatInt16([tone(880, 120), tone(1320, 150)]);
const outPath = path.join(__dirname, "..", "public", "chime.wav");
writeWavFile(outPath, chime);
console.log(`Wrote ${outPath}`);
