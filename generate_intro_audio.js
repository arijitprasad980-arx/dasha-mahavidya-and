const fs = require('fs');

const sampleRate = 22050;
const durationSeconds = 8;
const amplitude = 0.35;
const totalSamples = sampleRate * durationSeconds;
const buffer = Buffer.alloc(44 + totalSamples * 2);

const writeString = (offset, str) => {
  for (let i = 0; i < str.length; i += 1) {
    buffer.writeUInt8(str.charCodeAt(i), offset + i);
  }
};

writeString(0, 'RIFF');
writeString(8, 'WAVE');
writeString(12, 'fmt ');
writeString(36, 'data');

buffer.writeUInt32LE(36, 40);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.writeUInt32LE(totalSamples * 2, 40);

let offset = 44;
for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  let val = 0.45 * Math.sin(2 * Math.PI * 220 * t);
  val += 0.25 * Math.sin(2 * Math.PI * 329.63 * t);
  val += 0.18 * Math.sin(2 * Math.PI * 261.63 * t);
  val *= 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.22 * t);
  val *= amplitude;
  const sample = Math.max(-1, Math.min(1, val));
  const pcm = Math.round(sample * 32767);
  buffer.writeInt16LE(pcm, offset);
  offset += 2;
}


