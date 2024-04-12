const rhythm = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
}
const duration = {
  whole: "1n",
  half: "2n",
  quarter: "4n",
  eighth: "8n",
  sixteenth: "16n"
}

let eighth_line_index = 0;
const onlyNotes = [];
const img = localStorage.getItem("image")
function draw_isRotate(note) {
  let octave = Number(note.replace(/[A-Z]|b|#|[A-Z]*|\./g, ""))
  const regular4 = ['C', 'D', 'E', 'F', 'G', 'A']
  const regular3 = 'C'
  let res = true;
  if (octave == 4) {
    regular4.map(label => {
      if (note.includes(label)) res = false;
    })
  }
  else if (octave == 3) {
    if (note.includes(regular3)) res = false;
  }
  return res
}
function draw_getRhythm(numRhythm) {
  switch (numRhythm) {
    case 0.25:
      return 'sixteen/'
    case 0.5:
      return 'eighth/'
    case 2:
      return 'half/'
    case 4:
      return 'whole/'
    default:
      return 'quarter/'

  }
}
function draw_pickSvg(note, numRhythm) {
  let octave = Number(note.replace(/[A-Z]|b|#|[A-Z]*|\./g, ""))

  let rotate = draw_isRotate(note)

  let rhytm = draw_getRhythm(numRhythm)
  let noteOrRest = 'notes';
  if (note.includes('rest')) {
    noteOrRest = 'rests'
  }
  if (octave === null || rotate === null || rhytm === null)
    console.log("somthing null")
  let path = `./img/${noteOrRest}/${rhytm}`;
  if (noteOrRest === 'rests') return path.slice(0, -1) + '.svg'
  if (!rotate) {
    if (note.includes('C') && octave == 4) {

      return path + 'lineNote.svg'
    }
    return path + 'note.svg'
  }
  else if (path.includes('whole')) {
    return path + 'note.svg'
  }
  else {
    return path + 'note_Rotate.svg'
  }
}
const getrythm = (note) => {
  note = String(note.replace(/\.$|_fermata/g, ''))
  if (String(note).endsWith("quarter"))
    return rhythm.quarter;
  if (String(note).endsWith("whole") || String(note).endsWith("1"))
    return rhythm.whole;
  if (String(note).endsWith("eighth"))
    return rhythm.eighth
  if (String(note).endsWith("half"))
    return rhythm.half;
  if (String(note).endsWith("sixteenth") || String(note).endsWith("thirty_second"))
    return rhythm.sixteenth;
  return rhythm.quarter;
}

const getNote = (note) => {
  note = String(note).replace(/^note-|_[a-z]+/g, "");
  if (note.startsWith("rest") || note.startsWith("multirest")) return "rest"
  if (note.includes("b") && note !== 'barline') {
    note = note.replace('b', '')
  }
  return note
}

const getDuration = (note) => {
  note = String(note.replace(/\.$|_fermata/g, ''))
  if (String(note).endsWith("quarter") || String(note).endsWith("1"))
    return duration.quarter;
  if (String(note).endsWith("whole"))
    return duration.whole;
  if (String(note).endsWith("eighth"))
    return duration.eighth
  if (String(note).endsWith("half"))
    return duration.half;
  if (String(note).endsWith("sixteenth") || String(note).endsWith("thirty_second"))
    return duration.sixteenth;
  return duration.quarter;
}
const isBemol = (note) => {
  if (String(note).includes("b")) {
    return 'bemol';
  } else if (String(note).includes("#")) {
    return 'Sharp';
  }
  return 'none';
}
const draw_noteToLocation = (note, getRotate) => {
  let octave = Number(note.note.replace(/[A-Z]|b|#|[A-Z]*|\./g, ""))
  let rotate = draw_isRotate(note.note)
  getRotate === false ? rotate = false : null
  let start = -7;

  if (rotate && octave == 3) {
    start = -101
  }
  else if (!rotate && octave == 4) {
    start = -7
  }
  else if (rotate && octave == 4) {
    start = -36
  }
  else if (!rotate && octave == 3) {
    start = -71
  }
  else if (rotate && octave == 5) {
    start = -2
  }

  let location = start
  let finalLocation
  let labels = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  labels.map((label) => {
    if (note.note.includes(label)) {
      finalLocation = location.toFixed()
      return finalLocation
    }
    location += 5
  })
  if (note.note.includes("rest")) {
    switch (note.rhythm) {
      case 0.25:
        finalLocation = 9
        break;
      case 0.5:
        finalLocation = 9
        break;
      case 1:
        finalLocation = 10
        break;
      case 2:
        finalLocation = 26
        break
      default:
    }
  }
  //   ToDO  //
  console.log("onlyNotes.indexOf(note.note)", onlyNotes.indexOf(note))
  if (note.rhythm === 0.5
    && !note.note.includes("rest")
    && (eighth_line_index === 4
      || (eighth_line_index === 0 && (onlyNotes[onlyNotes.indexOf(note) + 1].note.includes("barline") || onlyNotes[onlyNotes.indexOf(note) + 1].rhythm > 0.5))
    ))
    finalLocation -= 6
  if (note.rhythm > 0.5)
    eighth_line_index = 0
  return finalLocation
}
const drawNotes = () => {
  let distance = 50
  notesIndex = 0;
  onlyNotes.forEach((note, index) => {
    const divQuarter = document.getElementById('containerQuarterNoteGC')
    if (note.note.includes("barline")) {
      eighth_line_index = 0
      let upperBar = document.createElement('img')
      // let lowerBar = document.createElement('img')
      upperBar.src = './img/staff/barLine.svg'
      // lowerBar.src = './img/staff/barLine.svg'
      upperBar.style.position = 'absolute'
      // lowerBar.style.position = 'absolute'
      upperBar.style.bottom = '9px'
      // lowerBar.style.bottom = '-80px'

      upperBar.style.left = distance + 'px'
      // lowerBar.style.left = distance + 'px'
      distance += 50
      divQuarter.appendChild(upperBar)
      // divQuarter.appendChild(lowerBar)
      barFlag = 0
      return
    }
    let quarter = document.createElement('img')
    let sharp = null
    let isRotate = draw_isRotate(note.note)

    // note.rhythm === 0.5? isRotate = false : null	
    const flag = isBemol(note.note);
    if (flag !== 'none') {
      sharp = document.createElement('img')
      sharp.src = `./img/flags/${flag}.svg`
      var bottomPos = Number(draw_noteToLocation(note, isRotate));
      !isRotate ? bottomPos -= 8 : bottomPos += 20;
      const bemol = flag === 'bemol' ? 7 : 0
      sharp.style.bottom = bottomPos + bemol + 'px'
      sharp.style.position = 'absolute'
      // sharp.style.zIndex = -1

      sharp.style.left = distance - 10 + 'px'
      sharp.style.height = '30px'
      divQuarter.appendChild(sharp)
    }

    quarter.src = draw_pickSvg(note.note, note.rhythm)
    quarter.id = notesIndex
    const formatNote = formatNotes(note.note)
    quarter.setAttribute('note', formatNote)
    notesIndex++;
    console.log(quarter.id)
    let quarterPlace = draw_noteToLocation(note, isRotate)
    console.log("quarterPlace", quarterPlace, "note: ", note)
    quarter.style.bottom = quarterPlace + 'px'
    quarter.style.position = 'absolute'
    // quarter.style.zIndex = -1
    quarter.style.left = distance + 'px'
    divQuarter.appendChild(quarter)
    if (quarterPlace > 22) {
      const line = document.createElement('img');
      line.src = '/img/staff/line.svg';
      line.style.position = 'absolute';
      line.style.left = distance - 3 + 'px'
      line.style.bottom = 56 + 'px'
      line.style.zIndex = -1
      divQuarter.appendChild(line)
    }
    const isSvgChanged = createEightLine(note, index, quarterPlace, isRotate, quarter, distance, divQuarter)
    if (note.rhythm === 0.25)
      createEightLine(note, index, quarterPlace, isRotate, quarter, distance, divQuarter, true)

    if (note.note.includes('.')) {
      const dotSvg = document.createElement('img');
      dotSvg.src = './img/flags/dot.svg';
      dotSvg.style.position = 'absolute';
      dotSvg.style.height = '15px'
      dotSvg.style.width = '5px'
      let dotPlace = 50;
      !isRotate ? dotPlace -= 46 : dotPlace -= 12;
      let leftPlace = 20
      quarter.src.includes('eighth') ? leftPlace += 10 : null
      console.log(isRotate, "isRotate")
      console.log(dotPlace, "dotPlace")
      dotSvg.style.left = Number(distance) + leftPlace + 'px'
      dotSvg.style.bottom = Number(quarterPlace) + dotPlace + 'px'
      divQuarter.appendChild(dotSvg);
    }
    distance += 50
  })
  localStorage.setItem('notesLength', notesIndex)
  sampleCounter = 0
  howMany = 0
};

function formatNotes(note) {
  if (!note.includes('b'))
    return note;
  note = note.replace('b', '#')
  const regular = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  noteChar = note[0]
  let index
  if (regular.includes(noteChar)) {
    index = regular.indexOf(noteChar)
    if (index === 0) {
      index = regular.length - 1
    }
    else {
      index--;
    }
    note = note.replace(noteChar, regular[index])
  }
  return note
}

const createEightLine = (note, index, quarterPlace, isRotate, quarter, distance, divQuarter, isSecond = false) => {
  if (note.rhythm <= 0.5) {
    let eight = document.createElement('img')
    let sixteen;
    let svgCahnged = false;
    if (eighth_line_index === 4 && !isSecond)
      eighth_line_index = 0
    !isSecond ? eighth_line_index++ : null;
    if (eighth_line_index < 4 &&
      onlyNotes[index + 1]
      &&
      (
        !String(onlyNotes[index + 1].note).includes("rest")
        && (!String(onlyNotes[index + 1].note).includes("barline"))
        && onlyNotes[index + 1].rhythm <= 0.5
      )
      && (!isSecond || eighth_line_index)

    ) {
      eight.src = './img/staff/eightLine2.svg'

    }
    else {
      eight.src = ""

    }
    if (((onlyNotes[index].note.includes("rest")
    ) && eighth_line_index === 3
    ))
      eighth_line_index = 1
    eight.style.position = 'absolute';
    console.log("eighth_line_index", eighth_line_index)
    if (quarterPlace && (
      (!String(onlyNotes[index].note).includes("rest") && (!String(onlyNotes[index + 1].note).includes("barline") || eighth_line_index === 4) && onlyNotes[index + 1].rhythm <= 0.5)
      || eighth_line_index === -1
      || (String(onlyNotes[index + 1].note).includes("barline") && eighth_line_index === 4)
    )) {
      svgCahnged = true
      let rotation;
      let nextNote = draw_noteToLocation(onlyNotes[index + 1], isRotate)
      rotation = checkRotation(onlyNotes, index, eighth_line_index)
      let rotate;
      if (eighth_line_index === 1 && String(onlyNotes[index + 1].note).includes("barline"))
        return
      if (isSecond)
        rotate = getRotate(Number(quarterPlace), Number(nextNote), rotation, isSecond)
      else rotate = getRotate(Number(quarterPlace), Number(nextNote), rotation, isSecond)
      if (rotation) {
        quarter.src = './img/notes/quarter/note_Rotate.svg'

      }
      else {
        quarter.src = './img/notes/quarter/note.svg'

      }
      eight.style.bottom = (rotate.bottom) + 'px'
      console.log("nextNote", nextNote)
      console.log("currentNote", quarterPlace)

      console.log(rotate, "rotate")
      eight.style.transform = `rotate(${rotate.rotate}deg)`;

      eight.style.bottom = (rotate.bottom) + 'px'

      if (rotate.left) {
        eight.style.left = Number(distance) + 13 + rotate.left + 'px'
      }
      else
        eight.style.left = Number(distance) + 13 + 'px'
      if (rotate.width) {
        eight.style.width = rotate.width + 'px'
      }
      divQuarter.appendChild(eight)
      return svgCahnged
    }
    if (eighth_line_index === -1)
      eighth_line_index++;
  }
}

const checkRotation = (allNotes, index, rollPlace) => {
  const current = allNotes[index]
  console.log("current", current)
  rollPlace === 0 ? rollPlace = 4 : null
  for (let i = index + 1; i < index + 2 - rollPlace; i++) {

    if (allNotes[i].rhythm !== 0.5
      // && rollPlace % 2 !== 0
    )
      return false;

    if (!draw_isRotate(allNotes[i].note))
      return false;
  }
  return true
}
const getRotate = (current, next, rotation, isSecond = false) => {
  let sum, bottomSum = 0, twoWidth;
  sum = Number(((Number(current) - Number(next)) / -50).toFixed(1))

  !rotation ? rotation = 0 : rotation = 47;
  let leftRotate = !rotation ? 0 : -12;

  if (rotation !== 0) {

    console.log('sum.toFixed() before', sum)
    switch (Number(sum)) {
      case -0.5:
        rotation -= 46;
        break;
      case -0.4:
        rotation -= 43
        twoWidth = -2
        leftRotate += 11
        break;
      case -0.2:
        rotation -= 47
        leftRotate -= 1
        twoWidth = -1
        break;
      case -0.1:
        rotation -= 20;
        leftRotate -= 1
        break;
      case 0:
        rotation -= 5;
        leftRotate -= 1
        break;
      case 0.1:
        rotation -= 46;
        leftRotate -= 1
        break;
      case 0.2:
        rotation -= 47
        leftRotate -= 1
        break
      case 0.4:
        break;
      case 0.5:
        rotation -= 46
        twoWidth = 2
        leftRotate += 2
    }
  }
  isSecond ? rotation -= 7 : null
  sum === 0.5 && isSecond ? rotation -= 2 : null;
  console.log("sum.toFixed()", sum)
  switch (Number(sum)) {
    case -0.5:
      return { rotate: 23, bottom: Number(current) - 10.5 - rotation, left: -14, width: 55 }
    case -0.4:
      return { rotate: 19, bottom: Number(current) - 10 - rotation, left: -14 - leftRotate, width: 55 + twoWidth }
    case -0.3:
      return { rotate: 14, bottom: Math.abs(Number(current) - Number(next)).toPrecision(2) + 33.5 - Math.abs(sum + 4) - rotation, width: 53 }
    case -0.2:
      return { rotate: 7, bottom: Number(current) - 7 - rotation, left: leftRotate, width: 53 + twoWidth }
    case -0.1:
      return { rotate: 5, bottom: Number(current) + 21 - rotation - bottomSum, left: leftRotate }
    case 0:
      return { rotate: sum, bottom: Number(current) + 40 - rotation, left: leftRotate }
    case 0.1:
      return { rotate: -5, bottom: Number(current) - rotation, left: leftRotate }
    case 0.2:
      return { rotate: -10, bottom: Number(current) + 3 - rotation, left: leftRotate }
    case 0.4:
      return { rotate: -18, bottom: Number(current) + 55 - rotation, left: -3 + leftRotate, width: +55 }
    case 0.5:
      return { rotate: -30, bottom: Number(current) + 11 - rotation, left: -8 + leftRotate, width: 61 - twoWidth }
    case 0.6:
      return { rotate: -30, bottom: Number(current) + 54 - rotation, left: -4 + leftRotate, width: 100 - twoWidth }
    default:
      return { rotate: -5, bottom: Number(current) - rotation, left: leftRotate }
  }
}
let keySig = null
const createNotes = () => {
  let data = localStorage.getItem("data")
  if (!data)
    return
  console.log(data)
  data = data.split(',')

  data.forEach(note => {
    if (!String(note).startsWith("note") && !String(note).startsWith("rest") &&
      !String(note).startsWith("multirest") && !String(note).startsWith("barline")) {
      if (String(note).startsWith("key")) {
        keySig = note;
      }
      return;
    }
    onlyNotes.push({ note: getNote(note, keySig), duration: getDuration(note), rhythm: getrythm(note) })
  })
  console.log("play Midi")
  console.log(onlyNotes)
  drawNotes();
}

var playMidi = () => {
  const sampler = new Tone.Sampler({
    urls: {
      "C4": "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      "A4": "A4.mp3",
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination();

  Tone.loaded().then(() => {
    time = 0
    const now = Tone.now()
    const childrens = document.getElementById("containerQuarterNoteGC").children
    let index = 0;
    onlyNotes.forEach((note) => {
      if (note.note === "barline")
        return;
      if (note.note !== "rest") {
        setTimeout(() => {
          console.log(childrens[index])
        })
        sampler.triggerAttackRelease(note.note, note.duration, now + time)
      }
      time += note.rhythm / 2
    })
    for (var i = 0; i < childrens.length; i++) {
      Tone.Transport.schedule((time) => {
        // use the time argument to schedule a callback with Draw
        Tone.Draw.schedule(() => {
          // do drawing or DOM manipulation here
          try {
            childrens[index].style.background = 'green'
          } catch (e) {
            console.error(e);
          }
          index++
          time += 0.5
        }, time);
      }, "+0.5");
    }
  })
}
createNotes()