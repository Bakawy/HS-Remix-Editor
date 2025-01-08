//Main Section
let modifiedContent = null; // This will hold the modified blob
let fileName = "";
let trackNumber;
let pitchShift;
let beatOffset;
let msOffset;
let frameList = [];
let imageIndexList = [];
const errorText = "Bakawi messed up somehow \n";

window.onload = applySavedTheme;

document.getElementById("videoBGColor").addEventListener("change", updateVideoEditorBackground);

document.getElementById("themeToggleButton").addEventListener("click", () => {
    try {
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
    } catch (e) {
        alert(errorText + e.stack);
    }
});

document.getElementById('trackNumber').oninput = function() {
    try {
        document.getElementById('trackNumberValue').textContent = this.value;
    } catch (e) {
        alert(errorText + e.stack)
    }
};

document.getElementById('opacity').oninput = function() {
    try {
        document.getElementById('opacityValue').textContent = `${this.value}%`;
    } catch (e) {
        alert(errorText + e.stack)
    }
};

document.getElementById('chromaKeyToggle').addEventListener('change', () => {
    try {
        document.getElementById('chromaKeyColor').disabled = !document.getElementById('chromaKeyToggle').checked;
    } catch (e) {
        alert(errorText + e.stack)
    }
});

document.getElementById('checkLastToggle').addEventListener('change', () => {
    try {
        document.getElementById('checkLast').disabled = document.getElementById('checkLastToggle').checked;
    } catch (e) {
        alert(errorText + e.stack)
    }
});

document.getElementById('layer').oninput = function() {
    try {
        document.getElementById('layerValue').textContent = this.value;
    } catch (e) {
        alert(errorText + e.stack)
    }
};

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
    try {
        const fps = parseInt(document.getElementById("fpsInput").value, 10) || 30;
        const bpm = remix["tempoChanges"][0]["dynamicData"]["tempo"]
        const bpf = (bpm / (60 * fps)) // beats per frame
        let track = parseInt(document.getElementById('trackNumber').value, 10) - 1;
        if (track < 0) {track = 10}
        const layer = parseInt(document.getElementById("layer").value, 10);
        const xPos = parseFloat(document.getElementById("xPos").value, 10);
        const yPos = parseFloat(document.getElementById("yPos").value, 10);
        const width = parseFloat(document.getElementById("width").value, 10);
        const height = parseFloat(document.getElementById("height").value, 10);
        let beat = parseFloat(beatOffset) + (parseFloat(msOffset) / 1000) / (60 / bpm);
        for (let i = 0; i < imageIndexList.length; i++) {
            const index = imageIndexList[i]
            const imageFile = frameList[index]
            if (!(imageFile)) {continue;}
            let iN = imageFile.name
            const imageName = imageFile.name.substring(0, iN.length - 4);
            remix["entities"] = remix["entities"].concat([
                {"type":"riq__Entity","version":1,"datamodel":"vfx/display decal","beat":beat,"length":bpf,"dynamicData":{"track":track,"sprite":imageName,"ease":1,"layer":layer,"sX":0.0,"sY":0.0,"sWidth":1.0,"sHeight":1.0,"sColor":{"r":1.0,"g":1.0,"b":1.0,"a":1.0},"eX":xPos,"eY":yPos,"eWidth":width,"eHeight":height,"eColor":{"r":1.0,"g":1.0,"b":1.0,"a":1.0}}}
            ])
            beat += bpf
        }
        if (false) {
            const True = true
            const False = false
            const bpm = remix["tempoChanges"][0]["dynamicData"]["tempo"]
            const bo = parseFloat(beatOffset)
            const mo = parseFloat(msOffset)
            const tn = parseInt(trackNumber) - 1
            const ps = parseInt(pitchShift)
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
        return remix;
    } catch (e) {
        alert(errorText + e.stack)
    }
}

function loadAndModifyRIQ(fileInput = "none") {
    try {
        if (fileInput == "none") {
            fileInput = document.getElementById('riqFileInput');
        }
        
        trackNumber = document.getElementById('trackNumber').value;
        beatOffset = document.getElementById('beatOffset').value;
        msOffset = document.getElementById('msOffset').value;
    
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
    } catch (e) {
        alert(errorText + e.stack)
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
document.getElementById('videoInput').addEventListener('change', function(event) {
    try {
        const file = event.target.files[0];
        if (file) {
            const videoElement = document.getElementById('videoPreview');
            const widthInput = document.getElementById('resolutionWidth');
            const heightInput = document.getElementById('resolutionHeight');
            videoElement.src = URL.createObjectURL(file);
            videoElement.load();
            videoElement.addEventListener( "loadedmetadata", function () {
                // retrieve dimensions
                widthInput.placeholder = this.videoWidth;
                heightInput.placeholder  = this.videoHeight;

            }, false);
        }
    } catch (e) {
        alert(errorText + e.stack)
    }
});

document.getElementById('applyChangesButton').addEventListener('click', async () => {
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
        const fps = parseInt(document.getElementById("fpsInput").value, 10) || 30;
        const opacity = parseInt(document.getElementById("opacity").value, 10) || 100;

        if (!videoInput.files.length) {
            alert("Please select a video file.");
            return;
        }

        document.getElementById('loadingIndicator').style.display = 'block';

        const file = videoInput.files[0];
        processVideo(file, targetWidth, targetHeight, chromaKeyRgb, fps, opacity);
    } catch (e) {
        alert(errorText + e.stack)
    }
});

async function processVideo(file, targetWidth, targetHeight, chromaKeyRgb, fps, opacity) {
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

                ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
                if (opacity < 100) {
                    adjustOpacity(ctx, targetWidth, targetHeight, opacity);
                }
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

        // Move to the next frame
async function reassembleVideoFromFrames(canvas, fps, uniqueFrames, frameIndexList, videoPreview) {
    try {
        const ctx = canvas.getContext('2d');
        const stream = canvas.captureStream(fps);
        const chunks = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

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

function adjustOpacity(ctx, width, height, percentage) {
    try {
        const imageData = ctx.getImageData(0, 0, width, height, {});
        const data = imageData.data;

        // Clamp the percentage to the range [0, 100]
        const factor = Math.max(0, Math.min(percentage, 100)) / 100;

        for (let i = 0; i < data.length; i += 4) {
            // Scale the alpha channel (data[i + 3]) by the factor
            data[i + 3] = Math.floor(data[i + 3] * factor);
        }

        ctx.putImageData(imageData, 0, 0);
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

async function extractFramesAsPNGs(file, targetWidth, targetHeight, fps, chromaKeyColor, opacity) {
    try {
        const canvas = document.getElementById('frameCanvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const tempFrames = []; // Temporary storage for frames with indices
        const frameIndexList = [];
        const uniqueImageDataList = [];
        const chromaKeyRgb = hexToRgb(chromaKeyColor);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
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
            
                ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
            
                // Apply chroma key effect
                if (opacity < 100) {
                    adjustOpacity(ctx, targetWidth, targetHeight, opacity);
                }
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
    } catch (e) {
        alert(errorText + e.stack)
    }
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

function saveFramesAsFiles(fList) {
    try {
        const updatedFrameList = [];
        fList.forEach((frame, index) => {
            if (frame.blob) {
                const fileName = `frame_${frame.index + 1}.png`;
                const file = new File([frame.blob], fileName, { type: 'image/png' });

                // Save the first frame as a test image
                if (index === 0) {
                    const testImageFileName = 'test_image.png';
                    const testImageFile = new File([frame.blob], testImageFileName, { type: 'image/png' });

                    // Save or process the test image as needed
                    console.log(`Test image saved: ${testImageFileName}`);
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(testImageFile);
                    a.download = testImageFileName;
                    a.click();
                    URL.revokeObjectURL(a.href);
                }

                updatedFrameList.push(file);
            } else {
                console.warn(`Skipping corrupted or empty frame at index ${frame.index}`);
            }
        });

        // Replace the original frameList with the updated one
        frameList.length = 0;
        updatedFrameList.forEach((file) => frameList.push(file));

        console.log('Frames saved as File objects in frameList:', frameList);

        document.getElementById('loadingIndicator').style.display = 'none';
    } catch (e) {
        alert(errorText + e.stack)
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

function hashImageData(imageData) {
    try {
        const { data } = imageData;
        const colorList = [];
        for (let i = 0; i < data.length; i += 4) {
            const color = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`;
            colorList.push(color);
        }
        return colorList.join('|'); // Join all colors into a single string to create a unique hash
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
        const videoInput = document.getElementById("videoInput");
        const targetWidth = parseInt(document.getElementById("resolutionWidth").value, 10) || parseInt(document.getElementById('resolutionWidth').placeholder);
        const targetHeight = parseInt(document.getElementById("resolutionHeight").value, 10) || parseInt(document.getElementById('resolutionHeight').placeholder);
        const fps = parseInt(document.getElementById("fpsInput").value, 10) || 30;
        const chromaKeyColor = document.getElementById("chromaKeyColor").value;
        const opacity = parseInt(document.getElementById("opacity").value, 10) || 100;    

        if (!videoInput.files.length) {
            alert("Please select a video file.");
            return;
        }

        document.getElementById('loadingIndicator').style.display = 'block';

        const file = videoInput.files[0];
        extractFramesAsPNGs(file, targetWidth, targetHeight, fps, chromaKeyColor, opacity);
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