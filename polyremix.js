let offset;
const container = document.getElementById("sectionContainer");
const rickrollBtn = document.getElementById("rickrollBtn");
const video = document.getElementById('video');

rickrollBtn.addEventListener('click', async () => {
  video.style.display = 'block';
  video.play();

  // Try to request fullscreen
  if (video.requestFullscreen) {
    await video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) { // Safari
    await video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) { // IE/Edge
    await video.msRequestFullscreen();
  }
});

container.addEventListener("dragstart", (e) => {
  const box = e.target.closest(".section-box");
  if (box) {
    e.dataTransfer.setData("text/plain", [...container.children].indexOf(box));
    e.dataTransfer.effectAllowed = "move";
  }
});

container.addEventListener("dragover", (e) => {
  e.preventDefault();
});

container.addEventListener("drop", (e) => {
  e.preventDefault();

  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
  const boxes = [...container.querySelectorAll(".section-box")];
  const fromBox = boxes[fromIndex];

  const toBox = e.target.closest(".section-box");
  if (!toBox || fromBox === toBox) return;

  const toIndex = boxes.indexOf(toBox);
  const insertBefore = fromIndex < toIndex ? toBox.nextSibling : toBox;
  container.insertBefore(fromBox, insertBefore);
});

document.getElementById("randomizeSectionsBtn").addEventListener("click", () => {
  const container = document.getElementById("sectionContainer");
  const boxes = Array.from(container.children);

  // Fisher-Yates shuffle
  for (let i = boxes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [boxes[i], boxes[j]] = [boxes[j], boxes[i]];
  }

  // Re-append in new order
  boxes.forEach(box => container.appendChild(box));
});

document.getElementById("riqFileInput").addEventListener("change", function() {
    fileInput = document.getElementById('riqFileInput');
    const file = fileInput.files[0];
    fileName = file.name;

    JSZip.loadAsync(file) // read the content of the .riq file
    .then(function(zip) {
        window.originalZip = zip; // save for later rebuild
        // Check if remix.json exists in the zip
        if (zip.file("remix.json")) {
            return zip.file("remix.json").async("string")
                .then(function(data) {
                    const cleanedData = data.replace(/^\ufeff/, '');
                    let remix = JSON.parse(cleanedData);
                    window.originalRemix = structuredClone(remix);
                    let sectionData;
                    [remix, sectionData] = modifyRemix(remix);
                    window.sectionData = sectionData;
                    zip.file("remix.json", JSON.stringify(remix, null, 4));

                    // Ensure folders exist
                    if (!zip.folder("Resources")) zip.folder("Resources");
                    if (!zip.folder("Resources/Sprites")) zip.folder("Resources/Sprites");

                    // Modify Sprites folder
                    //modifySprites(zip.folder("Resources/Sprites"));

                    // ✅ Load song.bin if present
                    if (zip.file("song.bin")) {
                        return zip.file("song.bin").async("uint8array").then(async function(songBytes) {
                            songBinData = songBytes;

                            // Convert to Blob and WAV
                            let wavBlob = await convertBinToWav(new Blob([songBinData]), false); // pass false to skip download
                            let buffer = await decodeWavBlobToAudioBuffer(wavBlob);

                            if (offset > 0) {
                                console.log(offset);
                                buffer = cutAudioBuffer(buffer, offset);
                            } else if (offset < 0) {
                              console.log(offset);
                              buffer = addSilenceToAudioBuffer(buffer, -offset);
                            }
                            wavBlob = encodeAudioBufferToWavBlob(buffer);
                        
                            createSections(wavBlob, sectionData);  

                            // Create object URL and assign to audio element
                            const audioURL = URL.createObjectURL(wavBlob);
                            const audioPlayer = document.getElementById("audioPlayer");
                            audioPlayer.src = audioURL;
                            audioPlayer.style.display = "block";
                            audioPlayer.play();

                            console.log("song.bin loaded and playing.");
                            return zip.generateAsync({ type: "blob" });
                        });
                    } else {
                        console.warn("song.bin not found in the archive.");
                        return zip.generateAsync({ type: "blob" });
                    }
                });
        } else {
            throw new Error("remix.json not found in the zip file.");
        }
    })
    .then(function(content) {
        modifiedContent = content;
        modifiedContent.name = `modified ${fileName}`;
    })
    .catch(function(err) {
        alert('Error modifying the file: ' + err.message);
        console.log(err.message);
    });
});

async function convertBinToWav(file, shouldDownload = true) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const type = detectAudioFormat(uint8);
  console.log("Detected type:", type);

    if (type === "raw") {
        const wavBuffer = encodeRawToWav(uint8, 44100, 1, 16);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        if (shouldDownload) downloadBlob(wavBlob, "output.wav");
        return wavBlob;
    } else {
        try {
            const context = new AudioContext();
            const decodedBuffer = await context.decodeAudioData(arrayBuffer);
            const wav = encodeDecodedAudioBuffer(decodedBuffer);
            const wavBlob = new Blob([wav], { type: "audio/wav" });
            if (shouldDownload) downloadBlob(wavBlob, "output.wav");
            return wavBlob;
        } catch (err) {
            alert("Failed to decode compressed audio: " + err);
        }
  }
}

function detectAudioFormat(bytes) {
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return "wav"; // "RIFF"
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return "mp3"; // "ID3"
  if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) return "mp3"; // MP3 frame
  if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return "ogg"; // "OggS"
  return "raw";
}

function modifyRemix(remix) {
    offset = remix["offset"]
    let sectionData = getRemixSectionTimings(remix)
    console.log(sectionData)
    return [remix, sectionData]
}


function encodeRawToWav(pcmBytes, sampleRate, channels, bitDepth) {
  const blockAlign = channels * bitDepth / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBytes.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, 44).set(pcmBytes);
  return buffer;
}

function encodeDecodedAudioBuffer(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = audioBuffer.getChannelData(ch)[i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return buffer;
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Decode WAV Blob to AudioBuffer
async function decodeWavBlobToAudioBuffer(wavBlob) {
  const arrayBuffer = await wavBlob.arrayBuffer();
  const context = new AudioContext();
  return await context.decodeAudioData(arrayBuffer);
}

// Cut a portion of an AudioBuffer
function cutAudioBuffer(audioBuffer, startSec, endSec = null) {
  if (!audioBuffer) throw new Error("No audio buffer provided.");

  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const duration = audioBuffer.duration;

  const safeStart = Math.max(0, startSec);
  const safeEnd = endSec !== null ? Math.min(endSec, duration) : duration;

  const startSample = Math.round(safeStart * sampleRate);
  const endSample = Math.round(safeEnd * sampleRate);
  const cutLength = Math.max(0, endSample - startSample);

  // If cut length is 0, return silent buffer
  const newBuffer = new AudioContext().createBuffer(numChannels, cutLength, sampleRate);

  if (cutLength === 0) return newBuffer;

  for (let ch = 0; ch < numChannels; ch++) {
    const oldData = audioBuffer.getChannelData(ch);
    const newData = newBuffer.getChannelData(ch);
    for (let i = 0; i < cutLength; i++) {
      newData[i] = oldData[startSample + i] || 0;
    }
  }

  return newBuffer;
}

// Encode AudioBuffer back to WAV Blob
function encodeAudioBufferToWavBlob(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = audioBuffer.getChannelData(ch)[i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

function addSilenceToAudioBuffer(audioBuffer, preSeconds = 0, postSeconds = 0) {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;

  const preSamples = Math.round(preSeconds * sampleRate);
  const postSamples = Math.round(postSeconds * sampleRate);
  const originalSamples = audioBuffer.length;

  const newLength = preSamples + originalSamples + postSamples;
  const newBuffer = new AudioContext().createBuffer(numChannels, newLength, sampleRate);

  for (let ch = 0; ch < numChannels; ch++) {
    const newData = newBuffer.getChannelData(ch);
    const oldData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < originalSamples; i++) {
      newData[preSamples + i] = oldData[i];
    }
  }

  return newBuffer;
}

function appendAudioBuffers(buffer1, buffer2) {
  const sampleRate = buffer1.sampleRate;
  const numChannels = buffer1.numberOfChannels;

  if (
    buffer2.sampleRate !== sampleRate ||
    buffer2.numberOfChannels !== numChannels
  ) {
    throw new Error("Buffers must have the same sample rate and number of channels");
  }

  const length = buffer1.length + buffer2.length;
  const newBuffer = new AudioContext().createBuffer(numChannels, length, sampleRate);

  for (let ch = 0; ch < numChannels; ch++) {
    const data1 = buffer1.getChannelData(ch);
    const data2 = buffer2.getChannelData(ch);
    const combined = newBuffer.getChannelData(ch);

    combined.set(data1, 0);
    combined.set(data2, data1.length); // append second buffer after first
  }

  return newBuffer;
}

function getRemixSectionTimings(remix) {
  const tempoChanges = remix["tempoChanges"] || [];
  const volumeChanges = remix["volumeChanges"] || [];
  const entities = remix["entities"] || [];
  const sections = [...remix["beatmapSections"]].sort((a, b) => a.beat - b.beat);

  if (!tempoChanges.length || !sections.length) return [];

  const endEntity = entities.find(e => e.datamodel === "gameManager/end");
  const finalBeat = endEntity ? endEntity.beat : sections[sections.length - 1].beat + 4;

  const tempoAnchorTimeMap = new Map();
  tempoAnchorTimeMap.set(tempoChanges[0].beat, 0);

  for (let i = 1; i < tempoChanges.length; i++) {
    const prev = tempoChanges[i - 1];
    const curr = tempoChanges[i];
    const secondsPerBeat = 60 / prev.dynamicData.tempo;
    const prevTime = tempoAnchorTimeMap.get(prev.beat);
    tempoAnchorTimeMap.set(curr.beat, prevTime + (curr.beat - prev.beat) * secondsPerBeat);
  }

  function getTimeForBeat(beat) {
    let anchor = tempoChanges[0];
    for (const t of tempoChanges) {
      if (t.beat <= beat) anchor = t;
      else break;
    }
    const anchorTime = tempoAnchorTimeMap.get(anchor.beat);
    const secondsPerBeat = 60 / anchor.dynamicData.tempo;
    return anchorTime + (beat - anchor.beat) * secondsPerBeat;
  }

  const result = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const startBeat = section.beat;
    const endBeat = i + 1 < sections.length ? sections[i + 1].beat : finalBeat;
    const lengthInBeats = endBeat - startBeat;
    const startTime = getTimeForBeat(startBeat);
    const endTime = getTimeForBeat(endBeat);

    const isInSection = obj => obj.beat >= startBeat && obj.beat < endBeat;

    const absoluteEntities = entities.filter(isInSection).map(e => structuredClone(e));
    const absoluteTempoChanges = tempoChanges.filter(isInSection).map(t => structuredClone(t));
    const absoluteVolumeChanges = volumeChanges.filter(isInSection).map(v => structuredClone(v));

    const relativeEntities = absoluteEntities.map(e => ({
      ...structuredClone(e),
      beat: e.beat - startBeat
    }));

    const relativeTempoChanges = absoluteTempoChanges.map(t => ({
      ...structuredClone(t),
      beat: t.beat - startBeat
    }));

    const relativeVolumeChanges = absoluteVolumeChanges.map(v => ({
      ...structuredClone(v),
      beat: v.beat - startBeat
    }));

    // Ensure tempo/volume change at relative beat 0
    const hasStartTempo = relativeTempoChanges.some(t => Math.abs(t.beat) < 1e-6);
    const hasStartVolume = relativeVolumeChanges.some(v => Math.abs(v.beat) < 1e-6);

    const activeTempo = [...tempoChanges].filter(t => t.beat <= startBeat).pop();
    const activeVolume = [...volumeChanges].filter(v => v.beat <= startBeat).pop();

    if (!hasStartTempo && activeTempo) {
      const injected = structuredClone(activeTempo);
      injected.beat = startBeat;
      absoluteTempoChanges.unshift(injected);

      relativeTempoChanges.unshift({
        ...structuredClone(activeTempo),
        beat: 0
      });
    }

    if (!hasStartVolume && activeVolume) {
      const injected = structuredClone(activeVolume);
      injected.beat = startBeat;
      absoluteVolumeChanges.unshift(injected);

      relativeVolumeChanges.unshift({
        ...structuredClone(activeVolume),
        beat: 0
      });
    }

    result.push({
      name: section.dynamicData?.sectionName || `Section ${i + 1}`,
      originalStartBeat: startBeat,
      lengthInBeats,
      startTime: parseFloat(startTime.toFixed(6)),
      endTime: parseFloat(endTime.toFixed(6)),

      relativeEntities,
      relativeTempoChanges,
      relativeVolumeChanges,

      absoluteEntities,
      absoluteTempoChanges,
      absoluteVolumeChanges
    });
  }

  return result;
}

function createAudioPlayerFromWavBlob(wavBlob) {

  // Create new audio element
  const audio = document.createElement("audio");
  audio.id = `dynamicAudioPlayer-${Math.random().toString(36).slice(2)}`;
  audio.controls = true;
  audio.src = URL.createObjectURL(wavBlob);
  audio.style.display = "block";

  // Append to body
  document.body.appendChild(audio);
}

function createDraggableSectionBox(sectionBlob, sectionData, index) {
  const container = document.createElement("div");
  container.className = "section-box";
  container.setAttribute("draggable", "true");

  // ✅ Attach sectionData directly
  container.sectionInfo = sectionData;

  const label = document.createElement("div");
  label.textContent = sectionData.name || `Section ${index + 1}`;
  label.style.fontWeight = "bold";

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = URL.createObjectURL(sectionBlob);

  const meta = document.createElement("div");
  meta.textContent = `Beats ${sectionData.originalStartBeat}–${sectionData.originalStartBeat + sectionData.lengthInBeats}`;

  // Duplicate button
  const duplicateBtn = document.createElement("button");
  duplicateBtn.textContent = "⧉";
  duplicateBtn.title = "Duplicate section";
  duplicateBtn.style.fontSize = "10px";
  duplicateBtn.style.alignSelf = "flex-end";
  duplicateBtn.style.marginTop = "4px";
  duplicateBtn.addEventListener("click", () => {
    createDraggableSectionBox(sectionBlob, structuredClone(sectionData), window.sectionData.length);
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.title = "Delete section";
  deleteBtn.style.fontSize = "10px";
  deleteBtn.style.alignSelf = "flex-end";
  deleteBtn.style.marginTop = "4px";
  deleteBtn.style.marginLeft = "4px";
  deleteBtn.addEventListener("click", () => {
    container.remove();
  });

  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.justifyContent = "flex-end";
  buttonRow.style.gap = "4px";

  buttonRow.appendChild(duplicateBtn);
  buttonRow.appendChild(deleteBtn);
  container.appendChild(buttonRow);
  container.appendChild(label);
  container.appendChild(audio);
  container.appendChild(meta);

  document.getElementById("sectionContainer").appendChild(container);
}

async function createSections(blob, sectionDataArray) {
  const song = await decodeWavBlobToAudioBuffer(blob);
  window.sectionData = [];

  for (let i = 0; i < sectionDataArray.length; i++) {
    const section = sectionDataArray[i];
    const expectedLengthSec = section.endTime - section.startTime;
    let songSlice = cutAudioBuffer(song, section.startTime, section.endTime);

    // If the audio is too short, pad with silence
    const actualLengthSec = songSlice.length / songSlice.sampleRate;
    if (actualLengthSec < expectedLengthSec - 0.001) {
      const silenceNeeded = expectedLengthSec - actualLengthSec;
      songSlice = addSilenceToAudioBuffer(songSlice, 0, silenceNeeded);
    }

    const sectionBlob = encodeAudioBufferToWavBlob(songSlice);
    createDraggableSectionBox(sectionBlob, section, i);
    window.sectionData.push(section);
  }
}

async function reconstructSong() {
  const boxes = Array.from(document.querySelectorAll("#sectionContainer .section-box"));

  const audioBuffers = [];
for (const box of boxes) {
  const index = parseInt(box.dataset.index, 10);
  const sectionData = window.sectionData[index];

  const sectionLength = sectionData.lengthInBeats;

  const audio = box.querySelector("audio");
  const response = await fetch(audio.src);
  const blob = await response.blob();
  const buffer = await decodeWavBlobToAudioBuffer(blob);

  if (!fullBuffer) {
    fullBuffer = buffer;
  } else {
    fullBuffer = appendAudioBuffers(fullBuffer, buffer);
  }
}
  // Stitch all buffers
  let finalBuffer = audioBuffers[0];
  for (let i = 1; i < audioBuffers.length; i++) {
    finalBuffer = appendAudioBuffers(finalBuffer, audioBuffers[i]);
  }

  const finalBlob = encodeAudioBufferToWavBlob(finalBuffer);
  createAudioPlayerFromWavBlob(finalBlob);
  downloadBlob(finalBlob, "remix_output.wav");
}

async function rebuildRIQ(originalZip, remixOriginal) {
  const boxes = Array.from(document.querySelectorAll("#sectionContainer .section-box"));
  if (!boxes.length) {
    alert("No sections found to rebuild.");
    return;
  }

  console.log("Section order being used:");
  boxes.forEach(box => {
    const index = parseInt(box.dataset.index, 10);
    console.log(index, box.sectionInfo.name);
  });


  const allEntities = [];
  const allTempos = [];
  const allVolumes = [];
  const allSections = [];
  const buffers = [];

  let currentBeat = 0;

  for (const box of boxes) {
    const sectionData = box.sectionInfo;

    const sectionLength = sectionData.lengthInBeats;

    // Load audio
    const audio = box.querySelector("audio");
    const blob = await fetch(audio.src).then(res => res.blob());
    const buffer = await decodeWavBlobToAudioBuffer(blob);
    if (buffer) buffers.push(buffer);

    const shift = (obj) => {
      const shifted = structuredClone(obj);
      shifted.beat = obj.beat - sectionData.originalStartBeat + currentBeat;
      return shifted;
    };

    allEntities.push(...sectionData.absoluteEntities.map(shift));
    allTempos.push(...sectionData.absoluteTempoChanges.map(shift));
    allVolumes.push(...sectionData.absoluteVolumeChanges.map(shift));

    allSections.push({
      type: "riq__SectionMarker",
      version: 0,
      datamodel: "global/section marker",
      beat: currentBeat,
      length: 0,
      dynamicData: {
        sectionName: sectionData.name,
        startPerfect: false,
        weight: 2,
        category: 0
      }
    });

    currentBeat += sectionLength;
  }

  // Add end entity
  allEntities.push({
    type: "riq__Entity",
    version: 0,
    datamodel: "gameManager/end",
    beat: currentBeat,
    length: 0.5,
    dynamicData: { track: 0 }
  });

  // Stitch audio
  let fullBuffer = null;
  for (const buf of buffers) {
    fullBuffer = fullBuffer ? appendAudioBuffers(fullBuffer, buf) : buf;
  }

  if (!fullBuffer) {
    alert("AudioBuffer reconstruction failed.");
    return;
  }

  const wavBlob = encodeAudioBufferToWavBlob(fullBuffer);
  downloadBlob(wavBlob, "convert_to_ogg.wav");
  const oggBlob = await encodeWavToOggBlob(wavBlob);
  const songBin = await oggBlob.arrayBuffer();

  // Build new zip
  const newZip = new JSZip();
  const resources = originalZip.folder("Resources");
  if (resources) {
    await Promise.all(Object.keys(resources.files).map(async path => {
      const file = resources.files[path];
      if (!file.dir) {
        const content = await file.async("uint8array");
        newZip.file(path, content);
      }
    }));
  }

  const newRemix = structuredClone(remixOriginal);
  newRemix.entities = allEntities.sort((a, b) => a.beat - b.beat);
  newRemix.tempoChanges = allTempos.sort((a, b) => a.beat - b.beat);
  newRemix.volumeChanges = allVolumes.sort((a, b) => a.beat - b.beat);
  newRemix.beatmapSections = allSections;

  newZip.file("remix.json", JSON.stringify(newRemix, null, 2));
  newZip.file("song.bin", new Uint8Array(songBin));

  const rebuiltBlob = await newZip.generateAsync({ type: "blob" });
  downloadBlob(rebuiltBlob, "rebuilt_remix.riq");
}

async function encodeWavToOggBlob(wavBlob) {
  // For now, just return WAV and pretend it's OGG
  console.warn("Using fallback encodeWavToOggBlob – not actual OGG");
  return wavBlob;
}

function convertAudioBufferToPCM(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numChannels;
    const result = new Float32Array(length);
    
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
            result[j * numChannels + i] = channelData[j];
        }
    }
    
    return result;
}

function createOggBlob(pcmData, sampleRate, channels) {
    console.log('[OGG Creation] Creating simple OGG container');
    
    // Create a minimal valid OGG header (44 bytes)
    const header = new Uint8Array([
        0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff,
        0x01, 0x1e, 0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, 0x01, 0x02,
        0x38, 0x01, 0x80, 0xbb, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    // Combine header with PCM data
    const combined = new Uint8Array(header.length + pcmData.length);
    combined.set(header);
    combined.set(pcmData, header.length);
    
    return new Blob([combined], { type: 'audio/ogg' });
}
function refreshSectionBoxIndices() {
  const boxes = document.querySelectorAll("#sectionContainer .section-box");
  boxes.forEach((box, i) => {
    box.dataset.index = i;
  });
}

