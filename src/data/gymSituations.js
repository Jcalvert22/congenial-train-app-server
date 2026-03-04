export const GYM_SITUATIONS = [
  {
    id: 'someone_waiting',
    title: 'Someone is waiting for your machine',
    tip: 'Finish your set, then offer to alternate. You don’t need to rush — just stay aware.'
  },
  {
    id: 'work_in_request',
    title: 'You want to work in with someone',
    tip: 'Wait for a pause and ask, “Mind if I work in between sets?” Most people say yes.'
  },
  {
    id: 'equipment_taken',
    title: 'Someone is using the equipment you need',
    tip: 'Check how many sets they have left. If it’s several, choose an alternative.'
  },
  {
    id: 'machine_confusion',
    title: 'You’re unsure how to adjust a machine',
    tip: 'Look at the diagram or ask for help — people love helping with machines.'
  },
  {
    id: 'feeling_watched',
    title: 'You feel like people are watching you',
    tip: 'Most people are focused on themselves. A slow, controlled tempo looks confident.'
  },
  {
    id: 'cleaning_equipment',
    title: 'You need to clean equipment',
    tip: 'Wipe the seat and handles. It takes a few seconds and everyone appreciates it.'
  },
  {
    id: 'dumbbell_space',
    title: 'You’re unsure where to stand with dumbbells',
    tip: 'Stand a few feet back from the rack so others can grab weights.'
  },
  {
    id: 'rest_time',
    title: 'You’re unsure how long to rest',
    tip: '60–90 seconds is standard. If someone is waiting, lean shorter.'
  },
  {
    id: 'switching_attachments',
    title: 'You need to switch cable attachments',
    tip: 'Unclip the handle, hang it up, and clip yours on. Totally normal.'
  },
  {
    id: 'taking_too_long',
    title: 'You’re worried about taking too long',
    tip: 'As long as you’re doing your sets and not sitting on equipment, you’re fine.'
  },
  {
    id: 'moving_plates',
    title: 'You need to move someone’s plates',
    tip: 'Ask, “Are you using this?” If not, it’s yours to use.'
  },
  {
    id: 'warming_up',
    title: 'You’re unsure where to warm up',
    tip: 'Use an open floor space or free bench and keep movements compact.'
  }
];

export const getGymSituationById = id => GYM_SITUATIONS.find(situation => situation.id === id) || null;
