export class AudioProcessor {
  downsampleBuffer(
    buffer: Float32Array,
    sampleRate: number,
    outSampleRate: number
  ): Float32Array {
    if (outSampleRate === sampleRate) return buffer;

    const ratio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);

    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
        let accum = 0;
        let count = 0;

        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
        }

        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }

    return result;
  }

    public convertFloat32ToInt16(buffer: Float32Array): ArrayBuffer {
        const l = buffer.length;
        const buf = new Int16Array(l);

        for (let i = 0; i < l; i++) {
            buf[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7fff;
        }

        return buf.buffer;
    }

    public convertFloat32Data(audioData: Buffer) {
        const safeLength = Math.floor(audioData.length / 2) * 2;
        const int16Data = new Int16Array(
            audioData.buffer.slice(
                audioData.byteOffset,
                audioData.byteOffset + safeLength
            )
        );

        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }
        return float32Data;
    }
}