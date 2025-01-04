//Main Section
let modifiedContent = null; // This will hold the modified blob
let fileName = "";
let trackNumber;
let pitchShift;
let beatOffset;
let msOffset;
let frameFiles = [];
let hi;
document.getElementById('trackNumber').oninput = function() {
    document.getElementById('trackNumberValue').textContent = this.value;
};
document.getElementById('pitchShift').oninput = function() {
    document.getElementById('pitchShiftValue').textContent = this.value;
};

function modifyRemix(remix) {
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
        console.log(remix["entities"])
        return remix;
    }

function loadAndModifyRIQ(fileInput = "none") {
    if (fileInput == "none") {
        fileInput = document.getElementById('riqFileInput');
    }
    trackNumber = document.getElementById('trackNumber').value;
    pitchShift = document.getElementById('pitchShift').value;
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

function useModifiedAsInput() {
    fi = {
        files: [modifiedContent]
    }
    loadAndModifyRIQ(fi);
}

function downloadModifiedRIQ() {
    if (modifiedContent) {
        saveAs(modifiedContent, modifiedContent.name); // Use FileSaver.js to save the file
    } else {
        alert('No modified file to download.');
    }
}
//Video Editor
let rerun = false;
document.getElementById("videoBGColor").addEventListener('change', function(event) {
    const bgColor = event.target.value;
    const videoEditor = document.getElementsByClassName('video-editor')[0];
    
    // Set the background color
    videoEditor.style.backgroundColor = bgColor;

    // Calculate the inverted color for text
    const invertedColor = invertColor(bgColor);
    videoEditor.style.color = invertedColor;
});

function invertColor(hex) {
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
}
document.getElementById('videoInput').addEventListener('change', function(event) {
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
});
document.getElementById('applyChangesButton').addEventListener('click', async () => {
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

        if (!videoInput.files.length) {
            alert("Please select a video file.");
            return;
        }

        document.getElementById('loadingIndicator').style.display = 'block';

        const file = videoInput.files[0];
        processVideo(file, targetWidth, targetHeight, chromaKeyRgb, fps);
});

async function processVideo(file, targetWidth, targetHeight, chromaKeyRgb, fps) {
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
        if (videoElement.currentTime >= videoElement.duration) {
            console.log('Frame processing completed. Total unique frames:', uniqueFrames.length);
            console.log('Frame index list:', frameIndexList);

            // Reassemble the final video
            await reassembleVideoFromFrames(canvas, fps, uniqueFrames, frameIndexList, videoPreview);
            document.getElementById('loadingIndicator').style.display = 'none';
            return;
        }

        ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

        applyChromaKey(ctx, targetWidth, targetHeight, chromaKeyRgb);

        const currentImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

        let isDuplicate = false;
        for (let i = 0; i < uniqueImageDataList.length; i++) {
            const diffScore = calculateDifferenceScore(currentImageData, uniqueImageDataList[i]);
            if (diffScore < differenceThreshold) {
                frameIndexList.push(i);
                isDuplicate = true;
                console.log(`diffScore: ${diffScore}, threshold: ${differenceThreshold}`);
                break;
            }
        }

        if (!isDuplicate) {
            const uniqueIndex = uniqueFrames.length;
            uniqueFrames.push(ctx.getImageData(0, 0, targetWidth, targetHeight));
            uniqueImageDataList.push(currentImageData);
            frameIndexList.push(uniqueIndex);
        }

        // Update progress bar
        const processedFrames = videoElement.currentTime * fps;
        const progressPercentage = Math.min(100, ((processedFrames / totalFrames) * 100).toFixed(2));
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${progressPercentage}%`;

        videoElement.currentTime += frameInterval;
    }

    videoElement.addEventListener('seeked', processFrame);

    videoElement.currentTime = 0;
}

async function reassembleVideoFromFrames(canvas, fps, uniqueFrames, frameIndexList, videoPreview) {
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
}

function applyChromaKey(ctx, width, height, chromaKeyRgb, threshold = 50) {
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
}

async function extractFramesAsPNGs(file, targetWidth, targetHeight, fps, chromaKeyColor) {
    const canvas = document.getElementById('frameCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const uniqueFrames = [];
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
        if (videoElement.currentTime >= videoElement.duration) {
            console.log('All frames processed. Total unique frames:', uniqueFrames.length);
            console.log('Frame index list:', frameIndexList);
            saveFramesAsFiles(uniqueFrames);
            return;
        }

        ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

        // Apply chroma key effect
        applyChromaKey(ctx, targetWidth, targetHeight, chromaKeyRgb);

        // Get frame data
        const currentImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

        // Check for similarity with existing unique frames
        let isDuplicate = false;
        for (let i = 0; i < uniqueImageDataList.length; i++) {
            const diffScore = calculateDifferenceScore(currentImageData, uniqueImageDataList[i]);
            if (diffScore < differenceThreshold) {
                frameIndexList.push(i);
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) {
            // Save the frame as a unique PNG blob
            canvas.toBlob((blob) => {
                if (blob && blob.size > 0) {
                    const uniqueIndex = uniqueFrames.length;
                    uniqueFrames.push({ index: uniqueIndex, blob });
                    uniqueImageDataList.push(currentImageData); // Store unique frame data
                    frameIndexList.push(uniqueIndex);
                } else {
                    console.warn('Blob creation failed or is empty for frame');
                }
            }, 'image/png');
        }

        // Update progress
        processedFrames++;
        const progressPercentage = Math.min(100, ((processedFrames / totalFrames) * 100).toFixed(2));
        document.getElementById('progressBar').style.width = `${progressPercentage}%`;
        document.getElementById('progressText').textContent = `${progressPercentage}%`;

        // Move to the next frame
        videoElement.currentTime += frameInterval;
    }

    videoElement.addEventListener('seeked', processFrame);

    // Start processing frames
    videoElement.currentTime = 0;
}

function calculateDifferenceScore(imageData1, imageData2) {
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
}

function saveFramesAsFiles(frameList) {
    const updatedFrameList = [];

    frameList.forEach((frame) => {
        if (frame.blob) {
            const fileName = `frame_${frame.index + 1}.png`;
            const file = new File([frame.blob], fileName, { type: 'image/png' });
            updatedFrameList.push(file);
        } else {
            console.warn(`Skipping corrupted or empty frame at index ${frame.index}`);
        }
    });

    // Replace the original frameList with the updated one
    frameList.length = 0; // Clear the existing array
    updatedFrameList.forEach((file) => frameList.push(file));

    console.log('Frames saved as File objects in frameList:', frameList);

    document.getElementById('loadingIndicator').style.display = 'none';
}

function downloadFramesAsZip(frameList) {
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
}

function hashImageData(imageData) {
    const { data } = imageData;
    const colorList = [];
    for (let i = 0; i < data.length; i += 4) {
        const color = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`;
        colorList.push(color);
    }
    return colorList.join('|'); // Join all colors into a single string to create a unique hash
}


document.getElementById("extractFramesButton").addEventListener("click", () => {
    if (document.getElementById('loadingIndicator').style.display == 'block') {
        alert("Please wait for the previous operation to complete.");
        return;
    }
    const videoInput = document.getElementById("videoInput");
    const targetWidth = parseInt(document.getElementById("resolutionWidth").value, 10) || parseInt(document.getElementById('resolutionWidth').placeholder);
    const targetHeight = parseInt(document.getElementById("resolutionHeight").value, 10) || parseInt(document.getElementById('resolutionHeight').placeholder);
    const fps = parseInt(document.getElementById("fpsInput").value, 10) || 30;
    const chromaKeyColor = document.getElementById("chromaKeyColor").value;

    if (!videoInput.files.length) {
        alert("Please select a video file.");
        return;
    }

    document.getElementById('loadingIndicator').style.display = 'block';

    const file = videoInput.files[0];
    extractFramesAsPNGs(file, targetWidth, targetHeight, fps, chromaKeyColor);
});


function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}