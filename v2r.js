//Last Change: Optimized block length
//Main Section
let modifiedContent = null; // This will hold the modified blob
let fileName = "";
let trackNumber;
let pitchShift;
let beatOffset;
let msOffset;
let frameList = [];
let imageIndexList = [];
let tempEntities = [];
const errorText = "Bakawi messed up somehow \nSend him this error message: \n";

window.onload = applySavedTheme;
window.onerror = (e) => alert(errorText + e.stack);

document.getElementById("videoBGColor").addEventListener("change", updateVideoEditorBackground);

document.getElementById("themeToggleButton").addEventListener("click", () => {
    const root = document.documentElement;

    if (root.classList.contains("dark-mode")) {
        root.classList.remove("dark-mode");
        document.getElementById("videoBGColor").value = "#ffffff"; // Default to white for light mode
        saveThemeToLocalStorage("light"); // Save as light mode
    } else {
        root.classList.add("dark-mode");
        document.getElementById("videoBGColor").value = "#000000"; // Default to black for dark mode
        saveThemeToLocalStorage("dark"); // Save as dark mode
    }
    updateVideoEditorBackground();
});

document.getElementById('chromaKeyToggle').addEventListener('change', () => {
    try {
        document.getElementById('chromaKeyColor').disabled = !document.getElementById('chromaKeyToggle').checked;
    } catch (e) {
        alert(errorText + e.stack)
    }
});

document.getElementById('easing').addEventListener('change', (e) => {
    const easing = e.target.value
    if (easing != 1) {
        document.getElementById('startOptions').style.display = "block"
    } else {
        document.getElementById('startOptions').style.display = "none"
    }
});

document.getElementById('lengthToggle').addEventListener('change', () => {
    if (document.getElementById('lengthToggle').checked) {
        document.getElementById('length').style.display = "inline-block";
        document.getElementById('lengthLabel').style.display = "inline-block";
        document.getElementById('lengthLabel2').style.display = "inline-block";
    } else {
        document.getElementById('length').style.display = "none";
        document.getElementById('lengthLabel').style.display = "none";
        document.getElementById('lengthLabel2').style.display = "none";
    }
});

document.getElementById('checkLastToggle').addEventListener('change', () => {
    try {
        document.getElementById('checkLast').disabled = document.getElementById('checkLastToggle').checked;
    } catch (e) {
        alert(errorText + e.stack)
    }
});

document.getElementById("jpgQuality").addEventListener("input", function () {
    document.getElementById("qualityValue").textContent = this.value;
});

function msOffsetToBeats(msOffset, tempoChanges) {
    try {
        let secondsRemaining = msOffset / 1000;
        let beat = 0;
        let bpm = tempoChanges[0].dynamicData.tempo;

        for (let i = 0; i < tempoChanges.length; i++) {
            const curr = tempoChanges[i];
            const next = tempoChanges[i + 1] || { beat: Infinity };

            const currBPM = curr.dynamicData.tempo;
            const currTimePerBeat = 60 / currBPM;
            const beatSpan = next.beat - curr.beat;
            const spanDuration = beatSpan * currTimePerBeat;

            if (secondsRemaining >= spanDuration) {
                // Fully consume this tempo segment
                beat += beatSpan;
                secondsRemaining -= spanDuration;
            } else {
                // Partial segment
                beat += secondsRemaining / currTimePerBeat;
                secondsRemaining = 0;
                break;
            }
        }

        return beat;
    } catch (e) {
        alert(errorText + e.stack)
    }
}


function toggleSlider() {
  const jpgSelected = document.querySelector('input[name="fileType"]:checked').value === "1";
  const sliderDiv = document.getElementById("jpgQualitySlider");
  sliderDiv.style.display = jpgSelected ? "block" : "none";
}

function updateVideoEditorBackground() {
    try {
        const videoEditor = document.getElementsByClassName("video-editor")[0];
        const bgColor = document.getElementById("videoBGColor").value;
        videoEditor.style.backgroundColor = bgColor;

        // Adjust text color for contrast
        const invertedColor = invertColor(bgColor);
        videoEditor.style.color = invertedColor;
    } catch (e) {
        alert(errorText + e.stack);
    }
}

function modifyRemix(remix) {
    const isSans = document.getElementById("sans").checked;
    const fps = parseInt(document.getElementById("fpsInput").value, 10) || parseInt(document.getElementById('fpsInput').placeholder);
    let bpm = remix["tempoChanges"][0]["dynamicData"]["tempo"]
    let bpf = (bpm / (60 * fps)) // beats per frame
    let track = parseInt(document.getElementById('trackNumber').value, 10) - 1;
    
    const filter = parseInt(document.getElementById("filterMode").value, 10);
    const layer = parseInt(document.getElementById("layer").value, 10);
    const dLayer = parseInt(document.getElementById("dLayer").value, 10);
    const xPos = parseFloat(document.getElementById("xPos").value, 10);
    const yPos = parseFloat(document.getElementById("yPos").value, 10);
    const zPos = parseFloat(document.getElementById("zPos").value, 10);
    const width = parseFloat(document.getElementById("width").value, 10);
    const height = parseFloat(document.getElementById("height").value, 10);
    const rotation = parseFloat(document.getElementById("rotation").value, 10);
    let beat = parseFloat(beatOffset) + msOffsetToBeats(parseFloat(msOffset), remix["tempoChanges"])

    const indexLength = []
    let lastIndex = "None"
    imageIndexList.forEach((index) => {
        if (index == lastIndex) {
            indexLength[indexLength.length - 1][1]++
        } else {
            indexLength.push([index, 1])
        }
        lastIndex = index
    })
    tempEntities = []
    for (let i = 0; i < indexLength.length; i++) {
        const index = indexLength[i][0];
        const lenFrames = indexLength[i][1];
        const imageFile = frameList[index];
        if (!imageFile) continue;
        const imageName = imageFile.name.slice(0, -4);

        let timeRemaining = lenFrames / fps; // total seconds to render this decal
        let currentBeat = beat;

        while (timeRemaining > 0) {
            // Update bpm and bpf based on the current beat
            for (let j = 0; j < remix.tempoChanges.length; j++) {
                if (currentBeat >= remix.tempoChanges[j].beat) {
                    bpm = remix.tempoChanges[j].dynamicData.tempo;
                    bpf = bpm / (60 * fps);
                } else {
                    break;
                }
            }

            // Check when the next tempo change is
            let nextTempoChangeBeat = Infinity;
            for (const tc of remix.tempoChanges) {
                if (tc.beat > currentBeat) {
                    nextTempoChangeBeat = tc.beat;
                    break;
                }
            }

            const secondsToNextTempo = ((nextTempoChangeBeat - currentBeat) * 60) / bpm;
            const chunkTime = Math.min(timeRemaining, secondsToNextTempo);
            const chunkBeats = (chunkTime * bpm) / 60;

            tempEntities.push({
                type: "riq__Entity",
                version: 1,
                datamodel: "vfx/display decal",
                beat: currentBeat,
                length: chunkBeats,
                dynamicData: {
                    track: track,
                    sprite: imageName,
                    filter: filter,
                    ease: 1,
                    layer: layer,
                    displayLayer: dLayer,
                    sX: 0.0,
                    sY: 0.0,
                    sZ: 0.0,
                    sWidth: 1.0,
                    sHeight: 1.0,
                    sRot: 0.0,
                    sColor: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
                    eX: xPos,
                    eY: yPos,
                    eZ: zPos,
                    eWidth: width,
                    eHeight: height,
                    eRot: rotation,
                    eColor: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
                }
            });

            currentBeat += chunkBeats;
            timeRemaining -= chunkTime;
        }

        // Advance beat by total duration in beats (even across tempo changes)
        beat = currentBeat;
    }

    if (isSans) {
        const True = true
        const False = false
        const bpm = remix["tempoChanges"][0]["dynamicData"]["tempo"]
        const bo = parseFloat(beatOffset) + msOffsetToBeats(parseFloat(msOffset), remix["tempoChanges"]);
        const mo = 0
        const tn = track + 1
        const ps = layer
        remix["entities"] = remix["entities"].concat([
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 0.0 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -6 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 0.25 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -6 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 0.5 + bo + (mo / 1000) / (60 / bpm), 'length': 0.5, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': 6 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 1.0 + bo + (mo / 1000) / (60 / bpm), 'length': 0.5, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': 1 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 1.75 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': 0 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 2.25 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -1 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 2.75 + bo + (mo / 1000) / (60 / bpm), 'length': 0.5, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -3 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 3.25 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -6 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 3.5 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -3 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
            {'type': 'riq__Entity', 'version': 0, 'datamodel': 'advanced/play sfx', 'beat': 3.75 + bo + (mo / 1000) / (60 / bpm), 'length': 0.25, 'dynamicData': {'track': tn, 'game': {'value': 39, 'Values': ['common', 'airboarder', 'airRally', 'animalAcrobat', 'balloonHunter', 'basketballGirls', 'bigRockFinish', 'blueBear', 'boardMeeting', 'bonOdori', 'bouncyRoad', 'builtToScaleDS', 'builtToScaleRvl', 'cannery', 'catchOfTheDay', 'catchyTune', 'chameleon', 'chargingChicken', 'cheerReaders', 'clappyTrio', 'clapTrap', 'coinToss', 'cropStomp', 'djSchool', 'dogNinja', 'doubleDate', 'dressYourBest', 'drummerDuel', 'drummingPractice', 'fanClub', 'figureFighter', 'fillbots', 'fireworks', 'firstContact', 'flipperFlop', 'forkLifter', 'freezeFrame', 'frogHop', 'frogPrincess', 'gleeClub', 'holeInOne', 'karateman', 'kitties', 'launchParty', 'lockstep', 'loveLab', 'lumbearjack', 'mannequinFactory', 'manzai', 'marchingOrders', 'meatGrinder', 'monkeyWatch', 'mrUpbeat', 'munchyMonk', 'nailCarpenter', 'nightWalkAgb', 'nipInTheBud', 'octopusMachine', 'packingPests', 'pajamaParty', 'powerCalligraphy', 'quizShow', 'rapMen', 'rhythmRally', 'rhythmSomen', 'rhythmTestGBA', 'rhythmTweezers', 'ringside', 'rockers', 'samuraiSliceNtr', 'seeSaw', 'shootEmUp', 'showtime', 'sickBeats', 'slotMonster', 'sneakySpirits', 'spaceball', 'spaceDance', 'spaceSoccer', 'splashdown', 'sumoBrothers', 'tambourine', 'tapTrial', 'tapTroupe', 'theDazzles', 'tossBoys', 'totemClimb', 'tramAndPauline', 'trickClass', 'tunnel', 'fallingWaffle', 'wizardsWaltz', 'workingDough']}, 'getSfx': 'Glee Club', 'sfxName': {'value': 9, 'Values': ['BatonDown', 'BatonUp', 'LoudWailLoop', 'LoudWailStart', 'StopWail', 'togetherEN-01', 'togetherEN-02', 'togetherEN-03', 'togetherEN-04', 'WailLoop']}, 'useSemitones': True, 'semitones': -1 + ps, 'cents': 0, 'pitch': 1.0, 'volume': 1.0, 'offset': 0, 'loop': True}},
        ])
    }

    console.log(remix["entities"])
    doEasing(remix)
    return remix;
}

function doEasing(remix) {//Change all the entities location based on easing
    const xStart = parseFloat(document.getElementById("StartxPos").value, 10);
    const xEnd = parseFloat(document.getElementById("xPos").value, 10);
    const yStart = parseFloat(document.getElementById("StartyPos").value, 10);
    const yEnd = parseFloat(document.getElementById("yPos").value, 10);
    const zStart = parseFloat(document.getElementById("StartzPos").value, 10);
    const zEnd = parseFloat(document.getElementById("zPos").value, 10);
    const widthStart = parseFloat(document.getElementById("startWidth").value, 10);
    const widthEnd = parseFloat(document.getElementById("width").value, 10);
    const heightStart = parseFloat(document.getElementById("startHeight").value, 10);
    const heightEnd = parseFloat(document.getElementById("height").value, 10);
    const rotationStart = parseFloat(document.getElementById("startRotation").value, 10);
    const rotationEnd = parseFloat(document.getElementById("rotation").value, 10);
    const hexStart = document.getElementById("startDecalColor").value;
    const hexEnd = document.getElementById("decalColor").value;
    const rStart = parseInt(hexStart.slice(1, 3), 16) / 255;
    const gStart = parseInt(hexStart.slice(3, 5), 16) / 255;
    const bStart = parseInt(hexStart.slice(5, 7), 16) / 255;
    const aStart = parseInt(document.getElementById("startDecalAlpha").value, 10)/100;
    const rEnd = parseInt(hexEnd.slice(1, 3), 16) / 255;
    const gEnd = parseInt(hexEnd.slice(3, 5), 16) / 255;
    const bEnd = parseInt(hexEnd.slice(5, 7), 16) / 255;
    const aEnd = parseInt(document.getElementById("decalAlpha").value, 10)/100;
    const easing = parseInt(document.getElementById("easing").value, 10);
    const overRideLength = document.getElementById("lengthToggle").checked;
    const length = parseFloat(document.getElementById("length").value, 10);
    const beat = parseFloat(beatOffset) + msOffsetToBeats(parseFloat(msOffset), remix["tempoChanges"]);

    

    const startBeat = tempEntities[0].beat;
    const endBeat = tempEntities[tempEntities.length - 1].beat + tempEntities[tempEntities.length - 1].length;
    const totalBeats = endBeat - startBeat;
    
    for (let i = 0; i < tempEntities.length; i++) {
        const entity = tempEntities[i];
        const progressStart = (entity.beat - startBeat) / totalBeats; 
        const progressEnd = (entity.beat - startBeat + entity.length) / totalBeats;

        entity["beat"] = (overRideLength) ? (entity.beat - startBeat) * (length/totalBeats) + startBeat : entity["beat"];
        entity["length"] = (overRideLength) ? entity.length * (length/totalBeats) : entity["length"];
        entity["dynamicData"]["ease"] = easing == 1 ? 1 : 0;
        entity["dynamicData"]["sX"] = ease(progressStart, easing) * (xEnd - xStart) + xStart;
        entity["dynamicData"]["sY"] = ease(progressStart, easing) * (yEnd - yStart) + yStart;
        entity["dynamicData"]["sZ"] = ease(progressStart, easing) * (zEnd - zStart) + zStart;
        entity["dynamicData"]["sWidth"] = ease(progressStart, easing) * (widthEnd - widthStart) + widthStart;
        entity["dynamicData"]["sHeight"] = ease(progressStart, easing) * (heightEnd - heightStart) + heightStart;
        entity["dynamicData"]["sRot"] = ease(progressStart, easing) * (rotationEnd - rotationStart) + rotationStart;
        entity["dynamicData"]["sColor"]["r"] = ease(progressStart, easing) * (rEnd - rStart) + rStart;
        entity["dynamicData"]["sColor"]["g"] = ease(progressStart, easing) * (gEnd - gStart) + gStart;
        entity["dynamicData"]["sColor"]["b"] = ease(progressStart, easing) * (bEnd - bStart) + bStart;
        entity["dynamicData"]["sColor"]["a"] = ease(progressStart, easing) * (aEnd - aStart) + aStart;
        entity["dynamicData"]["eX"] = ease(progressEnd, easing) * (xEnd - xStart) + xStart;
        entity["dynamicData"]["eY"] = ease(progressEnd, easing) * (yEnd - yStart) + yStart;
        entity["dynamicData"]["eZ"] = ease(progressEnd, easing) * (zEnd - zStart) + zStart;
        entity["dynamicData"]["eWidth"] = ease(progressEnd, easing) * (widthEnd - widthStart) + widthStart;
        entity["dynamicData"]["eHeight"] = ease(progressEnd, easing) * (heightEnd - heightStart) + heightStart;
        entity["dynamicData"]["eRot"] = ease(progressEnd, easing) * (rotationEnd - rotationStart) + rotationStart;
        entity["dynamicData"]["eColor"]["r"] = ease(progressEnd, easing) * (rEnd - rStart) + rStart;
        entity["dynamicData"]["eColor"]["g"] = ease(progressEnd, easing) * (gEnd - gStart) + gStart;
        entity["dynamicData"]["eColor"]["b"] = ease(progressEnd, easing) * (bEnd - bStart) + bStart;
        entity["dynamicData"]["eColor"]["a"] = ease(progressEnd, easing) * (aEnd - aStart) + aStart;
        remix["entities"].push(entity);
    }
}

function ease(num, func) {
    num = clamp(num, 0, 1);
    const pi = Math.PI, c1 = 1.70158, c2 = c1 * 1.525, c3 = c1 + 1, c4 = (2 * pi) / 3, c5 = (2 * pi) / 4.5;

    switch (func) {
        case 0: // Linear
            return num;
        case 1: // Instant
            return 1;
        case 2: // EaseInQuad
            return num * num;
        case 3: // EaseOutQuad
            return 1 - (1 - num) * (1 - num);
        case 4: // EaseInOutQuad
            return num < 0.5 ? 2 * num * num : 1 - Math.pow(-2 * num + 2, 2) / 2;
        case 5: // EaseInCubic
            return num * num * num;
        case 6: // EaseOutCubic
            return 1 - Math.pow(1 - num, 3);
        case 7: // EaseInOutCubic
            return num < 0.5 ? 4 * num * num * num : 1 - Math.pow(-2 * num + 2, 3) / 2;
        case 8: // EaseInQuart
            return num * num * num * num;
        case 9: // EaseOutQuart
            return 1 - Math.pow(1 - num, 4);
        case 10: // EaseInOutQuart
            return num < 0.5 ? 8 * Math.pow(num, 4) : 1 - Math.pow(-2 * num + 2, 4) / 2;
        case 11: // EaseInQuint
            return num * num * num * num * num;
        case 12: // EaseOutQuint
            return 1 - Math.pow(1 - num, 5);
        case 13: // EaseInOutQuint
            return num < 0.5 ? 16 * Math.pow(num, 5) : 1 - Math.pow(-2 * num + 2, 5) / 2;
        case 14: // EaseInSine
            return 1 - Math.cos((num * pi) / 2);
        case 15: // EaseOutSine
            return Math.sin((num * pi) / 2);
        case 16: // EaseInOutSine
            return -(Math.cos(pi * num) - 1) / 2;
        case 17: // EaseInExpo
            return num === 0 ? 0 : Math.pow(2, 10 * num - 10);
        case 18: // EaseOutExpo
            return num === 1 ? 1 : 1 - Math.pow(2, -10 * num);
        case 19: // EaseInOutExpo
            if (num === 0) return 0;
            if (num === 1) return 1;
            return num < 0.5
                ? Math.pow(2, 20 * num - 10) / 2
                : (2 - Math.pow(2, -20 * num + 10)) / 2;
        case 20: // EaseInCirc
            return 1 - Math.sqrt(1 - num * num);
        case 21: // EaseOutCirc
            return Math.sqrt(1 - Math.pow(num - 1, 2));
        case 22: // EaseInOutCirc
            return num < 0.5
                ? (1 - Math.sqrt(1 - Math.pow(2 * num, 2))) / 2
                : (Math.sqrt(1 - Math.pow(-2 * num + 2, 2)) + 1) / 2;
        case 23: // EaseInBounce
            return 1 - ease(1 - num, 24);
        case 24: // EaseOutBounce
            if (num < 1 / 2.75) {
                return 7.5625 * num * num;
            } else if (num < 2 / 2.75) {
                return 7.5625 * (num -= 1.5 / 2.75) * num + 0.75;
            } else if (num < 2.5 / 2.75) {
                return 7.5625 * (num -= 2.25 / 2.75) * num + 0.9375;
            } else {
                return 7.5625 * (num -= 2.625 / 2.75) * num + 0.984375;
            }
        case 25: // EaseInOutBounce
            return num < 0.5
                ? (1 - ease(1 - 2 * num, 24)) / 2   // use EaseOutBounce
                : (1 + ease(2 * num - 1, 24)) / 2;  // use EaseOutBounce
        case 26: // EaseInBack
            return c3 * num * num * num - c1 * num * num;
        case 27: // EaseOutBack
            return 1 + c3 * Math.pow(num - 1, 3) + c1 * Math.pow(num - 1, 2);
        case 28: // EaseInOutBack
            return num < 0.5
                ? (Math.pow(2 * num, 2) * ((c2 + 1) * 2 * num - c2)) / 2
                : (Math.pow(2 * num - 2, 2) * ((c2 + 1) * (num * 2 - 2) + c2) + 2) / 2;
        case 29: // EaseInElastic
            if (num === 0) return 0;
            if (num === 1) return 1;
            return -Math.pow(2, 10 * num - 10) * Math.sin((num * 10 - 10.75) * c4);
        case 30: // EaseOutElastic
            if (num === 0) return 0;
            if (num === 1) return 1;
            return Math.pow(2, -10 * num) * Math.sin((num * 10 - 0.75) * c4) + 1;
        case 31: // EaseInOutElastic
            if (num === 0) return 0;
            if (num === 1) return 1;
            if (num < 0.5) {
                return -0.5 * Math.pow(2, 20 * num - 10) * Math.sin((20 * num - 11.125) * c5);
            } else {
                return Math.pow(2, -20 * num + 10) * Math.sin((20 * num - 11.125) * c5) * 0.5 + 1;
            }
        case 32: // Spring
            return Math.sin(num * pi * (0.2 + 2.5 * num * num * num)) * Math.pow(1 - num, 2.2) + num;
        case 33: // EaseOutInQuad
            return num < 0.5
                ? ease(num * 2, 3) / 2
                : 0.5 + ease((num - 0.5) * 2, 2) / 2;
        case 34: // EaseOutInCubic
            return num < 0.5
                ? ease(num * 2, 6) / 2
                : 0.5 + ease((num - 0.5) * 2, 5) / 2;
        case 35: // EaseOutInQuart
            return num < 0.5
                ? ease(num * 2, 9) / 2
                : 0.5 + ease((num - 0.5) * 2, 8) / 2;
        case 36: // EaseOutInQuint
            return num < 0.5
                ? ease(num * 2, 12) / 2
                : 0.5 + ease((num - 0.5) * 2, 11) / 2;
        case 37: // EaseOutInSine
            return num < 0.5
                ? ease(num * 2, 15) / 2
                : 0.5 + ease((num - 0.5) * 2, 14) / 2;
        case 38: // EaseOutInExpo
            return num < 0.5
                ? ease(num * 2, 18) / 2
                : 0.5 + ease((num - 0.5) * 2, 17) / 2;
        case 39: // EaseOutInCirc
            return num < 0.5
                ? ease(num * 2, 21) / 2
                : 0.5 + ease((num - 0.5) * 2, 20) / 2;
        case 40: // EaseOutInBounce
            return num < 0.5
                ? ease(num * 2, 24) / 2
                : 0.5 + ease((num - 0.5) * 2, 23) / 2;
        case 41: // EaseOutInBack
            return num < 0.5
                ? ease(num * 2, 27) / 2
                : 0.5 + ease((num - 0.5) * 2, 26) / 2;
        case 42: // EaseOutInElastic
            return num < 0.5
                ? ease(num * 2, 30) / 2
                : 0.5 + ease((num - 0.5) * 2, 29) / 2;
        default:
            return num;
    }
}


function loadAndModifyRIQ(fileInput = "none") {
    if (fileInput == "none") {
        fileInput = document.getElementById('riqFileInput');
    }
    
    trackNumber = document.getElementById('trackNumber').value;
    beatOffset = document.getElementById('beatOffset').value;
    msOffset = document.getElementById('msOffset').value;

    const overRideLength = document.getElementById("lengthToggle").checked;
    const length = parseFloat(document.getElementById("length").value, 10);
    if (overRideLength && length <= 0) {
        alert("Length must be greater than 0.");
        return;
    }

    if (fileInput.files.length > 0) {
        document.getElementById('downloadButton').style.display = 'none';
        document.getElementById('useModifiedAsInput').style.display = 'none';

        const file = fileInput.files[0];
        fileName = file.name;

        JSZip.loadAsync(file) // read the content of the .riq file
        .then(function(zip) {
            // Check if remix.json exists in the zip
            if (zip.file("remix.json")) {
                return zip.file("remix.json").async("string") // Read the remix.json content
                    .then(function(data) {
                        // Parse the JSON data, modify it, and replace the content
                        const cleanedData = data.replace(/^\ufeff/, '');
                        let remix = JSON.parse(cleanedData);
                        remix = modifyRemix(remix);

                        // Replace the old remix.json with the modified one
                        zip.file("remix.json", JSON.stringify(remix, null, 4));

                        // Ensure Resources/Sprites folders exist
                        if (!zip.folder("Resources")) {
                            zip.folder("Resources");
                        }

                        if (!zip.folder("Resources/Sprites")) {
                            zip.folder("Resources/Sprites");
                        }

                        // Call modifySprites to modify contents of the Sprites folder
                        modifySprites(zip.folder("Resources/Sprites"));

                        // Generate the modified zip blob
                        return zip.generateAsync({
                            type: "blob"
                        });
                    });
            } else {
                throw new Error("remix.json not found in the zip file.");
            }
        })
        .then(function(content) {
            modifiedContent = content; // Save the modified content globally
            modifiedContent.name = `modified ${fileName}`;
            document.getElementById('downloadButton').style.display = 'block'; // Show download button
            document.getElementById('useModifiedAsInput').style.display = 'block';
        })
        .catch(function(err) {
            alert('Error modifying the file: ' + err.message);
            console.log(err.message);
        });
    } else {
        alert('Please select a .RIQ file to upload.');
    }
}

function modifySprites(spritesFolder) {
    try {
        console.log("Modifying Sprites folder...");
        
        for (let i = 0; i < frameList.length; i++) {
            const fileObject = frameList[i];
            if (fileObject) {
                // Directly add the File object to the sprites folder
                spritesFolder.file(fileObject.name, fileObject);
                //console.log(`Added file: ${fileObject.name} to Sprites folder`);
            }
        }
    } catch (e) {
        alert(errorText + e.stack)
    }
}

function useModifiedAsInput() {
    try {
        fi = {
            files: [modifiedContent]
        }
        loadAndModifyRIQ(fi);
    } catch (e) {
        alert(errorText + e.stack)
    }
}

function downloadModifiedRIQ() {
    try {
        if (modifiedContent) {
            saveAs(modifiedContent, modifiedContent.name); // Use FileSaver.js to save the file
        } else {
            alert('No modified file to download.');
        }
    } catch (e) {
        alert(errorText + e.stack)
    }
}
//Video Editor
let rerun = false;
document.getElementById("videoBGColor").addEventListener('change', function(event) {
    try {
        const bgColor = event.target.value;
        const videoEditor = document.getElementsByClassName('video-editor')[0];
        
        // Set the background color
        videoEditor.style.backgroundColor = bgColor;

        // Calculate the inverted color for text
        const invertedColor = invertColor(bgColor);
        videoEditor.style.color = invertedColor;
    } catch (e) {
        alert(errorText + e.stack)
    }
});

function invertColor(hex) {
    try {
        // Remove the hash (#) if it exists
        hex = hex.replace('#', '');
        
        // Convert hex to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Invert each channel
        const invertedR = (255 - r).toString(16).padStart(2, '0');
        const invertedG = (255 - g).toString(16).padStart(2, '0');
        const invertedB = (255 - b).toString(16).padStart(2, '0');
        
        // Return the inverted color as a hex string
        return `#${invertedR}${invertedG}${invertedB}`;
    } catch (e) {
        alert(errorText + e.stack)
    }
}

document.getElementById('videoInput').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const videoElement = document.getElementById('videoPreview');
    videoElement.pause();
    videoElement.src = '';
    
    try {
        document.getElementById('loadingIndicator').style.display = 'block';
        
        const mediaFile = file.name.toLowerCase().endsWith('.gif') 
            ? await convertGifToMp4(file)
            : file;

        videoElement.src = URL.createObjectURL(mediaFile);
        videoElement.type = mediaFile.type || 'video/mp4';
        
        videoElement.onloadeddata = () => {
            document.getElementById('loadingIndicator').style.display = 'none';
            videoElement.play().catch(e => console.log('Autoplay blocked:', e));
        };

        videoElement.addEventListener( "loadedmetadata", function () {
            // retrieve dimensions
            const widthInput = document.getElementById('resolutionWidth');
            const heightInput = document.getElementById('resolutionHeight');
            widthInput.placeholder = this.videoWidth;
            heightInput.placeholder  = this.videoHeight;
        }, false);
        
        videoElement.onerror = () => {
            console.error('Playback error:', videoElement.error);
            //document.getElementById('loadingIndicator').style.display = 'none';
        };
        
    } catch (e) {
        console.error('Error:', e);
        document.getElementById('loadingIndicator').style.display = 'none';
        alert('Error: ' + e.message);
    }
});

document.getElementById('applyChangesButton').addEventListener('click', async () => { //UNUSED
    try {
        if (document.getElementById('loadingIndicator').style.display == 'block') {
            alert("Please wait for the previous operation to complete.");
            return;
        }
        const videoInput = document.getElementById("videoInput");
        const targetWidth = parseInt(document.getElementById("resolutionWidth").value, 10) || parseInt(document.getElementById('resolutionWidth').placeholder);
        const targetHeight = parseInt(document.getElementById("resolutionHeight").value, 10) || parseInt(document.getElementById('resolutionHeight').placeholder);
        const chromaKeyColor = document.getElementById("chromaKeyColor").value;
        const chromaKeyRgb = hexToRgb(chromaKeyColor);
        const fps = parseInt(document.getElementById("fpsInput").value, 10) || parseInt(document.getElementById('fpsInput').placeholder);

        if (!videoInput.files.length) {
            alert("Please select a video file.");
            return;
        }

        document.getElementById('loadingIndicator').style.display = 'block';

        const file = videoInput.files[0];
        processVideo(file, targetWidth, targetHeight, chromaKeyRgb, fps);
    } catch (e) {
        alert(errorText + e.stack)
    }
});

async function processVideo(file, targetWidth, targetHeight, chromaKeyRgb, fps) {
    try {
        const canvas = document.getElementById('frameCanvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const videoPreview = document.getElementById('videoPreview');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const uniqueFrames = [];
        const frameHashes = new Map();
        const uniqueImageDataList = [];
        const frameIndexList = [];
        const chunks = [];
        const inputThreshold = parseFloat(document.getElementById("dtInput").value, 10);
        const differenceThreshold = (!isNaN(inputThreshold) ? inputThreshold / 100 : 0.001); // Use input or fallback


        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.muted = true;
        await videoElement.play();

        const frameInterval = 1 / fps;
        videoElement.currentTime = 0;

        // Initialize progress bar
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const totalFrames = Math.floor(videoElement.duration * fps);

        async function processFrame() {
            try {
                if (videoElement.currentTime >= videoElement.duration) {
                    console.log('Frame processing completed. Total unique frames:', uniqueFrames.length);
                    console.log('Frame index list:', frameIndexList);

                    // Reassemble the final video
                    await reassembleVideoFromFrames(canvas, fps, uniqueFrames, frameIndexList, videoPreview);
                    document.getElementById('loadingIndicator').style.display = 'none';
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
                if (document.getElementById('chromaKeyToggle').checked) {
                    applyChromaKey(ctx, targetWidth, targetHeight, chromaKeyRgb);
                }
                const currentImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

                let checkLast = parseInt(document.getElementById("checkLast").value, 10) || 10;
                if (document.getElementById('checkLastToggle').checked) {checkLast = uniqueImageDataList.length}
                let isDuplicate = false;
                if (differenceThreshold > 0) {
                // Draw the current frame onto the canvas
                    for (let i = clamp(uniqueImageDataList.length - checkLast, 0, Infinity); i < uniqueImageDataList.length; i++) {
                // Apply chroma key effect if enabled
                        const diffScore = calculateDifferenceScore(currentImageData, uniqueImageDataList[i]);
                        if (diffScore < differenceThreshold) {
                            frameIndexList.push(i);

                // Get the image data of the current frame
                            isDuplicate = true;
                            console.log(`diffScore: ${diffScore}, threshold: ${differenceThreshold}`);
                // Determine if the frame is a duplicate
                            break;
                        }
                    }
                }
                if (!isDuplicate) {
                    const uniqueIndex = uniqueFrames.length;
                    uniqueFrames.push(ctx.getImageData(0, 0, targetWidth, targetHeight));
                    uniqueImageDataList.push(currentImageData);
                    frameIndexList.push(uniqueIndex);
                }

                // Update progress bar

                // If the frame is unique, store it
                const processedFrames = videoElement.currentTime * fps;
                const progressPercentage = Math.min(100, ((processedFrames / totalFrames) * 100).toFixed(2));
                progressBar.style.width = `${progressPercentage}%`;
                progressText.textContent = `${progressPercentage}%`;

                videoElement.currentTime += frameInterval;
            } catch (e) {
                alert(errorText + e.stack)
            }
        }
            // Update the progress bar

        videoElement.addEventListener('seeked', processFrame);

        videoElement.currentTime = 0;
    } catch (e) {
        alert(errorText + e.stack)
    }
}

async function reassembleVideoFromFrames(canvas, fps, uniqueFrames, frameIndexList, videoPreview) {
    try {
        const ctx = canvas.getContext('2d');
        const stream = canvas.captureStream(fps);
        const chunks = [];
        let recorder
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
        } else {
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm;' });
            alert("Warning, if you're using Firefox I'm not sure if everything will work.\n(try using a Chromium based browser)");
            //return;
        }


        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = () => {
            const videoBlob = new Blob(chunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(videoBlob);
            videoPreview.src = videoURL;
            videoPreview.load();
            videoPreview.play();
        };

        recorder.start();

        for (let i = 0; i < frameIndexList.length; i++) {
            const uniqueIndex = frameIndexList[i];
            const frameData = uniqueFrames[uniqueIndex];

            ctx.putImageData(frameData, 0, 0);
            await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
        }

        recorder.stop();
    } catch (e) {
        alert(errorText + e.stack)
    }
}

async function convertBlobToJPEG(blob, quality = 0.8) {
    try {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
        });
    } catch (e) {
        alert(errorText + e.stack)
    }
}


function applyChromaKey(ctx, width, height, chromaKeyRgb, threshold = 50) {
    try {
        const imageData = ctx.getImageData(0, 0, width, height, {});
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate Euclidean distance between pixel color and chroma key color
            const distance = Math.sqrt(
                Math.pow(r - chromaKeyRgb.r, 2) +
                Math.pow(g - chromaKeyRgb.g, 2) +
                Math.pow(b - chromaKeyRgb.b, 2)
            );

            if (distance < threshold) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        ctx.putImageData(imageData, 0, 0);
    } catch (e) {
        alert(errorText + e.stack)
    }
}

async function extractFramesAsPNGsOld(file, targetWidth, targetHeight, fps, chromaKeyColor) {
    const canvas = document.getElementById('frameCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const tempFrames = []; // Temporary storage for frames with indices
    const frameIndexList = [];
    const uniqueImageDataList = [];
    const chromaKeyRgb = hexToRgb(chromaKeyColor);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const videoElement = document.createElement('video');
    videoElement.src = file;
    videoElement.muted = true;

    await new Promise((resolve) => (videoElement.onloadeddata = resolve));
    videoElement.pause();

    const totalFrames = Math.ceil(videoElement.duration * fps);
    let processedFrames = 0;
    const frameInterval = 1 / fps; // Time between frames in seconds
    videoElement.currentTime = 0;

    const inputThreshold = parseFloat(document.getElementById("dtInput").value, 10);
    const differenceThreshold = (!isNaN(inputThreshold) ? inputThreshold / 100 : 0.001); // Use input or fallback

    async function processFrame() {
        try {
            if (videoElement.currentTime >= videoElement.duration) {
                // Sort tempFrames based on the original index
                tempFrames.sort((a, b) => a.index - b.index);
        
                console.log('All frames processed. Total unique frames:', tempFrames.length);
                console.log('Frame index list:', frameIndexList);
                imageIndexList = frameIndexList;
                saveFramesAsFiles(tempFrames);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
        
            // Apply chroma key effect
            if (document.getElementById('chromaKeyToggle').checked) {
                applyChromaKey(ctx, targetWidth, targetHeight, chromaKeyRgb);
            }
        
            // Get frame data
            const currentImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        
            // Check for similarity with existing unique frames
            let checkLast = parseInt(document.getElementById("checkLast").value, 10) || 10;
            if (document.getElementById('checkLastToggle').checked) {checkLast = uniqueImageDataList.length}
            let isDuplicate = false;
            if (differenceThreshold > 0) {
                for (let i = clamp(uniqueImageDataList.length - checkLast, 0, Infinity); i < uniqueImageDataList.length; i++) {
                    const diffScore = calculateDifferenceScore(currentImageData, uniqueImageDataList[i]);
                    //console.log(`Frame ${processedFrames}: diffScore with unique frame ${i} = ${diffScore}`);
        
                    if (diffScore < differenceThreshold) {
                        console.log(`Frame ${processedFrames} is a duplicate of frame ${i}`);
                        frameIndexList.push(i); // Add the index of the existing unique frame
                        isDuplicate = true;
                        break;
                    }
                }
            }
        
            if (!isDuplicate) {
                // Save the frame as a unique PNG blob
                const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
                if (blob && blob.size > 0) {
                    const uniqueIndex = uniqueImageDataList.length; // Correct unique index
                    tempFrames.push({ index: processedFrames, blob }); // Store with original index
                    uniqueImageDataList.push(currentImageData); // Store unique frame data
                    frameIndexList.push(uniqueIndex); // Add the index of this unique frame
                    //console.log(`Frame ${processedFrames} added as unique frame ${uniqueIndex}`);
                } else {
                    console.warn('Blob creation failed or is empty for frame');
                }
            }
        
            // Update progress
            processedFrames++;
            const progressPercentage = Math.min(100, ((processedFrames / totalFrames) * 100).toFixed(2));
            document.getElementById('progressBar').style.width = `${progressPercentage}%`;
            document.getElementById('progressText').textContent = `${progressPercentage}%`;
        
            // Move to the next frame
            videoElement.currentTime += frameInterval;
        } catch (e) {
            alert(errorText + e.stack)
        }
    }

    videoElement.addEventListener('seeked', processFrame);

    // Start processing frames
    videoElement.currentTime = 0;
}

async function extractFramesAsPNGs(file, targetWidth, targetHeight, fps, chromaKeyColor) {
  const canvas = document.getElementById('frameCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tempFrames = [];                // [{ index, blob }]
  const pendingBlobs = [];              // promises to await before finalize
  const frameIndexList = [];            // logical timeline (length => duration)
  const uniqueImageDataList = [];       // downscaled buffers for diffing
  const chromaKeyRgb = hexToRgb(chromaKeyColor);

  // Cache DOM
  const chromaKeyToggle = document.getElementById('chromaKeyToggle');
  const checkLastToggle = document.getElementById('checkLastToggle');
  const checkLastInput  = document.getElementById('checkLast');
  const progressBar     = document.getElementById('progressBar');
  const progressText    = document.getElementById('progressText');
  const loadingEl       = document.getElementById('loadingIndicator');
  const dtInput         = document.getElementById('dtInput');

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // ---- Downscaled canvas for fast diffing ----
  const diffScale = 0.25; // 0.25–0.5
  const diffW = Math.max(1, (targetWidth  * diffScale) | 0);
  const diffH = Math.max(1, (targetHeight * diffScale) | 0);
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = diffW; diffCanvas.height = diffH;
  const diffCtx = diffCanvas.getContext('2d', { willReadFrequently: true });

  // Subsampled + early-exit pixel difference
// Replace your diffScoreSubsampled with this:
function diffScoreSubsampled(a, b, step = 4, stopAt = Infinity) {
  let sum = 0;
  let samples = 0;
  const len = a.length;

  // sample every `step` pixels, RGB only (skip alpha)
  for (let i = 0; i < len; i += 4 * step) {
    const dr = Math.abs(a[i]   - b[i]);
    const dg = Math.abs(a[i+1] - b[i+1]);
    const db = Math.abs(a[i+2] - b[i+2]);

    // average per-pixel absolute difference in [0..1]
    // (dr+dg+db) max is 765; divide by 765
    sum += (dr + dg + db) / 765;
    samples++;

    // early exit when mean so far already exceeds threshold
    if (sum / samples > stopAt) return sum / samples;
  }
  return samples ? (sum / samples) : 0;
}


  const inputThreshold = parseFloat(dtInput.value, 10);
  const differenceThreshold = (!isNaN(inputThreshold) ? inputThreshold / 100 : 0.001);

  // ---- Video setup ----
  const videoElement = document.createElement('video');
  videoElement.src = file;      // URL or blob URL
  videoElement.muted = true;

  await new Promise((resolve, reject) => {
    videoElement.onloadedmetadata = resolve;
    videoElement.onerror = reject;
  });

  const totalFrames = Math.max(1, Math.ceil(videoElement.duration * fps));
  const frameInterval = 1 / fps;
  const EPS = Math.max(frameInterval * 0.5, 0.002);

  await videoElement.play();    // start decoding so rVFC fires
  videoElement.playbackRate = 1;

  let lastProcessedFrameIdx = -1; // last logical frame index seen from decoder
  let lastOutputIndex = null;     // last unique index we wrote to timeline
  let done = false;

  // Throttle UI updates
  const UI_EVERY = 12; // frames
  let lastUiFrame = -1;

  // Controls refresh
  let controls = {
    chromaOn: chromaKeyToggle.checked,
    checkLastOn: checkLastToggle.checked,
    checkLast: parseInt(checkLastInput.value, 10) || 10
  };
  let lastControlRefresh = 0;
  const CONTROL_REFRESH_MS = 200;
  const MAX_CHECK_LAST = 300; // cap window to avoid O(N^2) tail

  function findDuplicateIndex(diffImageData) {
    if (!(differenceThreshold > 0) || uniqueImageDataList.length === 0) return -1;

    const raw = controls.checkLastOn ? uniqueImageDataList.length : controls.checkLast;
    const checkLast = Math.min(MAX_CHECK_LAST, raw);
    const start = Math.max(0, uniqueImageDataList.length - checkLast);

    const stopAt = differenceThreshold; // heuristic

    for (let i = start; i < uniqueImageDataList.length; i++) {
        const score = diffScoreSubsampled(diffImageData, uniqueImageDataList[i], 4, stopAt);
        if (score < differenceThreshold) return i;
    }
    return -1;
  }

  const makePngBlob = canvas.convertToBlob
    ? () => canvas.convertToBlob({ type: 'image/png' })
    : () => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  // --- finalize (one-shot) ---
  async function finalize() {
    if (done) return;
    done = true;

    // pad/trim timeline to exact length
    while (frameIndexList.length < totalFrames) {
      frameIndexList.push(lastOutputIndex ?? 0);
    }
    if (frameIndexList.length > totalFrames) {
      frameIndexList.length = totalFrames;
    }

    try {
      await Promise.all(pendingBlobs); // ensure all PNGs finished
      tempFrames.sort((a, b) => a.index - b.index);
      progressBar.style.width = `100%`;
      progressText.textContent = `100%`;
      console.log('All frames processed. Total unique frames:', tempFrames.length);
      console.log('Frame index list:', frameIndexList);
      imageIndexList = frameIndexList;
      await saveFramesAsFiles(tempFrames);
    } finally {
      try { videoElement.pause(); } catch {}
    }
  }

  // watchdog: if callbacks stop firing, finish
  let lastTick = performance.now();
  const watchdogMs = 4000;
  const watchdog = setInterval(() => {
    if (done) { clearInterval(watchdog); return; }
    if (performance.now() - lastTick > watchdogMs) finalize();
  }, 1000);
  videoElement.addEventListener('ended', finalize);

  async function onVideoFrame(now, metadata) {
    if (done) return;
    lastTick = now;

    // refresh controls occasionally
    if (now - lastControlRefresh > CONTROL_REFRESH_MS) {
      controls = {
        chromaOn: chromaKeyToggle.checked,
        checkLastOn: checkLastToggle.checked,
        checkLast: parseInt(checkLastInput.value, 10) || 10
      };
      lastControlRefresh = now;
    }

    const mediaT = metadata.mediaTime; // seconds
    let frameIdx = Math.floor(mediaT * fps);
    if (frameIdx >= totalFrames - 1 || mediaT >= videoElement.duration - EPS || videoElement.ended) {
      await finalize();
      return;
    }

    // skip duplicate callbacks for same logical frame
    if (frameIdx === lastProcessedFrameIdx) {
      videoElement.requestVideoFrameCallback(onVideoFrame);
      return;
    }

    // ---- Draw current frame to full-res canvas ----
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

    // Downscaled buffer for diff (pre-chroma for stable comparisons)
    diffCtx.drawImage(canvas, 0, 0, diffW, diffH);
    const diffImage = diffCtx.getImageData(0, 0, diffW, diffH).data;

    // Duplicate detection
    const dupIndex = findDuplicateIndex(diffImage);

    // Decide which unique index this logical frame will reference
    let useIndex;
    if (dupIndex >= 0) {
      useIndex = dupIndex;
    } else {
      // Apply chroma ONLY for unique frames we’ll save
      if (controls.chromaOn) {
        applyChromaKey(ctx, targetWidth, targetHeight, chromaKeyRgb);
      }

      // Store the *downscaled* diff buffer now
      uniqueImageDataList.push(new Uint8ClampedArray(diffImage));
      useIndex = uniqueImageDataList.length - 1;

      // Non-blocking PNG creation; ensure finalize awaits it
      const thisFrameIdx = frameIdx;
      const p = makePngBlob().then((blob) => {
        if (blob && blob.size > 0) {
          tempFrames.push({ index: thisFrameIdx, blob });
        } else {
          console.warn('Blob creation failed or empty for frame', thisFrameIdx);
        }
      });
      pendingBlobs.push(p);
    }

    // ---- GAP FILL to keep duration constant ----
    const gap = frameIdx - lastProcessedFrameIdx - 1;
    if (gap > 0) {
      const fillIndex = (lastOutputIndex !== null) ? lastOutputIndex : useIndex;
      for (let g = 0; g < gap; g++) frameIndexList.push(fillIndex);
    }

    // Push current logical frame
    frameIndexList.push(useIndex);
    lastOutputIndex = useIndex;
    lastProcessedFrameIdx = frameIdx;

    // Progress (throttled)
    if (frameIdx - lastUiFrame >= UI_EVERY) {
      const shown = Math.min(frameIdx + 1, totalFrames);
      const progressPct = Math.min(100, (shown / totalFrames) * 100);
      progressBar.style.width = `${progressPct.toFixed(1)}%`;
      progressText.textContent = `${progressPct.toFixed(1)}%`;
      lastUiFrame = frameIdx;
      console.log(`Processing (${progressPct.toFixed(1)}%) (${shown}/${totalFrames})`);
    }

    // Next decoded frame (no seeking)
    videoElement.requestVideoFrameCallback(onVideoFrame);
  }

  // Kick off decoding/processing
  videoElement.requestVideoFrameCallback(onVideoFrame);
}

function calculateDifferenceScore(imageData1, imageData2) {
    try {
        const data1 = imageData1.data;
        const data2 = imageData2.data;

        if (data1.length !== data2.length) {
            throw new Error('Image data sizes do not match.');
        }

        let totalDifference = 0;
        for (let i = 0; i < data1.length; i += 4) {
            const rDiff = Math.abs(data1[i] - data2[i]);
            const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
            const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
            const aDiff = Math.abs(data1[i + 3] - data2[i + 3]);
            totalDifference += rDiff + gDiff + bDiff + aDiff;
        }

        // Normalize by the total number of pixels
        const maxDifference = data1.length * 255;
        return totalDifference / maxDifference;
    } catch (e) {
        alert(errorText + e.stack)
    }
}

async function saveFramesAsFiles(fList) {
    try {
        const updatedFrameList = [];
        const inputName = document.getElementById("imageFileName").value;

        // 🔘 Check selected format
        const isJpg = document.querySelector('input[name="fileType"]:checked').value === "1";

        // 🎚 Get JPEG quality if applicable
        const sliderValue = parseInt(document.getElementById('jpgQuality').value);
        const jpegQuality = sliderValue / 100;  // convert 0–100 → 0.0–1.0

        const maxIndex = fList[fList.length - 1].index; // biggest frame.index
        const width = String(maxIndex).length;
        for (let i = 0; i < fList.length; i++) {
            const frame = fList[i];
            if (!frame.blob) {
                console.warn(`Skipping corrupted or empty frame at index ${frame.index}`);
                continue;
            }

            let file, fileName;
            const fileNumber = String(frame.index + 1).padStart(width, '0');
            if (isJpg) {
                // Convert PNG blob to JPEG
                const jpegBlob = await convertBlobToJPEG(frame.blob, jpegQuality);
                fileName = `${inputName}_${fileNumber}.jpg`;
                file = new File([jpegBlob], fileName, { type: 'image/jpeg' });

                // Test image with white border (JPEG version)
                if (i === 0) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const borderSize = 10;
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');

                        ctx.drawImage(img, 0, 0);
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, borderSize); // Top
                        ctx.fillRect(0, canvas.height - borderSize, canvas.width, borderSize); // Bottom
                        ctx.fillRect(0, 0, borderSize, canvas.height); // Left
                        ctx.fillRect(canvas.width - borderSize, 0, borderSize, canvas.height); // Right

                        canvas.toBlob((borderedBlob) => {
                            const testImageFile = new File([borderedBlob], 'test_image.jpg', { type: 'image/jpeg' });
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(testImageFile);
                            a.download = 'test_image.jpg';
                            a.click();
                            URL.revokeObjectURL(a.href);
                        }, 'image/jpeg', jpegQuality);
                    };
                    img.src = URL.createObjectURL(frame.blob);
                }

            } else {
                // PNG fallback
                fileName = `${inputName}_${fileNumber}.png`;
                file = new File([frame.blob], fileName, { type: 'image/png' });

                // Test image with white border (PNG version)
                if (i === 0) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const borderSize = 10;
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');

                        ctx.drawImage(img, 0, 0);
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, borderSize); // Top
                        ctx.fillRect(0, canvas.height - borderSize, canvas.width, borderSize); // Bottom
                        ctx.fillRect(0, 0, borderSize, canvas.height); // Left
                        ctx.fillRect(canvas.width - borderSize, 0, borderSize, canvas.height); // Right

                        canvas.toBlob((borderedBlob) => {
                            const testImageFile = new File([borderedBlob], 'test_image.png', { type: 'image/png' });
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(testImageFile);
                            a.download = 'test_image.png';
                            a.click();
                            URL.revokeObjectURL(a.href);
                        }, 'image/png');
                    };
                    img.src = URL.createObjectURL(frame.blob);
                }
            }

            updatedFrameList.push(file);
        }

        // Replace the original frameList with the updated one
        frameList.length = 0;
        updatedFrameList.forEach((file) => frameList.push(file));

        console.log('Frames saved as File objects in frameList:', frameList);
        document.getElementById('loadingIndicator').style.display = 'none';
    } catch (e) {
        alert("Error saving frames:\n" + e.stack);
    }
}


function downloadFramesAsZip(frameList) {
    try {
        const zip = new JSZip();

        frameList.forEach((frame) => {
            if (frame.blob) {
                zip.file(`frame_${frame.index + 1}.png`, frame.blob);
            } else {
                console.warn(`Skipping corrupted or empty frame at index ${frame.index}`);
            }
        });

        zip.generateAsync({ type: 'blob' })
            .then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'frames.zip';
                link.click();

                // Cleanup
                URL.revokeObjectURL(link.href);
            })
            .catch((error) => {
                console.error('Error generating ZIP:', error);
                alert('An error occurred while creating the ZIP file. Check the console for details.');
            });

        document.getElementById('loadingIndicator').style.display = 'none';
    } catch (e) {
        alert(errorText + e.stack)
    }
}

document.getElementById("extractFramesButton").addEventListener("click", () => {
    try {
        if (document.getElementById('loadingIndicator').style.display == 'block') {
            alert("Please wait for the previous operation to complete.");
            return;
        }
        const videoElement = document.getElementById("videoPreview");
        const videoInput = document.getElementById("videoInput");
        const targetWidth = parseInt(document.getElementById("resolutionWidth").value, 10) || parseInt(document.getElementById('resolutionWidth').placeholder);
        const targetHeight = parseInt(document.getElementById("resolutionHeight").value, 10) || parseInt(document.getElementById('resolutionHeight').placeholder);
        const fps = parseInt(document.getElementById("fpsInput").value, 10) || parseInt(document.getElementById('fpsInput').placeholder);
        const chromaKeyColor = document.getElementById("chromaKeyColor").value;   

        if (!videoInput.files.length) {
            alert("Please select a video file.");
            return;
        }

        if (fps <= 0) {
            alert("FPS must be greater than 0.");
            return;
        }
        const inputThreshold = parseFloat(dtInput.value, 10);
        const differenceThreshold = (!isNaN(inputThreshold) ? inputThreshold / 100 : 0.001);
        if (differenceThreshold >= 1) {
            alert("Difference threshold must be less than 100.");
            return;
        }
        

        document.getElementById('loadingIndicator').style.display = 'block';

        const file = videoElement.src;
        extractFramesAsPNGs(file, targetWidth, targetHeight, fps, chromaKeyColor);
    } catch (e) {
        alert(errorText + e.stack)
    }
});

function hexToRgb(hex) {
    try {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    } catch (e) {
        alert(errorText + e.stack)
    }
}

function clamp(number, min, max) {
    try {
        return Math.min(Math.max(number, min), max);
    } catch (e) {
        alert(errorText + e.stack)
    }
}

function saveThemeToLocalStorage(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch (e) {
        alert(errorText + e.stack);
    }
}
// Function to apply the saved theme on page load
function applySavedTheme() {
    try {
        const savedTheme = localStorage.getItem("theme");
        const root = document.documentElement;

        if (savedTheme === "dark") {
            root.classList.add("dark-mode");
            document.getElementById("videoBGColor").value = "#000000"; // Set default background to black for dark mode
        } else {
            root.classList.remove("dark-mode");
            document.getElementById("videoBGColor").value = "#ffffff"; // Set default background to white for light mode
        }
        updateVideoEditorBackground();
    } catch (e) {
        alert(errorText + e.stack);
    }
}

async function getAccurateGifFrameRate(gifData) {
    const DEFAULT_FPS = 15;
    const MIN_FPS = 1;
    const MAX_FPS = 100;
    const MAX_REASONABLE_DELAY = 1000; // 1 second max per frame

    console.log('[FrameRate] Starting detection');
    
    try {
        // Method 1: ImageDecoder with sanity checks
        if (window.ImageDecoder) {
            const decoder = new ImageDecoder({ data: gifData, type: 'image/gif' });
            await decoder.tracks.ready;
            const track = decoder.tracks.selectedTrack;
            
            // Sample frames but ignore unrealistic durations
            const sampleFrames = Math.min(5, track.frameCount);
            let validDurations = [];
            
            for (let i = 0; i < sampleFrames; i++) {
                const { image } = await decoder.decode({ frameIndex: i });
                const duration = image.duration || 0;
                
                if (duration > 0 && duration <= MAX_REASONABLE_DELAY) {
                    validDurations.push(duration);
                    console.log(`[FrameRate] Valid frame ${i} duration: ${duration}ms`);
                } else {
                    console.warn(`[FrameRate] Ignoring unrealistic duration: ${duration}ms`);
                }
                image.close();
            }

            // Calculate from valid durations or use default
            if (validDurations.length > 0) {
                const meanDuration = validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length;
                const calculatedFps = 1000 / meanDuration;
                const clampedFps = Math.min(MAX_FPS, Math.max(MIN_FPS, Math.round(calculatedFps)));
                console.log(`[FrameRate] Using calculated FPS: ${clampedFps}`);
                return clampedFps;
            }
        }

        // Method 2: Manual parsing with similar checks
        const view = new DataView(gifData);
        let validDelays = [];
        let offset = 0;
        
        while (offset < gifData.byteLength - 9) {
            if (view.getUint8(offset) === 0x21 && 
                view.getUint8(offset + 1) === 0xF9) {
                const delay = view.getUint16(offset + 4, true) * 10;
                
                if (delay > 0 && delay <= MAX_REASONABLE_DELAY) {
                    validDelays.push(delay);
                    console.log(`[FrameRate] Valid manual delay: ${delay}ms`);
                }
                offset += 8;
            } else {
                offset++;
            }
        }

        if (validDelays.length > 0) {
            const meanDelay = validDelays.reduce((sum, d) => sum + d, 0) / validDelays.length;
            return Math.min(MAX_FPS, Math.max(MIN_FPS, Math.round(1000 / meanDelay))), validDelays;
        }

        console.log('[FrameRate] Using default FPS');
        return DEFAULT_FPS
        
    } catch (e) {
        console.error('[FrameRate] Error:', e);
        return DEFAULT_FPS;
    }
}

async function convertGifToMp4(gifFile) {
    console.log('[Conversion] Starting GIF to MP4 conversion');
    try {
        // 1. Verify MP4Box is loaded
        if (typeof MP4Box === 'undefined') {
            throw new Error('MP4Box.js not loaded');
        }

        // 2. Load GIF data
        const gifData = await gifFile.arrayBuffer();
        console.log('[Conversion] GIF file loaded, size:', gifData.byteLength, 'bytes');

        // 3. Get dimensions
        const dimensions = await getGifDimensions(gifData);
        console.log('[Conversion] GIF dimensions:', dimensions.width, 'x', dimensions.height);
        
        if (!dimensions.width || !dimensions.height) {
            throw new Error('Invalid GIF dimensions');
        }

        const { width, height } = dimensions;
        
        // 4. Setup canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        console.log('[Conversion] Canvas setup complete');

        // 5. Create video recorder instead of MP4Box
        let frameRate, delays = await getAccurateGifFrameRate(gifData);
        console.log('[Conversion] Detected frame rate:', frameRate, 'FPS');
        console.log(delays);
        const stream = canvas.captureStream();//frameRate);
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4; codecs=avc1',
            videoBitsPerSecond: 2000000
        });

        const chunks = [];
        recorder.ondataavailable = (e) => {
            chunks.push(e.data);
            console.log('[Conversion] Recorded chunk:', e.data.size, 'bytes');
        };

        // 6. Setup GIF decoder
        const imageDecoder = new ImageDecoder({
            data: gifData,
            type: 'image/gif'
        });
        console.log('[Conversion] ImageDecoder created');

        await imageDecoder.tracks.ready;
        const track = imageDecoder.tracks.selectedTrack;
        console.log('[Conversion] GIF track ready, frame count:', track.frameCount);

        // 7. Start recording
        recorder.start(100); // Collect data every 100ms

        // 8. Process each frame
        for (let i = 0; i < track.frameCount; i++) {
            console.log(`[Conversion] Processing frame ${i+1}/${track.frameCount} ${delays[i]}`);
            let progressPercentage = Math.round((i / track.frameCount) * 100);
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `${progressPercentage}%`;

            const result = await imageDecoder.decode({ frameIndex: i });
            const frame = result.image;
            
            // Draw frame to canvas
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(frame, 0, 0, width, height);
            
            frame.close();
            await new Promise(r => setTimeout(r, delays[i])); // ~15fps delay
        }

        console.log(delays.reduce((sum, d) => sum + d, 0) / delays.length)
        document.getElementById('fpsInput').placeholder = Math.round(100000 / (delays.reduce((sum, d) => sum + d, 0) / delays.length)) / 100;
        // 9. Finalize recording
        return new Promise((resolve) => {
            recorder.onstop = () => {
                console.log('[Conversion] Recording stopped');
                const mp4Blob = new Blob(chunks, { type: 'video/mp4' });
                console.log('[Conversion] MP4 blob created, size:', mp4Blob.size, 'bytes');
                imageDecoder.close();
                resolve(mp4Blob);
            };
            
            setTimeout(() => {
                recorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 100);
        });
    } catch (e) {
        console.error('[Conversion] Full conversion error:', e);
        throw new Error(`Conversion failed: ${e.message}`);
    }
}

async function getGifDimensions(gifData) {
    console.log(gifData)
    try {
        // Method 1: Try createImageBitmap first (most reliable)
        try {
            const blob = new Blob([gifData], { type: 'image/gif' });
            const bitmap = await createImageBitmap(blob);
            console.log(bitmap)
            return {
                width: bitmap.width,
                height: bitmap.height
            };
        } catch (e) {
            console.log("createImageBitmap failed, falling back to manual parsing");
        }

        // Method 2: Manual parsing of GIF header
        const dataView = new DataView(gifData);
        
        // Check GIF signature (first 6 bytes)
        const signature = [
            dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2),
            dataView.getUint8(3), dataView.getUint8(4), dataView.getUint8(5)
        ].map(b => String.fromCharCode(b)).join('');

        if (!['GIF87a', 'GIF89a'].includes(signature)) {
            throw new Error("Invalid GIF format");
        }
        
        // Dimensions are at offset 6 (width) and 8 (height) - little endian
        console.log({
            width: dataView.getUint16(6, true),
            height: dataView.getUint16(8, true)
        });
        return {
            width: dataView.getUint16(6, true),
            height: dataView.getUint16(8, true)
        };
    } catch (e) {
        console.error("Failed to read GIF dimensions:", e);
        throw new Error("Couldn't read GIF dimensions");
    }
}
